'use server'

// lib/actions/rating.ts
// Public "submit a review" flow used by the cinematic footer form.
// Reviews land unapproved (isApproved: false) and surface in the dashboard's
// comments section for moderation before appearing anywhere public.

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { currentUser } from '@/lib/auth'
import { createReviewSchema } from '@/lib/schemas/rating'

export interface CreateReviewInput {
  rating: number
  comment: string
}

interface CreateReviewFormState {
  errors?: {
    rating?: string[]
    comment?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function createReview(
  input: CreateReviewInput,
  path: string,
): Promise<CreateReviewFormState> {
  // 1) Auth — only signed-in patients can leave a review
  const user = await currentUser()
  if (!user?.id) {
    return {
      errors: { _form: ['برای ثبت دیدگاه ابتدا وارد حساب خود شوید.'] },
    }
  }

  // 2) Validate payload
  const parsed = createReviewSchema.safeParse(input)
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as CreateReviewFormState['errors'],
    }
  }

  try {
    // 3) Insert as a review of the practice itself (doctorId stays null).
    //    It starts unapproved — dashboard moderation flips it public.
    await prisma.review.create({
      data: {
        authorId: user.id,
        doctorId: null,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        isApproved: false,
      },
    })
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === 'P2002'
    ) {
      return {
        errors: { _form: ['شما قبلاً برای این مورد دیدگاه ثبت کرده‌اید.'] },
      }
    }
    if (err instanceof Error) {
      return { errors: { _form: [err.message] } }
    }
    return { errors: { _form: ['مشکلی پیش آمد؛ لطفاً دوباره تلاش کنید.'] } }
  }

  revalidatePath(path)
  return { success: true }
}
