'use server'

import prisma from '@/lib/prisma'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
// import { deleteFileFromS3, uploadFileToS3 } from '../s3Upload'
import { deleteFileLocally } from './localUpload'
// import { createPersonnelSchema } from '../schemas'
import { Prisma } from '@/lib/generated/prisma'
import { PersonnelActionState } from '@/lib/types'
import z from 'zod'
import {
  personnelFormDataToObject,
  personnelFormSchema,
} from '../schemas/personnels'
import { adminGuard } from './authGuard'
import { uploadImages } from './server-utils'

const fail = (formError: string): PersonnelActionState => ({
  status: 'error',
  formError,
})

export async function createPersonnel(
  _prev: PersonnelActionState,
  formData: FormData,
): Promise<PersonnelActionState> {
  await adminGuard()
  const parsed = personnelFormSchema.safeParse(
    personnelFormDataToObject(formData),
  )
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  const data = parsed.data

  // 1. Safely determine departmentId

  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })
    if (existing?.phoneNumber)
      return fail('برای این ایمیل قبلاً پروفایل دکتر ثبت شده است.')

    const imageIds = await uploadImages(data.images)

    await prisma.$transaction(async (tx) => {
      const user = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: { role: 'user' },
          })
        : await tx.user.create({
            data: {
              name: data.fullName,
              id: crypto.randomUUID(),
              email: data.email,
              phoneNumber: data.phoneNumber,
              role: 'user',
            },
          })

      const personnel = await tx.personnel.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          bio: data.bio,
          email: data.email,
          phoneNumber: data.phoneNumber,

          position: data.position,
          isActive: data.isActive,
          order: data.order,
          hiredAt: data.hiredAt ? new Date(data.hiredAt) : null,
        },
      })

      if (imageIds.length) {
        await tx.image.updateMany({
          where: { id: { in: imageIds } },
          data: { personnelId: personnel.id },
        })
      }
    })
  } catch (err) {
    return mapDbError(err)
  }

  revalidatePath(`/dashboard/personnels`)
  redirect(`/dashboard/personnels`)
}

export async function editPersonnel(
  personnelUserId: string,
  _prev: PersonnelActionState,
  formData: FormData,
): Promise<PersonnelActionState> {
  await adminGuard()

  const parsed = personnelFormSchema.safeParse(
    personnelFormDataToObject(formData),
  )
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }
  const data = parsed.data

  try {
    const personnel = await prisma.personnel.findUnique({
      where: { userId: personnelUserId },
      include: { images: { select: { id: true, key: true } } },
    })
    if (!personnel) return fail('این پرسنل حذف شده است!')

    const removedImages = personnel.images.filter(
      (img) => !data.keepImageIds.includes(img.id),
    )
    const newImageIds = await uploadImages(data.images)

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: personnelUserId },
        data: { name: data.fullName, phoneNumber: data.phoneNumber },
      })

      await tx.personnel.update({
        where: { userId: personnelUserId },
        data: {
          bio: data.bio,
          position: data.position,
          // departmentId: data.departmentId, // Pass the strictly validated ID
          order: data.order,
          isActive: data.isActive,
          // email: data.email,
          // phoneNumber: data.phoneNumber,
          hiredAt: data.hiredAt ? new Date(data.hiredAt) : null,
        },
      })

      if (removedImages.length) {
        await tx.image.deleteMany({
          where: { id: { in: removedImages.map((i) => i.id) } },
        })
      }
      if (newImageIds.length) {
        await tx.image.updateMany({
          where: { id: { in: newImageIds } },
          data: { personnelId: personnel.id },
        })
      }
    })

    await Promise.allSettled(
      removedImages.map((img) => img.key && deleteFileLocally(img.key)),
    )
  } catch (err) {
    return mapDbError(err)
  }
  revalidatePath(`/dashboard/personnels`)
  redirect(`/dashboard/personnels`)
}

//////////////////////

export async function deletePersonnel(
  personnelUserId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: PersonnelActionState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<PersonnelActionState> {
  await adminGuard()
  if (!personnelUserId) return fail('پرسنل موجود نیست!')

  try {
    await prisma.personnel.update({
      where: { userId: personnelUserId },
      data: {
        isActive: false,
      },
    })
  } catch (err) {
    return mapDbError(err)
  }

  revalidatePath(`/dashboard/personnels`)
  redirect(`/dashboard/personnels`)
}

function mapDbError(err: unknown): PersonnelActionState {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  ) {
    return fail('رکورد تکراری است (ایمیل یا شماره موبایل از قبل ثبت شده).')
  }
  console.error('[personnel-actions]', err)
  return fail('مشکلی پیش آمده، لطفاً دوباره امتحان کنید!')
}
