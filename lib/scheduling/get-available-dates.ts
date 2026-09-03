// lib/scheduling/get-available-dates.ts
// Batch "does this doctor have ANY slot on this date?" check for the
// booking calendar. Avoids calling getAvailableSlots() for every day
// in the booking window (60+ DB round trips).

import 'server-only'
import prisma from '@/lib/prisma'
import { formatInTimeZone } from 'date-fns-tz'
import { clinicWeekday, getAppTimeZone } from './tz'

export async function getAvailableDates(
  doctorId: string,
  maxAdvanceBookingDays = 60,
): Promise<string[]> {
  const tz = getAppTimeZone()

  // Booking window as clinic-local ISO dates, starting today
  const todayISO = formatInTimeZone(new Date(), tz, 'yyyy-MM-dd')
  const [ty, tm, td] = todayISO.split('-').map(Number)

  const dates: string[] = []
  for (let i = 0; i < maxAdvanceBookingDays; i++) {
    const dt = new Date(Date.UTC(ty, tm - 1, td + i))
    dates.push(dt.toISOString().slice(0, 10))
  }

  const windowStart = new Date(`${dates[0]}T00:00:00Z`)
  const windowEnd = new Date(`${dates[dates.length - 1]}T00:00:00Z`)

  // Bulk data fetch — a handful of queries instead of 60+ per-day calls
  const [profile, closures, workingDays, leaves, overrides, weeklyBlocks] =
    await Promise.all([
      prisma.doctorProfile.findUnique({
        where: { userId: doctorId },
        select: { isActive: true },
      }),
      prisma.clinicClosure.findMany({
        where: { date: { gte: windowStart, lte: windowEnd } },
        select: { date: true },
      }),
      prisma.workingDay.findMany(),
      prisma.doctorLeave.findMany({
        where: { doctorId, leaveDate: { gte: windowStart, lte: windowEnd } },
        select: { leaveDate: true, startTime: true },
      }),
      prisma.doctorDateOverride.findMany({
        where: { doctorId, date: { gte: windowStart, lte: windowEnd } },
        select: { date: true },
      }),
      prisma.doctorScheduleBlock.findMany({
        where: { doctorId, isActive: true },
        select: { dayOfWeek: true },
      }),
    ])

  if (!profile?.isActive) return []

  const closureSet = new Set(
    closures.map((c) => formatInTimeZone(c.date, tz, 'yyyy-MM-dd')),
  )
  const workingDayMap = new Map(
    workingDays.map((w) => [w.dayOfWeek, w.isWorkingDay] as const),
  )
  const weeklyDaySet = new Set(weeklyBlocks.map((b) => b.dayOfWeek))
  const fullDayLeaves = new Set(
    leaves
      .filter((l) => l.startTime === null)
      .map((l) => formatInTimeZone(l.leaveDate, tz, 'yyyy-MM-dd')),
  )
  const overrideDays = new Set(
    overrides.map((o) => formatInTimeZone(o.date, tz, 'yyyy-MM-dd')),
  )

  return dates.filter((iso) => {
    if (closureSet.has(iso)) return false
    if (fullDayLeaves.has(iso)) return false
    const dow = clinicWeekday(iso)
    if (workingDayMap.has(dow) && !workingDayMap.get(dow)) return false
    // Overrides REPLACE weekly blocks — if an override exists, availability exists
    if (overrideDays.has(iso)) return true
    return weeklyDaySet.has(dow)
  })
}
