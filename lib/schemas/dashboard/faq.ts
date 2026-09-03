import { z } from 'zod'

export const createFaqSchema = z.object({
  question: z.string().min(1, 'پرسش را وارد کنید'),
  answer: z.string().min(1, 'پاسخ را وارد کنید'),
})

export type CreateFaqValues = z.infer<typeof createFaqSchema>
