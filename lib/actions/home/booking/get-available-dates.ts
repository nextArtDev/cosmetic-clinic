// lib/actions/home/booking/get-available-dates.ts
// Server action that returns the set of clinic-local ISO dates
// on which a doctor has at least one bookable slot.

'use server'

import { z } from 'zod'
import { getAvailableDates } from '@/lib/scheduling/get-available-dates'

const inputSchema = z.object({
  doctorId: z.string().min(1, 'شناسه پزشک الزامی است'),
  maxAdvanceBookingDays: z.number().int().positive().max(365).optional(),
})

export async function fetchAvailableDates(
  doctorId: string,
  maxAdvanceBookingDays?: number,
): Promise<string[]> {
  const parsed = inputSchema.safeParse({ doctorId, maxAdvanceBookingDays })
  if (!parsed.success) return []

  try {
    return await getAvailableDates(
      parsed.data.doctorId,
      parsed.data.maxAdvanceBookingDays,
    )
  } catch (err) {
    console.error('❌ CRITICAL ERROR in getAvailableDates:', err)
    return []
  }
}
