'use server'

import prisma from '@/lib/prisma'
import { currentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createReviewSchema } from '@/lib/schemas/rating'

type ActionErrors = Record<string, string[]>

/**
 * Create (or fail on duplicate) a review for a specific doctor.
 * Matches kosar's `createReview(formData, path, userId, doctorId)` signature.
 */
export async function createV1Review(
  formData: FormData,
  path: string,
  doctorId: string,
) {
  const user = await currentUser()
  if (!user?.id) {
    return {
      status: 'error' as const,
      errors: { _form: ['برای ثبت نظر باید وارد حساب کاربری شوید.'] },
    } satisfies { status: 'error'; errors: ActionErrors }
  }

  const parsed = createReviewSchema.safeParse({
    comment: formData.get('comment'),
    rating: Number(formData.get('rating')) || 5,
  })

  if (!parsed.success) {
    const flattened = parsed.error.flatten()
    const errors: ActionErrors = {}
    for (const [k, v] of Object.entries(flattened.fieldErrors)) {
      if (v && v.length) errors[k] = v
    }
    return { status: 'error' as const, errors } satisfies {
      status: 'error'
      errors: ActionErrors
    }
  }

  const existing = await prisma.review.findFirst({
    where: { authorId: user.id, doctorId },
  })
  if (existing) {
    return {
      status: 'error' as const,
      errors: { _form: ['شما قبلاً برای این پزشک نظر ثبت کرده‌اید.'] },
    } satisfies { status: 'error'; errors: ActionErrors }
  }

  await prisma.review.create({
    data: {
      authorId: user.id,
      doctorId,
      comment: parsed.data.comment,
      rating: parsed.data.rating,
    },
  })

  revalidatePath(path)
  return { status: 'success' as const }
}

/**
 * Create a clinic-level review (FAQ / general comment page).
 * Matches kosar's `createClinicReview(formData, path, userId)` signature.
 */
export async function createV1ClinicReview(
  formData: FormData,
  path: string,
) {
  const user = await currentUser()
  if (!user?.id) {
    return {
      status: 'error' as const,
      errors: { _form: ['برای ثبت نظر باید وارد حساب کاربری شوید.'] },
    } satisfies { status: 'error'; errors: ActionErrors }
  }

  const parsed = createReviewSchema.safeParse({
    comment: formData.get('comment'),
    rating: Number(formData.get('rating')) || 5,
  })

  if (!parsed.success) {
    const flattened = parsed.error.flatten()
    const errors: ActionErrors = {}
    for (const [k, v] of Object.entries(flattened.fieldErrors)) {
      if (v && v.length) errors[k] = v
    }
    return { status: 'error' as const, errors } satisfies {
      status: 'error'
      errors: ActionErrors
    }
  }

  await prisma.review.create({
    data: {
      authorId: user.id,
      doctorId: null,
      comment: parsed.data.comment,
      rating: parsed.data.rating,
    },
  })

  revalidatePath(path)
  return { status: 'success' as const }
}
