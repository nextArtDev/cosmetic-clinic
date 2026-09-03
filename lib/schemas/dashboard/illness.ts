import { z } from 'zod'

// Mirrors prisma schema.prisma -> model Illness
//
// Illness relations used by the form UI:
// - specializations: Specialization[] via relation "IllnessSpecializations"
// - doctors: DoctorProfile[] via relation "DoctorIllnesses"
//
// Server actions expect a multipart FormData payload with keys:
// - name
// - description
// - specializationId (repeat)
// - doctorId (repeat)
// - images (repeat)

export const createIllnessSchema = z.object({
  name: z.string().trim().min(1, 'نام بیماری الزامی است.'),

  description: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ?? '').toString()),

  // The form uses MultiSelector, so these are arrays of ids.
  specializationId: z.array(z.string().min(1)).default([]),
  doctorId: z.array(z.string().min(1)).default([]),

  // InputFileUpload provides files; keep permissive.
  // Server action validates the actual file(s).
  images: z.array(z.any()).optional().default([]),
})

export type CreateIllnessInput = z.input<typeof createIllnessSchema>
export type CreateIllnessValues = z.infer<typeof createIllnessSchema>
