// lib/schemas/doctor.ts
// Single source of truth for the doctor form — shared by the client
// (zodResolver) and the server actions (safeParse on FormData).
//
// Targets the NEW schema: User (role=doctor) + DoctorProfile +
// DoctorSpecialization join rows. The old `open_time` DateTag strings
// («سه‌شنبه 12 تا 14») are GONE — real availability lives in
// DoctorScheduleBlock and is edited in the weekly-schedule form.

import { z } from 'zod'

const IMAGE_MAX_BYTES = 4 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/** Accepts freshly-picked File objects; existing images are referenced
 *  by id and never re-uploaded (see `keepImageIds`). */
const imageFileSchema = z
  .instanceof(File)
  .refine(
    (f) => f.size <= IMAGE_MAX_BYTES,
    'حجم هر تصویر حداکثر ۴ مگابایت است.',
  )
  .refine(
    (f) => IMAGE_TYPES.includes(f.type),
    'فرمت تصویر باید JPG، PNG، WEBP یا GIF باشد.',
  )

export const doctorFormSchema = z
  .object({
    name: z.string().trim().min(2, 'نام و نام خانوادگی دکتر الزامی است.'),
    email: z.email('ایمیل معتبر وارد کنید.'),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید (مثلاً 09123456789).')
      .or(z.literal('')),
    // .optional(),
    credentials: z.string().trim().min(2, 'عنوان/مدرک دکتر الزامی است.'), // e.g. «متخصص قلب و عروق»
    brief: z
      .string()
      .trim()
      .min(10, 'معرفی کوتاه دکتر حداقل ۱۰ کاراکتر است.')
      .max(2000),

    departmentId: z.uuid().optional().or(z.literal('')),
    specializationIds: z.array(z.uuid()).min(1, 'حداقل یک تخصص انتخاب کنید.'),
    /** Which of specializationIds is the headline one on doctor cards. */
    primarySpecializationId: z.uuid().optional().or(z.literal('')),
    illnessIds: z.array(z.uuid()).default([]),

    slotDurationMinutes: z.coerce
      .number<number>()
      .int()
      .min(5)
      .max(180)
      .default(30),
    isActive: z.boolean().default(true),

    /** New uploads only. */
    images: z.array(imageFileSchema).max(5, 'حداکثر ۵ تصویر.').default([]),
    /** Ids of already-stored images the admin chose to keep. */
    keepImageIds: z.array(z.string()).default([]),
  })
  .superRefine((v, ctx) => {
    if (
      v.primarySpecializationId &&
      !v.specializationIds.includes(v.primarySpecializationId)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'تخصص اصلی باید یکی از تخصص‌های انتخاب‌شده باشد.',
        path: ['primarySpecializationId'],
      })
    }
  })

export type DoctorFormValues = z.infer<typeof doctorFormSchema>
/** RHF works with the INPUT type (before coercion/defaults). */
export type DoctorFormInput = z.input<typeof doctorFormSchema>

/** Rebuild the zod input from FormData on the server. */
export function doctorFormDataToObject(
  formData: FormData,
): Record<string, unknown> {
  return {
    name: formData.get('name'),
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber') ?? '',
    credentials: formData.get('credentials'),
    brief: formData.get('brief'),
    departmentId: formData.get('departmentId') ?? '',
    specializationIds: formData.getAll('specializationIds'),
    primarySpecializationId: formData.get('primarySpecializationId') ?? '',
    illnessIds: formData.getAll('illnessIds'),
    slotDurationMinutes: formData.get('slotDurationMinutes') ?? 30,
    isActive: formData.get('isActive') === 'true',
    images: formData
      .getAll('images')
      .filter((f): f is File => f instanceof File && f.size > 0),
    keepImageIds: formData.getAll('keepImageIds'),
  }
}
