'use server'

// lib/actions/home/booking/get-slots.ts
// Thin, client-callable wrappers around the slot engine.
// - fetchAvailableSlots: returns bookable slots for (doctorId, dateISO)
// - fetchBookingWindow: returns calendar-window config (closures + holidays)

import { z } from 'zod'
import { formatInTimeZone } from 'date-fns-tz'

import { getAvailableSlots } from '@/lib/scheduling/get-available-slots'
import { getHolidaysInRange } from '@/lib/holidays'
import { getAppTimeZone } from '@/lib/scheduling/tz'
import prisma from '@/lib/prisma'
import { currentUser } from '@/lib/auth'

export interface SlotDTO {
  /** Exact UTC instant (ISO string) — send this back to createBooking untouched. */
  startUTC: string
  /** Clinic-local "HH:MM" label to display. */
  label: string
  /** True when this slot is a PAYMENT_PENDING hold owned by the current user. */
  reservedByMe?: boolean
}

export interface FetchSlotsResult {
  slots: SlotDTO[]
  error?: string
}

const inputSchema = z.object({
  doctorId: z.string().min(1, 'شناسه پزشک الزامی است'),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'فرمت تاریخ نامعتبر است'),
})

export async function fetchAvailableSlots(
  doctorId: string,
  dateISO: string,
): Promise<FetchSlotsResult> {
  // 1. Validate inputs
  const parsed = inputSchema.safeParse({ doctorId, dateISO })
  if (!parsed.success) {
    console.error('❌ Zod Validation Error:', parsed.error.flatten())
    return { slots: [], error: 'درخواست نامعتبر است.' }
  }

  try {
    console.log(
      '✅ Fetching slots for Doctor:',
      parsed.data.doctorId,
      '| Date:',
      parsed.data.dateISO,
    )

    const user = await currentUser()
    const slots = await getAvailableSlots(
      parsed.data.doctorId,
      parsed.data.dateISO,
      user?.id,
    )

    return {
      slots: slots.map((s) => ({
        startUTC: s.startUTC.toISOString(),
        label: s.label,
        reservedByMe: s.reservedByMe,
      })),
    }
  } catch (err) {
    // 2. LOG THE ACTUAL ERROR TO YOUR TERMINAL
    console.error('❌ CRITICAL ERROR in getAvailableSlots:', err)

    // 3. Show a more helpful message to the user temporarily
    const errorMsg =
      err instanceof Error ? err.message : 'خطای ناشناخته در سرور'
    return {
      slots: [],
      error: `خطا در دریافت نوبت‌ها: ${errorMsg}`,
    }
  }
}

export interface BookingPageData {
  maxAdvanceBookingDays: number
  /** Clinic closures inside the booking window (ISO date strings) — grayed out up front. */
  closedDates: string[]
  /** Fixed solar holidays inside the booking window: "YYYY-MM-DD" -> name. */
  holidays: Record<string, string>
}

/** Data the booking page needs to configure the calendar window. */
export async function fetchBookingWindow(): Promise<BookingPageData> {
  // const settings = await prisma.appSettings.findUniqueOrThrow({
  //   where: { id: 'global' },
  // })
  const settings = { maxAdvanceBookingDays: 60 }
  const tz = getAppTimeZone()
  const today = new Date()
  const max = new Date(today)
  max.setDate(max.getDate() + settings.maxAdvanceBookingDays)

  const closures = await prisma.clinicClosure.findMany({
    where: { date: { gte: today, lte: max } },
    select: { date: true },
  })

  const todayISO = formatInTimeZone(today, tz, 'yyyy-MM-dd')
  const maxISO = formatInTimeZone(max, tz, 'yyyy-MM-dd')

  return {
    maxAdvanceBookingDays: settings.maxAdvanceBookingDays,
    closedDates: closures.map((c) =>
      formatInTimeZone(c.date, tz, 'yyyy-MM-dd'),
    ),
    holidays: getHolidaysInRange(todayISO, maxISO, tz),
  }
}
