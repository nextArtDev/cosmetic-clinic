'use server'

import prisma from '@/lib/prisma'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@/lib/generated/prisma'
import z from 'zod'
import {
  timelineFormDataToObject,
  timelineFormSchema,
  userFormDataToObject,
  userFormSchema,
} from '../schemas/users'
import { adminGuard } from './authGuard'
import { TimelineActionState, UserActionState } from '@/lib/types'

const fail = (formError: string): UserActionState & TimelineActionState => ({
  status: 'error',
  formError,
})

export async function createUser(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  await adminGuard()
  const parsed = userFormSchema.safeParse(userFormDataToObject(formData))
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }
  const data = parsed.data

  try {
    await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        bio: data.bio || null,
        gender: data.gender || null,
        address: data.address || null,
        role: 'user',
        isActive: data.isActive,
      },
    })
  } catch (err) {
    return mapDbError(err)
  }

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users')
}

export async function editUser(
  userId: string,
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  await adminGuard()
  if (!userId) return fail('کاربر موجود نیست!')

  const parsed = userFormSchema.safeParse(userFormDataToObject(formData))
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }
  const data = parsed.data

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        bio: data.bio || null,
        gender: data.gender || null,
        address: data.address || null,
        isActive: data.isActive,
      },
    })
  } catch (err) {
    return mapDbError(err)
  }

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users')
}

export async function deleteUser(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: UserActionState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<UserActionState> {
  await adminGuard()
  if (!userId) return fail('کاربر موجود نیست!')

  try {
    // Soft-delete to preserve historic appointments/orders.
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    })
  } catch (err) {
    return mapDbError(err)
  }

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users')
}

export async function createTimeline(
  userId: string,
  _prev: TimelineActionState,
  formData: FormData,
): Promise<TimelineActionState> {
  await adminGuard()
  const parsed = timelineFormSchema.safeParse(
    timelineFormDataToObject(formData),
  )
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }
  const data = parsed.data

  try {
    await prisma.timeLine.create({
      data: {
        userId,
        date: data.date,
        description: data.description,
        isEspecial: data.isEspecial,
      },
    })
  } catch (err) {
    return mapDbError(err)
  }

  revalidatePath(`/dashboard/users/${userId}`)
  redirect(`/dashboard/users/${userId}`)
}

export async function editTimeline(
  timelineId: string,
  userId: string,
  _prev: TimelineActionState,
  formData: FormData,
): Promise<TimelineActionState> {
  await adminGuard()
  if (!timelineId) return fail('رکورد موجود نیست!')

  const parsed = timelineFormSchema.safeParse(
    timelineFormDataToObject(formData),
  )
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }
  const data = parsed.data

  try {
    await prisma.timeLine.update({
      where: { id: timelineId },
      data: {
        date: data.date,
        description: data.description,
        isEspecial: data.isEspecial,
      },
    })
  } catch (err) {
    return mapDbError(err)
  }

  revalidatePath(`/dashboard/users/${userId}`)
  redirect(`/dashboard/users/${userId}`)
}

export async function deleteTimeline(
  timelineId: string,
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: TimelineActionState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<TimelineActionState> {
  await adminGuard()
  if (!timelineId) return fail('رکورد موجود نیست!')

  try {
    await prisma.timeLine.deleteMany({ where: { id: timelineId } })
  } catch (err) {
    return mapDbError(err)
  }

  revalidatePath(`/dashboard/users/${userId}`)
  redirect(`/dashboard/users/${userId}`)
}

function mapDbError(
  err: unknown,
): UserActionState & TimelineActionState {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  ) {
    return fail('رکورد تکراری است (ایمیل از قبل ثبت شده).')
  }
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2025'
  ) {
    return fail('رکورد مورد نظر حذف شده است!')
  }
  console.error('[user-actions]', err)
  return fail('مشکلی پیش آمده، لطفاً دوباره امتحان کنید!')
}