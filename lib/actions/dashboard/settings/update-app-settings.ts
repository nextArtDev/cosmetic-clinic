'use server'

import { z } from 'zod'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { currentUser } from '@/lib/auth'

const schema = z.object({
  timezone: z.string().min(1).max(100),
  defaultSlotDuration: z.coerce.number().int().min(2).max(120),
  slotReservationDuration: z.coerce.number().int().min(1).max(60),
  maxAdvanceBookingDays: z.coerce.number().int().min(1).max(365),
  minLeadTimeMinutes: z.coerce.number().int().min(0).max(1440),
})

export type UpdateAppSettingsInput = z.input<typeof schema>

export async function updateAppSettings(
  input: UpdateAppSettingsInput,
): Promise<
  | { ok: true }
  | { ok: false; error: 'UNAUTHORIZED' | 'INVALID_INPUT' | 'DB_ERROR' }
> {
  const user = await currentUser()
  if (!user || user.role !== 'admin')
    return { ok: false, error: 'UNAUTHORIZED' }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'INVALID_INPUT' }

  try {
    await prisma.appSettings.upsert({
      where: { id: 'global' },
      update: parsed.data,
      create: {
        id: 'global',
        ...parsed.data,
      },
    })

    revalidatePath('/dashboard/settings', 'page')
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'DB_ERROR' }
  }
}
