'use server'
import { currentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createFaqSchema } from '@/lib/schemas/dashboard'
import { FAQ } from '@/generated/prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

interface CreateFaqFormState {
  // success?: string
  errors: {
    question?: string[]
    answer?: string[]

    _form?: string[]
  }
}

export async function createFaq(
  formData: FormData,
  path: string,
): Promise<CreateFaqFormState> {
  const result = createFaqSchema.safeParse({
    question: formData.get('question'),

    answer: formData.get('answer'),
  })
  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  // console.log(result?.data.answer)

  const session = await currentUser()
  if (!session || session.role !== 'admin') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }

  // console.log(result)

  try {
    const last = await prisma.fAQ.findFirst({ orderBy: { order: 'desc' } })
    await prisma.fAQ.create({
      data: {
        question: result.data.question,
        answer: result.data.answer,
        order: (last?.order ?? 0) + 1,
      },
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }

  revalidatePath(path)
  redirect(`/dashboard/faqs`)
}
interface EditFaqFormState {
  errors: {
    question?: string[]
    answer?: string[]

    _form?: string[]
  }
}
export async function editFaq(
  formData: FormData,
  faqId: string,
  path: string,
): Promise<EditFaqFormState> {
  const result = createFaqSchema.safeParse({
    question: formData.get('question'),

    answer: formData.get('answer'),
  })

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  const session = await currentUser()
  if (!session || session.role !== 'admin') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }

  try {
    const isExisting: FAQ | null = await prisma.fAQ.findFirst({
      where: { id: faqId },
    })
    if (!isExisting) {
      return {
        errors: {
          _form: ['پرسنل حذف شده است!'],
        },
      }
    }
    const isQuestionExisting = await prisma.fAQ.findFirst({
      where: {
        question: result.data.question,

        NOT: { id: faqId },
      },
    })

    if (isQuestionExisting) {
      return {
        errors: {
          _form: ['پرسنل با این نام موجود است!'],
        },
      }
    }

    await prisma.fAQ.update({
      where: {
        id: faqId,
      },
      data: {
        question: result.data.question,
        answer: result.data.answer,
      },
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }

  revalidatePath(path)
  redirect(`/dashboard/faqs`)
}

//////////////////////

interface DeleteFaqFormState {
  errors: {
    question?: string[]
    answer?: string[]

    images?: string[]
    _form?: string[]
  }
}

export async function deleteFaq(
  path: string,
  FaqId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formState: DeleteFaqFormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<DeleteFaqFormState> {
  // console.log({ path, storeId, categoryId })
  const session = await currentUser()
  if (!session || session.role !== 'admin') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  // console.log(result)
  if (!FaqId) {
    return {
      errors: {
        _form: ['پرسنل موجود نیست!'],
      },
    }
  }

  try {
    const isExisting: FAQ | null = await prisma.fAQ.findFirst({
      where: { id: FaqId },
    })
    if (!isExisting) {
      return {
        errors: {
          _form: ['تخصص حذف شده است!'],
        },
      }
    }

    await prisma.fAQ.delete({
      where: {
        id: FaqId,
      },
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }

  revalidatePath(path)
  redirect(`/dashboard/faqs`)
}
