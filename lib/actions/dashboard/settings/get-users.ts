'use server'

import prisma from '@/lib/prisma'
import { currentUser } from '@/lib/auth'

export async function getUsers(): Promise<
  | {
      ok: true
      users: Array<{
        id: string
        name: string | null
        email: string
        phoneNumber: string | null
        role: 'user' | 'admin' | 'doctor'
        isRootAdmin: boolean | null
        isActive: boolean
      }>
    }
  | { ok: false; error: 'UNAUTHORIZED' }
> {
  const user = await currentUser()
  if (!user || user.role !== 'admin')
    return { ok: false, error: 'UNAUTHORIZED' }

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      isRootAdmin: true,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return {
    ok: true,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phoneNumber: u.phoneNumber,
      role: u.role as 'user' | 'admin' | 'doctor',
      isRootAdmin: u.isRootAdmin,
      isActive: u.isActive,
    })),
  }
}
