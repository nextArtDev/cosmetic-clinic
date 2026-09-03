import { z } from 'zod'

export const createReviewSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(5, 'دیدگاه باید حداقل ۵ کاراکتر باشد.')
    .max(1000, 'دیدگاه حداکثر ۱۰۰۰ کاراکتر می‌تواند باشد.'),
  rating: z.number().int().min(1, 'امتیاز بین ۱ تا ۵ ستاره است.').max(5),
})
