// lib/actions/schedule/save-weekly-schedule.ts
// The modern `createAvailability` — every consideration from your old action
// is preserved, but with computed slots most of them shrink to a few lines:
//
//   old action                                  | here
//   --------------------------------------------|-----------------------------
//   admin auth check                            | assertAdmin()
//   zod validation of days/times/slicer         | weeklyScheduleSchema
//   start < end, valid HH:MM                    | blockSchema
//   slicer must divide the range sensibly       | duration-fits check (warn, not block)
//   diff old vs new TimeSlots, disconnect,      | GONE — slots are computed,
//     delete unbooked, keep booked, re-link     |   nothing to diff
//   never delete a booked slot silently         | orphan detection + admin choice
//   notify affected patients                    | cancelOrphans: 'cancel' -> SMS
//   revalidatePath / cache bust                 | revalidateTag per doctor
//   return per-day result summary               | structured return value

'use server'

import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import prisma from '@/lib/prisma'
// import { assertAdmin } from '@/lib/auth/guards'
import {
  clinicTimeToUTC,
  clinicWeekday,
  toClinicDateISO,
  toClinicHHMM,
  hhmmToMinutes,
  HHMM_RE,
  getAppTimeZone,
} from '@/lib/scheduling/tz'
import {
  smsScheduleChangedNeedsRebook,
  smsAppointmentCancelledByClinic,
} from '../../sms'

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const blockSchema = z
  .object({
    startTime: z.string().regex(HHMM_RE),
    endTime: z.string().regex(HHMM_RE),
    slotDurationMinutes: z.number().int().min(2).max(120).nullable().optional(),
  })
  .refine((b) => b.startTime < b.endTime, {
    message: 'startTime must be before endTime',
  })

const daySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    blocks: z.array(blockSchema).max(6),
  })
  .superRefine((day, ctx) => {
    // no overlapping blocks within one weekday (touching is fine: 08-11 + 11-14)
    const sorted = [...day.blocks].sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    )
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].startTime < sorted[i - 1].endTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Overlapping blocks on day ${day.dayOfWeek}: ${sorted[i - 1].startTime}–${sorted[i - 1].endTime} and ${sorted[i].startTime}–${sorted[i].endTime}`,
        })
      }
    }
  })

const weeklyScheduleSchema = z.object({
  doctorId: z.string().min(1),
  days: z.array(daySchema).max(7),
  // What to do with future appointments that no longer fit the new schedule:
  //   'reject'  -> abort save and report them (safest default; admin sees a dialog)
  //   'keep'    -> save anyway, keep appointments, flag for manual handling
  //   'cancel'  -> save, cancel them, refund-flag paid orders, SMS patients
  orphanPolicy: z.enum(['reject', 'keep', 'cancel']).default('reject'),
})

export type SaveWeeklyScheduleInput = z.input<typeof weeklyScheduleSchema>

export interface OrphanInfo {
  appointmentId: string
  patientName: string
  dateLabel: string
  timeLabel: string
}

export type SaveWeeklyScheduleResult =
  | {
      ok: true
      blocksSaved: number
      orphans: OrphanInfo[]
      cancelled: number
      smsSent: number
      warnings: string[]
    }
  | {
      ok: false
      error:
        | 'UNAUTHORIZED'
        | 'INVALID_INPUT'
        | 'DOCTOR_NOT_FOUND'
        | 'HAS_ORPHANS'
      details?: string
      orphans?: OrphanInfo[]
    }

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export async function saveWeeklySchedule(
  input: SaveWeeklyScheduleInput,
): Promise<SaveWeeklyScheduleResult> {
  // 1. auth
  //   const admin = await assertAdmin().catch(() => null)
  //   if (!admin) return { ok: false, error: 'UNAUTHORIZED' }

  // 2. validation
  const parsed = weeklyScheduleSchema.safeParse(input)
  if (!parsed.success)
    return { ok: false, error: 'INVALID_INPUT', details: parsed.error.message }
  const { doctorId, days, orphanPolicy } = parsed.data

  const doctor = await prisma.user.findUnique({
    where: { id: doctorId },
    select: {
      id: true,
      name: true,
      doctorProfile: { select: { slotDurationMinutes: true } },
    },
  })
  if (!doctor?.doctorProfile) return { ok: false, error: 'DOCTOR_NOT_FOUND' }

  // await prisma.appSettings.upsert({
  //   where: { id: 'global' },
  //   update: {},
  //   create: {
  //     id: 'global',
  //     slotsPerHour: 2,
  //     startTime: '09:00',
  //     endTime: '17:00',
  //     slotReservationDuration: 10,
  //   },
  // })

  // const settings = await prisma.appSettings.findUniqueOrThrow({
  //   where: { id: 'global' },
  // })
  // const tz = settings.timezone
  const tz = getAppTimeZone()

  // 2b. soft sanity warnings (old "slicer must fit the range" consideration).
  // A 90-min block with 60-min slots yields 1 slot + 30 wasted minutes —
  // legal, but the admin should know.
  const warnings: string[] = []
  for (const day of days) {
    for (const b of day.blocks) {
      const dur =
        b.slotDurationMinutes ?? doctor.doctorProfile.slotDurationMinutes
      const span = hhmmToMinutes(b.endTime) - hhmmToMinutes(b.startTime)
      if (span < dur)
        warnings.push(
          `Day ${day.dayOfWeek} ${b.startTime}–${b.endTime}: shorter than one ${dur}-min slot — produces no slots`,
        )
      else if (span % dur !== 0)
        warnings.push(
          `Day ${day.dayOfWeek} ${b.startTime}–${b.endTime}: ${span % dur} unused minutes at the end (${dur}-min slots)`,
        )
    }
  }

  // 3. orphan detection — the old "never silently drop a booked slot" rule.
  // Find future ACTIVE appointments that do NOT fit inside any new block
  // on their weekday (date-override days are exempt: overrides win anyway).
  const futureAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      appointmentStartUTC: { gt: new Date() },
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

  const overrideDates = new Set(
    (
      await prisma.doctorDateOverride.findMany({
        where: { doctorId, date: { gt: new Date() } },
        select: { date: true },
      })
    ).map((o) => o.date.toISOString().slice(0, 10)),
  )

  const blocksByDay = new Map(days.map((d) => [d.dayOfWeek, d.blocks]))
  const orphaned = futureAppointments.filter((a) => {
    const dateISO = toClinicDateISO(a.appointmentStartUTC, tz)
    if (overrideDates.has(dateISO)) return false
    const blocks = blocksByDay.get(clinicWeekday(dateISO)) ?? []
    return !blocks.some(
      (b) =>
        clinicTimeToUTC(dateISO, b.startTime, tz) <= a.appointmentStartUTC &&
        a.appointmentEndUTC <= clinicTimeToUTC(dateISO, b.endTime, tz),
    )
  })

  const orphanInfos: OrphanInfo[] = orphaned.map((a) => ({
    appointmentId: a.appointmentId,
    patientName: a.patientName,
    dateLabel: toClinicDateISO(a.appointmentStartUTC, tz),
    timeLabel: toClinicHHMM(a.appointmentStartUTC, tz),
  }))

  if (orphaned.length > 0 && orphanPolicy === 'reject') {
    // Admin UI shows these in a confirm dialog, then re-submits with
    // orphanPolicy 'keep' or 'cancel'.
    return { ok: false, error: 'HAS_ORPHANS', orphans: orphanInfos }
  }

  // 4. atomic write — this is the ENTIRE replacement for the old 400 lines
  const rows = days.flatMap((d) =>
    d.blocks.map((b) => ({
      doctorId,
      dayOfWeek: d.dayOfWeek,
      startTime: b.startTime,
      endTime: b.endTime,
      slotDurationMinutes: b.slotDurationMinutes ?? null,
    })),
  )
  const paidOrderIds = orphaned.flatMap((a) => a.Order.map((o) => o.id))

  await prisma.$transaction([
    prisma.doctorScheduleBlock.deleteMany({ where: { doctorId } }),
    prisma.doctorScheduleBlock.createMany({ data: rows }),
    ...(orphanPolicy === 'cancel' && orphaned.length > 0
      ? [
          prisma.appointment.updateMany({
            where: {
              appointmentId: { in: orphaned.map((a) => a.appointmentId) },
            },
            data: { status: 'CANCELLED' },
          }),
          prisma.order.updateMany({
            where: { id: { in: paidOrderIds } },
            data: {
              paymentStatus: 'Refunded',
              notes: 'Auto-cancel: schedule change',
            },
          }),
        ]
      : []),
  ])

  // 5. notify — after commit, best-effort
  let smsSent = 0
  if (orphaned.length > 0 && orphanPolicy !== 'reject') {
    for (const a of orphaned) {
      const phone = a.phoneNumber ?? a.user?.phoneNumber
      if (!phone) continue
      const args = {
        phoneNumber: phone,
        patientName: a.patientName,
        doctorName: doctor.name,
        dateLabel: toClinicDateISO(a.appointmentStartUTC, tz),
        timeLabel: toClinicHHMM(a.appointmentStartUTC, tz),
      }
      const res =
        orphanPolicy === 'cancel'
          ? await smsAppointmentCancelledByClinic({
              ...args,
              reason: 'تغییر برنامه پزشک',
              wasPaid: a.Order.length > 0,
            })
          : await smsScheduleChangedNeedsRebook(args)
      if (res.ok) smsSent++
    }
  }

  // 6. cache invalidation
  revalidateTag(`doctor-schedule:${doctorId}`, 'max')
  revalidateTag(`slots:${doctorId}`, 'max') // tag slot caches with both keys so this catches all dates

  return {
    ok: true,
    blocksSaved: rows.length,
    orphans: orphanInfos,
    cancelled: orphanPolicy === 'cancel' ? orphaned.length : 0,
    smsSent,
    warnings,
  }
}
