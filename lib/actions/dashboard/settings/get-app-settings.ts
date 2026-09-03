'use server'

import prisma from '@/lib/prisma'

export type AppSettings = {
  timezone: string
  defaultSlotDuration: number
  slotReservationDuration: number
  maxAdvanceBookingDays: number
  minLeadTimeMinutes: number
}

export async function getAppSettings(): Promise<AppSettings> {
  const s = await prisma.appSettings.findUnique({ where: { id: 'global' } })

  return {
    timezone: s?.timezone ?? 'Asia/Tehran',
    defaultSlotDuration: s?.defaultSlotDuration ?? 30,
    slotReservationDuration: s?.slotReservationDuration ?? 10,
    maxAdvanceBookingDays: s?.maxAdvanceBookingDays ?? 30,
    minLeadTimeMinutes: s?.minLeadTimeMinutes ?? 60,
  }
}
