// lib/scheduling/get-available-slots.ts
// The slot ENGINE — the modern replacement for SplitterTime + stored TimeSlot rows.
// Slots are computed on demand from DoctorScheduleBlock (+ overrides/leaves/
// closures) and existing appointments. Nothing is materialized, so there is
// never anything to "diff, disconnect and delete".
//
// Used by: the public booking page (via a server action / RSC) AND
// createBooking (revalidation before insert).

import 'server-only'
import prisma from '@/lib/prisma'
import { addMinutes, isBefore } from 'date-fns'
import {
  clinicTimeToUTC,
  clinicWeekday,
  dayStartUTC,
  dayEndUTC,
  toClinicHHMM,
  getAppTimeZone,
} from './tz'

export interface Slot {
  startUTC: Date // exact instant to store on Appointment.appointmentStartUTC
  endUTC: Date
  label: string // clinic-local "HH:MM" shown to the patient
  /** True when this slot is a PAYMENT_PENDING hold owned by the current user. */
  reservedByMe?: boolean
}

const ACTIVE_STATUSES = [
  'PAYMENT_PENDING',
  'BOOKING_CONFIRMED',
  'CASH',
] as const

/**
 * All bookable slots for a doctor on a clinic-local calendar date.
 * Returns [] when: doctor inactive, clinic closed, non-working weekday,
 * full-day leave, date outside the booking window, or simply no blocks.
 *
 * Slot availability rules:
 * - BOOKING_CONFIRMED / CASH → always unavailable (booked)
 * - PAYMENT_PENDING with unexpired reservation → unavailable to everyone
 *   EXCEPT the user who holds the reservation (they can still complete it)
 * - PAYMENT_PENDING with expired reservation → treated as free
 */
export async function getAvailableSlots(
  doctorId: string,
  dateISO: string, // "YYYY-MM-DD", clinic-local
  currentUserId?: string,
): Promise<Slot[]> {
  const tz = getAppTimeZone()
  const now = new Date()
  const settings = {
    maxAdvanceBookingDays: 60,
    minLeadTimeMinutes: 15,
    defaultSlotDuration: 30,
  }
  // --- Booking window guards (old project checked these in the UI only) ---
  const dayStart = dayStartUTC(dateISO, tz)
  const dayEnd = dayEndUTC(dateISO, tz)
  if (dayEnd <= now) return [] // date fully in the past
  const maxDate = addMinutes(now, settings.maxAdvanceBookingDays * 24 * 60)
  if (dayStart > maxDate) return [] // too far in the future

  const date = new Date(`${dateISO}T00:00:00Z`) // @db.Date comparison value
  const dayOfWeek = clinicWeekday(dateISO)

  const [
    profile,
    workingDay,
    closure,
    overrides,
    weeklyBlocks,
    leaves,
    appointments,
  ] = await Promise.all([
    prisma.doctorProfile.findUnique({ where: { userId: doctorId } }),
    prisma.workingDay.findUnique({ where: { dayOfWeek } }),
    prisma.clinicClosure.findUnique({ where: { date } }),
    prisma.doctorDateOverride.findMany({ where: { doctorId, date } }),
    prisma.doctorScheduleBlock.findMany({
      where: { doctorId, dayOfWeek, isActive: true },
      orderBy: { startTime: 'asc' },
    }),
    prisma.doctorLeave.findMany({ where: { doctorId, leaveDate: date } }),
    prisma.appointment.findMany({
      where: {
        doctorId,
        status: { in: [...ACTIVE_STATUSES] },
        appointmentStartUTC: { gte: dayStart, lt: dayEnd },
      },
      select: {
        appointmentStartUTC: true,
        status: true,
        reservationExpiresAt: true,
        userId: true,
      },
    }),
  ])

  if (!profile?.isActive) return []
  if (closure) return []
  if (workingDay && !workingDay.isWorkingDay) return []
  if (leaves.some((l) => l.startTime === null)) return [] // full-day leave

  // Overrides REPLACE weekly blocks for this specific date
  const blocks = overrides.length > 0 ? overrides : weeklyBlocks
  if (blocks.length === 0) return []

  // Classify appointments:
  // - booked: confirmed/cash → always taken
  // - heldByMe: unexpired PAYMENT_PENDING owned by current user → visible to them
  // - heldByOther: unexpired PAYMENT_PENDING owned by someone else → hidden
  // - expiredHold: PAYMENT_PENDING past reservationExpiresAt → free
  const booked = new Set<number>()
  const heldByMe = new Set<number>()
  const heldByOther = new Set<number>()

  for (const a of appointments) {
    const ts = a.appointmentStartUTC.getTime()
    if (a.status === 'BOOKING_CONFIRMED' || a.status === 'CASH') {
      booked.add(ts)
    } else if (a.status === 'PAYMENT_PENDING') {
      if (a.reservationExpiresAt && a.reservationExpiresAt < now) {
        continue // expired hold → free
      }
      if (currentUserId && a.userId === currentUserId) {
        heldByMe.add(ts)
      } else {
        heldByOther.add(ts)
      }
    }
  }

  const partialLeaves = leaves
    .filter((l) => l.startTime !== null && l.endTime !== null)
    .map((l) => ({
      startUTC: clinicTimeToUTC(dateISO, l.startTime!, tz),
      endUTC: clinicTimeToUTC(dateISO, l.endTime!, tz),
    }))

  const minBookable = addMinutes(now, settings.minLeadTimeMinutes)
  const slots: Slot[] = []

  for (const block of blocks) {
    const duration =
      block.slotDurationMinutes ??
      profile.slotDurationMinutes ??
      settings.defaultSlotDuration

    let cursor = clinicTimeToUTC(dateISO, block.startTime, tz)
    const blockEnd = clinicTimeToUTC(dateISO, block.endTime, tz)

    while (isBefore(addMinutes(cursor, duration - 1), blockEnd)) {
      const slotEnd = addMinutes(cursor, duration)
      const start = cursor
      const ts = start.getTime()
      const overlapsLeave = partialLeaves.some(
        (l) => start < l.endUTC && slotEnd > l.startUTC,
      )

      if (overlapsLeave) {
        cursor = slotEnd
        continue
      }

      // Booked → skip entirely (not shown at all)
      if (booked.has(ts)) {
        cursor = slotEnd
        continue
      }

      // Held by someone else → skip entirely
      if (heldByOther.has(ts)) {
        cursor = slotEnd
        continue
      }

      // Held by me → show as reservedByMe (still bookable by me)
      if (heldByMe.has(ts)) {
        slots.push({
          startUTC: start,
          endUTC: slotEnd,
          label: toClinicHHMM(start, tz),
          reservedByMe: true,
        })
        cursor = slotEnd
        continue
      }

      // Free slot — but must be past the lead-time
      if (start >= minBookable) {
        slots.push({
          startUTC: start,
          endUTC: slotEnd,
          label: toClinicHHMM(start, tz),
        })
      }
      cursor = slotEnd
    }
  }

  // Blocks can't overlap (validated on save), but sort defensively anyway
  return slots.sort((a, b) => a.startUTC.getTime() - b.startUTC.getTime())
}

/**
 * Is this exact instant bookable right now? Used by createBooking as the
 * business-rule check before insert (the partial unique index remains the
 * final race-condition referee).
 *
 * If `currentUserId` is provided, a PAYMENT_PENDING hold owned by that user
 * is considered bookable (they can complete their own reservation).
 */
export async function isSlotAvailable(
  doctorId: string,
  dateISO: string,
  startUTC: Date,
  currentUserId?: string,
): Promise<boolean> {
  const slots = await getAvailableSlots(doctorId, dateISO, currentUserId)
  return slots.some((s) => s.startUTC.getTime() === startUTC.getTime())
}
