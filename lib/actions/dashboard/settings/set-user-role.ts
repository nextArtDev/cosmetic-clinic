'use server'

import { z } from 'zod'
import prisma from '@/lib/prisma'
import { currentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  userId: z.string().min(1),
  role: z.enum(['user', 'admin', 'doctor']),
  isRootAdmin: z.boolean().default(false),
})

export type SetUserRoleInput = z.input<typeof schema>

export async function setUserRole(
  input: SetUserRoleInput,
): Promise<
  | { ok: true }
  | { ok: false; error: 'UNAUTHORIZED' | 'INVALID_INPUT' | 'DB_ERROR' }
> {
  const admin = await currentUser()
  if (!admin || admin.role !== 'admin') {
    return { ok: false, error: 'UNAUTHORIZED' }
  }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'INVALID_INPUT' }

  try {
    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: {
        role: parsed.data.role,
        isRootAdmin: parsed.data.isRootAdmin,
      },
    })

    revalidatePath('/dashboard/settings', 'page')
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'DB_ERROR' }
  }
}
