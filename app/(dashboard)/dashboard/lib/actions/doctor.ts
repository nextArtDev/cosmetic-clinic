'use server'

// lib/actions/doctor/doctor-actions.ts
// createDoctor / updateDoctor / deleteDoctor — modernized.
//
// What changed vs. the old actions:
//   prisma.doctor.*                         -> User(role=doctor) + DoctorProfile
//   implicit m2m connect/disconnect churn   -> deleteMany + createMany join rows
//   5 sequential awaits per save            -> ONE prisma.$transaction
//   DateTag "open_time" strings             -> gone (DoctorScheduleBlock owns time)
//   next-auth `auth()` + role 'ADMIN'       -> Better-Auth getSession + role 'admin'
//   `catch (err) { _form: [err.message] }`  -> never leak raw DB errors to UI;
//                                              P2002 mapped to a friendly message
//   redirect() inside try {}                -> redirect AFTER try/catch, so it is
//                                              never swallowed as a fake error
//   duplicated Create/Edit state interfaces -> one DoctorActionState + field map
//
// Signatures are useActionState-compatible: (prevState, formData) => state.

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@/lib/generated/prisma'
import sharp from 'sharp'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

import { z } from 'zod'
import { uploadFileLocally, deleteFileLocally } from './localUpload'
import { doctorFormDataToObject, doctorFormSchema } from '../schemas/doctor'
import { DoctorActionState } from '@/lib/types'
import { adminGuard } from './authGuard'
import { uploadImages } from './server-utils'

// ---------------------------------------------------------------------------
// Shared action state
// ---------------------------------------------------------------------------

const fail = (formError: string): DoctorActionState => ({
  status: 'error',
  formError,
})

const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 40)

async function requireAdmin(): Promise<DoctorActionState | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || session.user.role !== 'admin') {
    return fail('شما اجازه دسترسی ندارید!')
  }
  return null
}

// ---------------------------------------------------------------------------
// Image helpers — convert to webp, upload, return stored image ids
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export async function createDoctor(
  _prev: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  await adminGuard()

  const parsed = doctorFormSchema.safeParse(doctorFormDataToObject(formData))
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }
  const data = parsed.data

  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })
    if (existing?.phoneNumber)
      return fail('برای این ایمیل قبلاً پروفایل دکتر ثبت شده است.')

    const imageIds = await uploadImages(data.images)

    await prisma.$transaction(async (tx) => {
      // Reuse an existing account (promote to doctor) or create a fresh one.
      const user = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: { role: 'doctor' },
          })
        : await tx.user.create({
            data: {
              id: crypto.randomUUID(),
              name: data.name,
              email: data.email,
              phoneNumber: data.phoneNumber,
              role: 'doctor',
            },
          })

      await tx.doctorProfile.create({
        data: {
          userId: user.id,
          slug: `${slugify(data.name) || 'doctor'}-${crypto.randomUUID().slice(0, 8)}`,
          brief: data.brief,
          credentials: data.credentials,
          departmentId: data.departmentId || null,
          slotDurationMinutes: data.slotDurationMinutes,
          isActive: data.isActive,
          specializations: {
            create: data.specializationIds.map((id) => ({
              specializationId: id,
              isPrimary:
                id ===
                (data.primarySpecializationId || data.specializationIds[0]),
            })),
          },
          illnesses: { connect: data.illnessIds.map((id) => ({ id })) },
        },
      })

      if (imageIds.length) {
        await tx.image.updateMany({
          where: { id: { in: imageIds } },
          data: { userId: user.id },
        })
      }
    })
  } catch (err) {
    return mapDbError(err)
  }

  revalidatePath('/dashboard/doctors')
  redirect('/dashboard/doctors') // outside try/catch — never swallowed
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

export async function updateDoctor(
  doctorUserId: string,
  _prev: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  await adminGuard()

  const parsed = doctorFormSchema.safeParse(doctorFormDataToObject(formData))
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }
  const data = parsed.data
  // console.log({ data })
  try {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      include: {
        doctor: { include: { images: { select: { id: true, key: true } } } },
      },
    })
    if (!profile) return fail('این دکتر حذف شده است!')

    // Only images the admin dropped are deleted; kept ones are untouched.
    const removedImages = profile.doctor.images.filter(
      (img) => !data.keepImageIds.includes(img.id),
    )
    const newImageIds = await uploadImages(data.images)

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: doctorUserId },
        data: { name: data.name, phoneNumber: data.phoneNumber },
      })

      await tx.doctorProfile.update({
        where: { userId: doctorUserId },
        data: {
          brief: data.brief,
          credentials: data.credentials,
          departmentId: data.departmentId || null,
          slotDurationMinutes: data.slotDurationMinutes,
          isActive: data.isActive,
          // join rows: wipe & recreate beats diffing for a 1–5 item list
          specializations: {
            deleteMany: {},
            create: data.specializationIds.map((id) => ({
              specializationId: id,
              isPrimary:
                id ===
                (data.primarySpecializationId || data.specializationIds[0]),
            })),
          },
          illnesses: { set: data.illnessIds.map((id) => ({ id })) },
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
          data: { userId: doctorUserId },
        })
      }
    })

    // File-system cleanup after the tx commits (non-fatal if it fails).
    await Promise.allSettled(
      removedImages.map((img) => img.key && deleteFileLocally(img.key)),
    )
  } catch (err) {
    return mapDbError(err)
  }

  revalidatePath('/dashboard/doctors')
  redirect('/dashboard/doctors')
}

// ---------------------------------------------------------------------------
// DELETE — soft-delete by default; DoctorProfile row keeps history intact
// ---------------------------------------------------------------------------

export async function deleteDoctor(
  doctorUserId: string,
  _prev: DoctorActionState,
  _formData: FormData,
): Promise<DoctorActionState> {
  await adminGuard()
  if (!doctorUserId) return fail('دکتر موجود نیست!')

  try {
    const upcoming = await prisma.appointment.count({
      where: {
        doctorId: doctorUserId,
        status: { in: ['PAYMENT_PENDING', 'BOOKING_CONFIRMED'] },
        appointmentStartUTC: { gte: new Date() },
      },
    })
    if (upcoming > 0) {
      return fail(
        `این دکتر ${upcoming} نوبت فعال دارد. ابتدا نوبت‌ها را لغو یا منتقل کنید.`,
      )
    }

    // Soft delete: appointments/testimonials/orders keep their history.
    await prisma.doctorProfile.update({
      where: { userId: doctorUserId },
      data: { isActive: false },
    })
  } catch (err) {
    return mapDbError(err)
  }

  revalidatePath('/dashboard/doctors')
  redirect('/dashboard/doctors')
}

// ---------------------------------------------------------------------------

function mapDbError(err: unknown): DoctorActionState {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  ) {
    return fail('رکورد تکراری است (ایمیل یا تخصص از قبل ثبت شده).')
  }
  console.error('[doctor-actions]', err)
  return fail('مشکلی پیش آمده، لطفاً دوباره امتحان کنید!')
}
