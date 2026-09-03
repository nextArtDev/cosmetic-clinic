'use server'
import { currentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createIllnessSchema } from '@/lib/schemas/dashboard'
import { Illness, Specialization, DoctorProfile } from '@/generated/prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
// import { deleteFileFromS3, uploadFileToS3 } from '../s3Upload'
import { deleteFileLocally, uploadFileLocally } from './localUpload'
import sharp from 'sharp'

const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 40)
interface CreateIllnessFormState {
  // success?: string
  errors: {
    name?: string[]
    description?: string[]
    specializationId?: string[]
    doctorId?: string[]
    images?: string[]
    _form?: string[]
  }
}

export async function createIllness(
  formData: FormData,

  path: string,
): Promise<CreateIllnessFormState> {
  const result = createIllnessSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    specializationId: formData.getAll('specializationId'),
    images: formData.getAll('images'),
    doctorId: formData.getAll('doctorId'),
  })

  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  // console.log(result?.data)

  const session = await currentUser()
  if (!session || session.role !== 'admin') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }

  try {
    const isExisting = await prisma.illness.findFirst({
      where: {
        name: result.data.name,
      },
    })
    if (isExisting) {
      return {
        errors: {
          _form: ['بیماری با این نام موجود است!'],
        },
      }
    }

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
    await prisma.illness.create({
      data: {
        name: result.data.name,
        slug: `${slugify(result.data.name) || 'illness'}-${crypto.randomUUID().slice(0, 8)}`,
        description: result?.data.description,
        images: {
          connect: imageIds.map((id) => ({
            id: id,
          })),
        },

        specializations: {
          connect: result.data?.specializationId?.map((id: string) => ({
            id: id,
          })),
        },
        doctors: {
          connect: result.data?.doctorId?.map((id: string) => ({
            userId: id,
          })),
        },
      },
    })

    // console.log(res?.imageUrl)
    // console.log(illness)
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
  redirect(`/dashboard/illness`)
}
interface CreateIllnessFormState {
  // success?: string
  errors: {
    name?: string[]
    description?: string[]

    specializationId?: string[]
    doctorId?: string[]

    images?: string[]
    _form?: string[]
  }
}
export async function editIllness(
  formData: FormData,
  illnessId: string,
  path: string,
): Promise<CreateIllnessFormState> {
  const result = createIllnessSchema.safeParse({
    name: formData.get('name'),

    description: formData.get('description'),
    images: formData.getAll('images'),

    specializationId: formData.getAll('specializationId'),
    doctorId: formData.getAll('doctorId'),
  })

  // console.log(result)
  // console.log(formData.getAll('images'))

  if (!result.success) {
    // console.log(result.error.flatten().fieldErrors)
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
    const isExisting:
      | (Illness & {
          images: { id: string; key: string }[] | null
        } & { specializations: Specialization[] } & {
          doctors: DoctorProfile[]
        })
      | null = await prisma.illness.findFirst({
      where: { id: illnessId },
      include: {
        images: { select: { id: true, key: true } },
        specializations: true,
        doctors: true,
      },
    })
    if (!isExisting) {
      return {
        errors: {
          _form: ['بیماری حذف شده است!'],
        },
      }
    }
    const isNameExisting = await prisma.illness.findFirst({
      where: {
        name: result.data.name,

        NOT: { id: illnessId },
      },
    })

    if (isNameExisting) {
      return {
        errors: {
          _form: ['دکتر با این نام موجود است!'],
        },
      }
    }

    await prisma.illness.update({
      where: {
        id: illnessId,
      },
      data: {
        specializations: {
          disconnect: isExisting.specializations?.map((specialization) => ({
            id: specialization.id,
          })),
        },

        doctors: {
          disconnect: isExisting.doctors?.map((doctor) => ({
            userId: doctor.userId,
          })),
        },
      },
    })
    if (
      typeof result.data.images[0] === 'object' &&
      result.data.images[0] instanceof File
    ) {
      const imageIds: string[] = []
      for (const img of result.data.images) {
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
      await prisma.illness.update({
        where: {
          id: illnessId,
        },
        data: {
          images: {
            disconnect: isExisting.images?.map((image: { id: string }) => ({
              id: image.id,
            })),
          },
        },
      })
      await prisma.illness.update({
        where: {
          id: illnessId,
        },
        data: {
          name: result.data.name,
          description: result.data.description,

          images: {
            connect: imageIds.map((id) => ({
              id: id,
            })),
          },
          specializations: {
            connect: result.data.specializationId?.map((id) => ({
              id: id,
            })),
          },
          doctors: {
            connect: result.data.doctorId?.map((id) => ({
              userId: id,
            })),
          },
        },
      })
    } else {
      await prisma.illness.update({
        where: {
          id: illnessId,
        },
        data: {
          name: result.data.name,
          description: result.data?.description,

          specializations: {
            connect: result.data.specializationId?.map((id) => ({
              id: id,
            })),
          },
          doctors: {
            connect: result.data.doctorId?.map((id) => ({
              userId: id,
            })),
          },
        },
      })
    }

    // imageId: res?.imageId,
    // console.log(billboard)
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
  redirect(`/dashboard/illness`)
}

//////////////////////

interface DeleteIllnessFormState {
  errors: {
    _form?: string[]
  }
}

export async function deleteIllness(
  path: string,
  illnessId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formState: DeleteIllnessFormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<DeleteIllnessFormState> {
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
  if (!illnessId) {
    return {
      errors: {
        _form: ['بیماری موجود نیست!'],
      },
    }
  }

  try {
    const isExisting:
      | (Illness & { images: { id: string; key: string }[] | null })
      | null = await prisma.illness.findFirst({
      where: { id: illnessId },
      include: {
        images: { select: { id: true, key: true } },
      },
    })
    if (!isExisting) {
      return {
        errors: {
          _form: ['تخصص حذف شده است!'],
        },
      }
    }

    if (isExisting.images) {
      for (const image of isExisting.images) {
        if (image.key) {
          await deleteFileLocally(image.key)
        }
      }
    }
    await prisma.illness.delete({
      where: {
        id: illnessId,
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
  redirect(`/dashboard/illness`)
}
