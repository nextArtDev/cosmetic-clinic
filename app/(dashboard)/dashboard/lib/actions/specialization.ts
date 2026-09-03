'use server'

import prisma from '@/lib/prisma'

// import { deleteFileFromS3, uploadFileToS3 } from '../s3Upload'
import { deleteFileLocally, uploadFileLocally } from './localUpload'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import sharp from 'sharp'
import { createSpecializationSchema } from '../schemas'
import Slugify from 'slugify'
import { adminGuard } from './authGuard'

interface SpecializationFormState {
  errors: {
    name?: string[]
    description?: string[]
    images?: string[]
    _form?: string[]
  }
}

export async function createSpecialization(
  _prevState: SpecializationFormState, // Added - required by useActionState
  formData: FormData,
): Promise<SpecializationFormState> {
  const path = '/dashboard/specialization' // Moved inside action

  const result = createSpecializationSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    images: formData.getAll('images'),
  })

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }

  await adminGuard()

  // console.log(result)

  try {
    const isExisting = await prisma.specialization.findFirst({
      where: {
        name: result.data.name,
      },
    })
    if (isExisting) {
      return {
        errors: {
          _form: ['تخصص با این نام موجود است!'],
        },
      }
    }
    // console.log(isExisting)
    // console.log(billboard)

    const imageIds: string[] = []
    for (const img of result.data?.images || []) {
      if (img instanceof File) {
        const buffer = Buffer.from(await img.arrayBuffer())
        const convertedBuffer = await sharp(buffer)
          .webp({ effort: 6 })
          .toBuffer()
        const res = await uploadFileLocally(
          convertedBuffer,
          img.name.replace(/\.[^/.]+$/, ''), // Remove original extension
        )

        if (res?.imageId && typeof res.imageId === 'string') {
          imageIds.push(res.imageId)
        }
      }
    }
    await prisma.specialization.create({
      data: {
        name: result.data.name,
        slug: Slugify(result.data.name),
        description: result?.data.description,
        images: {
          connect: imageIds.map((id) => ({
            id: id,
          })),
        },
        // imageId: imageIds.length > 0 ? imageIds[0] : '',
      },
    })
    // console.log(res?.imageUrl)
    // console.log(category)
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
  redirect(path)
}
export async function editSpecialization(
  _prevState: SpecializationFormState, // Added
  formData: FormData,
  specializationId: string,
): Promise<SpecializationFormState> {
  const path = '/dashboard/specialization' // Moved inside action

  const result = createSpecializationSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    images: formData.getAll('images'),
  })

  // console.log(result)
  // console.log(formData.getAll('images'))

  if (!result.success) {
    // console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  await adminGuard()

  try {
    const isExisting = await prisma.specialization.findFirst({
      where: { id: specializationId },
      include: { images: { select: { id: true, key: true } } },
    })

    if (!isExisting) {
      return { errors: { _form: ['تخصص حذف شده است!'] } }
    }

    const isNameExisting = await prisma.specialization.findFirst({
      where: {
        name: result.data.name,
        NOT: { id: specializationId },
      },
    })

    if (isNameExisting) {
      return { errors: { _form: ['تخصص با این نام موجود است!'] } }
    }

    // Check if new images were uploaded
    if (result.data?.images?.[0] instanceof File) {
      const imageIds: string[] = []
      for (const img of result.data.images) {
        if (img instanceof File) {
          const buffer = Buffer.from(await img.arrayBuffer())
          const convertedBuffer = await sharp(buffer)
            .webp({ effort: 6 })
            .toBuffer()
          const res = await uploadFileLocally(
            convertedBuffer,
            img.name.replace(/\.[^/.]+$/, ''),
          )
          if (res?.imageId && typeof res.imageId === 'string') {
            imageIds.push(res.imageId)
          }
        }
      }

      // Disconnect old images and connect new ones
      await prisma.specialization.update({
        where: { id: specializationId },
        data: {
          images: {
            disconnect: isExisting.images?.map((image) => ({ id: image.id })),
          },
        },
      })

      await prisma.specialization.update({
        where: { id: specializationId },
        data: {
          name: result.data.name,
          description: result.data.description,
          images: {
            connect: imageIds.map((id) => ({ id })),
          },
        },
      })
    } else {
      // No new images, just update text fields
      await prisma.specialization.update({
        where: { id: specializationId },
        data: {
          name: result.data.name,
          description: result.data.description,
        },
      })
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { errors: { _form: [err.message] } }
    }
    return { errors: { _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'] } }
  }

  revalidatePath(path)
  redirect(path)
}

//////////////////////

export async function deleteSpecialization(
  path: string, // 1st bound argument
  specializationId: string, // 2nd bound argument
  state: SpecializationFormState, // 3rd argument (passed by React)
  formData: FormData, // 4th argument (passed by React)
): Promise<SpecializationFormState> {
  await adminGuard()

  if (!specializationId) {
    return { errors: { _form: ['تخصص موجود نیست!'] } }
  }

  try {
    const isExisting = await prisma.specialization.findFirst({
      where: { id: specializationId },
      include: { images: { select: { id: true, key: true } } },
    })

    if (!isExisting) {
      return { errors: { _form: ['تخصص حذف شده است!'] } }
    }

    if (isExisting.images) {
      for (const image of isExisting.images) {
        if (image.key) {
          await deleteFileLocally(image.key)
        }
      }
    }

    await prisma.specialization.delete({
      where: { id: specializationId },
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { errors: { _form: [err.message] } }
    }
    return { errors: { _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'] } }
  }

  revalidatePath(path)
  redirect(path)
}
