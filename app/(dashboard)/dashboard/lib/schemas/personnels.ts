// lib/schemas/personnel.ts
// Single source of truth for the personnel form — shared by the client
// (zodResolver) and the server actions (safeParse on FormData).
//
// Targets the NEW schema: User (role=personnel) + PersonnelProfile +
// PersonnelSpecialization join rows. The old `open_time` DateTag strings

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

export const personnelFormSchema = z.object({
  fullName: z.string().trim().min(2, 'نام و نام خانوادگی دکتر الزامی است.'),
  email: z.email('ایمیل معتبر وارد کنید.'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید (مثلاً 09123456789).')
    .or(z.literal('')),
  // .optional(),
  bio: z
    .string()
    .trim()
    .min(10, 'معرفی کوتاه دکتر حداقل ۱۰ کاراکتر است.')
    .max(2000),
  position: z.string().trim().min(2, 'عنوان/مدرک دکتر الزامی است.'), // e.g. پرستار

  // departmentId: z.uuid().optional().or(z.literal('')),

  isActive: z.boolean().default(true),
  order: z.coerce.number().int('عدد صحیح وارد کنید').default(0),

  /** New uploads only. */
  images: z.array(imageFileSchema).max(5, 'حداکثر ۵ تصویر.').default([]),
  hiredAt: z.string().optional().or(z.literal('')),
  /** Ids of already-stored images the admin chose to keep. */
  keepImageIds: z.array(z.string()).default([]),
})

export type PersonnelFormValues = z.infer<typeof personnelFormSchema>
/** RHF works with the INPUT type (before coercion/defaults). */
export type PersonnelFormInput = z.input<typeof personnelFormSchema>

/** Rebuild the zod input from FormData on the server. */
export function personnelFormDataToObject(
  formData: FormData,
): Record<string, unknown> {
  return {
    fullName: formData.get('fullName'),
    email: formData.get('email') ?? '',
    phoneNumber: formData.get('phoneNumber') ?? '',
    bio: formData.get('bio') ?? '',
    position: formData.get('position') ?? '',
    // departmentId: formData.get('departmentId') ?? '',
    order: formData.get('order') ?? 0,
    isActive: formData.get('isActive') === 'true',
    images: formData
      .getAll('images')
      .filter((f): f is File => f instanceof File && f.size > 0),
    keepImageIds: formData.getAll('keepImageIds'),
    hiredAt: formData.get('hiredAt') ?? '',
  }
}
