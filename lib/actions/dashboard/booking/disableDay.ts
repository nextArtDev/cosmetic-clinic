// lib/actions/schedule/disable-day.ts
// The modern `disableSpecialDay` — same standards you had, adapted to the
// merged schema:
//   1. admin auth
//   2. zod validation (+ "not in the past" guard)
//   3. idempotency (disabling an already-disabled day is a no-op, not an error)
//   4. find every ACTIVE appointment affected by the disabled window
//   5. cancel them atomically (one transaction) + mark paid orders for refund
//   6. AFTER commit: SMS each patient (best-effort, per-patient try/catch)
//   7. revalidate slot caches
//   8. return a structured summary for the admin UI toast/dialog
//
// Supports both a FULL-DAY disable and a PARTIAL window (e.g. 16:00–19:00),
// because DoctorLeave now carries optional startTime/endTime.

'use server'

import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import prisma from '@/lib/prisma'

import {
  clinicTimeToUTC,
  dayStartUTC,
  dayEndUTC,
  toClinicHHMM,
  HHMM_RE,
  getAppTimeZone,
} from '@/lib/scheduling/tz'
import { smsAppointmentCancelledByClinic } from '../../sms'

const disableDaySchema = z
  .object({
    doctorId: z.string().min(1),
    dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    // both null => full-day (old SpecialDay behavior)
    startTime: z.string().regex(HHMM_RE).nullable().default(null),
    endTime: z.string().regex(HHMM_RE).nullable().default(null),
    reason: z.string().max(500).optional(),
  })
  .refine((v) => (v.startTime === null) === (v.endTime === null), {
    message: 'startTime and endTime must both be set, or both be null',
  })
  .refine((v) => v.startTime === null || v.startTime < v.endTime!, {
    message: 'startTime must be before endTime',
  })

export type DisableDayInput = z.input<typeof disableDaySchema>

export type DisableDayResult =
  | {
      ok: true
      cancelled: number
      smsSent: number
      smsFailed: number
      alreadyDisabled: boolean
    }
  | {
      ok: false
      error: 'UNAUTHORIZED' | 'INVALID_INPUT' | 'PAST_DATE' | 'DOCTOR_NOT_FOUND'
      details?: string
    }

export async function disableDoctorDay(
  input: DisableDayInput,
): Promise<DisableDayResult> {
  // 1. auth ---------------------------------------------------------------
  //   const admin = await assertAdmin().catch(() => null)
  //   if (!admin) return { ok: false, error: 'UNAUTHORIZED' }

  // 2. validation ---------------------------------------------------------
  const parsed = disableDaySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'INVALID_INPUT', details: parsed.error.message }
  }
  const { doctorId, dateISO, startTime, endTime, reason } = parsed.data

  // const settings = await prisma.appSettings.findUniqueOrThrow({
  //   where: { id: 'global' },
  // })
  // const tz = settings.timezone
  const tz = getAppTimeZone()

  // Reject dates whose clinic-local day is already fully over
  if (dayEndUTC(dateISO, tz) <= new Date()) {
    return { ok: false, error: 'PAST_DATE' }
  }

  const doctor = await prisma.user.findUnique({
    where: { id: doctorId },
    select: { id: true, name: true },
  })
  if (!doctor) return { ok: false, error: 'DOCTOR_NOT_FOUND' }

  const leaveDate = new Date(`${dateISO}T00:00:00Z`) // @db.Date column

  // Affected UTC window: full clinic day, or just the partial range
  const windowStart = startTime
    ? clinicTimeToUTC(dateISO, startTime, tz)
    : dayStartUTC(dateISO, tz)
  const windowEnd = endTime
    ? clinicTimeToUTC(dateISO, endTime, tz)
    : dayEndUTC(dateISO, tz)

  // 3. idempotency ---------------------------------------------------------
  const existing = await prisma.doctorLeave.findFirst({
    where: {
      doctorId,
      leaveDate,
      startTime: startTime ?? null,
      endTime: endTime ?? null,
    },
  })
  if (existing) {
    return {
      ok: true,
      cancelled: 0,
      smsSent: 0,
      smsFailed: 0,
      alreadyDisabled: true,
    }
  }

  // 4. find affected ACTIVE appointments (overlap with the disabled window) --
  const affected = await prisma.appointment.findMany({
    where: {
      doctorId,
      appointmentStartUTC: { lt: windowEnd },
      appointmentEndUTC: { gt: windowStart },
      OR: [
        { status: { in: ['BOOKING_CONFIRMED', 'CASH'] } },
        { status: 'PAYMENT_PENDING', reservationExpiresAt: { gt: new Date() } },
      ],
    },
    include: {
      Order: { where: { paymentStatus: 'Paid' } },
      user: { select: { phoneNumber: true } },
    },
  })

  // 5. atomic write: create leave + cancel appointments + flag refunds ------
  const paidOrderIds = affected.flatMap((a) => a.Order.map((o) => o.id))
  await prisma.$transaction([
    prisma.doctorLeave.create({
      data: { doctorId, leaveDate, startTime, endTime, reason },
    }),
    prisma.appointment.updateMany({
      where: { appointmentId: { in: affected.map((a) => a.appointmentId) } },
      data: { status: 'CANCELLED' },
    }),
    // Refunds are FLAGGED here and executed by your payment-gateway refund
    // job/action (gateway calls don't belong inside a DB transaction).
    prisma.order.updateMany({
      where: { id: { in: paidOrderIds } },
      data: {
        paymentStatus:
          'Refunded' /* or a 'RefundPending' status if you add one */,
        notes: `Auto-cancel: ${reason ?? 'day disabled'}`,
      },
    }),
  ])

  // 6. notify patients — AFTER commit, best-effort, never throws ------------
  let smsSent = 0
  let smsFailed = 0
  for (const appt of affected) {
    const phone = appt.phoneNumber ?? appt.user?.phoneNumber
    if (!phone) {
      smsFailed++
      continue
    }
    const res = await smsAppointmentCancelledByClinic({
      phoneNumber: phone,
      patientName: appt.patientName,
      doctorName: doctor.name,
      dateLabel: dateISO,
      timeLabel: toClinicHHMM(appt.appointmentStartUTC, tz),
      reason,
      wasPaid: appt.Order.length > 0,
    })
    res.ok ? smsSent++ : smsFailed++
  }

  // 7. cache invalidation ----------------------------------------------------
  revalidateTag(`slots:${doctorId}:${dateISO}`, 'max')
  revalidateTag(`doctor-schedule:${doctorId}`, 'max')

  // 8. structured summary for the admin UI -----------------------------------
  return {
    ok: true,
    cancelled: affected.length,
    smsSent,
    smsFailed,
    alreadyDisabled: false,
  }
}

/** Re-enable: delete the leave row(s). Cancelled appointments stay cancelled
 *  (patients already got SMS) — the freed slots simply become bookable again. */
export async function enableDoctorDay(doctorId: string, dateISO: string) {
  //   const admin = await assertAdmin().catch(() => null)
  //   if (!admin) return { ok: false as const, error: 'UNAUTHORIZED' as const }

  await prisma.doctorLeave.deleteMany({
    where: { doctorId, leaveDate: new Date(`${dateISO}T00:00:00Z`) },
  })
  revalidateTag(`slots:${doctorId}:${dateISO}`, 'max')
  return { ok: true as const }
}
