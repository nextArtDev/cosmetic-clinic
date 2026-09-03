import { z } from 'zod'

// Single source of truth for the user form — shared by the client
// (zodResolver) and the server actions (safeParse on FormData).

export const userFormSchema = z.object({
  name: z.string().trim().min(2, 'نام و نام خانوادگی الزامی است.'),
  email: z.email('ایمیل معتبر وارد کنید.'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید (مثلاً 09123456789).'),
  bio: z
    .string()
    .trim()
    .max(2000, 'حداکثر ۲۰۰۰ کاراکتر امکان‌پذیر است.')
    .optional()
    .or(z.literal('')),
  gender: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal('')),
  address: z.string().trim().max(200).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
})

export type UserFormValues = z.infer<typeof userFormSchema>
/** RHF works with the INPUT type (before coercion/defaults). */
export type UserFormInput = z.input<typeof userFormSchema>

/** Rebuild the zod input from FormData on the server. */
export function userFormDataToObject(
  formData: FormData,
): Record<string, unknown> {
  return {
    name: formData.get('name'),
    email: formData.get('email') ?? '',
    phoneNumber: formData.get('phoneNumber') ?? '',
    bio: formData.get('bio') ?? '',
    gender: formData.get('gender') ?? '',
    address: formData.get('address') ?? '',
    isActive: formData.get('isActive') === 'true',
  }
}

export const timelineFormSchema = z.object({
  date: z.string().trim().min(1, 'تاریخ الزامی است.'),
  description: z.string().trim().min(2, 'توضیح درمان الزامی است.'),
  isEspecial: z.boolean().default(false),
})

export type TimelineFormValues = z.infer<typeof timelineFormSchema>
export type TimelineFormInput = z.input<typeof timelineFormSchema>

/** Rebuild the timeline input from FormData on the server. */
export function timelineFormDataToObject(
  formData: FormData,
): Record<string, unknown> {
  return {
    date: formData.get('date') ?? '',
    description: formData.get('description') ?? '',
    isEspecial: formData.get('isEspecial') === 'true',
  }
}