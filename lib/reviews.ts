import 'server-only'

// lib/reviews.ts
// Read-side helpers for public review data (approved only):
//   - getFeaturedReviews: latest approved reviews shaped for TestimonialSwiper
//   - getReviewStats: aggregate average + count for hero badge / stats lines
// No photos are involved anywhere — callers render letter-initial avatars.

import prisma from '@/lib/prisma'

export interface PublicReview {
  id: string
  /** Display name of the author (from their account — no photos). */
  name: string
  /** Short label shown as the chip, e.g. the procedure name. */
  procedure: string
  text: string
  rating: number
  /** Persian relative label, e.g. «۳ روز پیش». */
  date: string
}

const faInt = new Intl.NumberFormat('fa-IR')
const faDecimal = new Intl.NumberFormat('fa-IR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** Persian relative time label ("امروز"، "۳ روز پیش"، "۲ ماه پیش"…). */
function relativeDateLabel(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'امروز'
  if (days === 1) return 'دیروز'
  if (days < 7) return `${faInt.format(days)} روز پیش`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${faInt.format(weeks)} هفته پیش`
  }
  if (days < 365) {
    const months = Math.floor(days / 30)
    return `${faInt.format(months)} ماه پیش`
  }
  const years = Math.floor(days / 365)
  return `${faInt.format(years)} سال پیش`
}

export async function getFeaturedReviews(
  limit = 12,
): Promise<PublicReview[]> {
  const rows = await prisma.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  })

  return rows.map((r) => ({
    id: r.id,
    name: r.author?.name ?? 'بیمار کلینیک',
    procedure: r.title ?? 'تجربهٔ مراجع',
    text: r.comment,
    rating: r.rating,
    date: relativeDateLabel(r.createdAt),
  }))
}

export interface ReviewStats {
  avg: number
  count: number
  /** Persian-digit label like «۴٫۹» */
  avgLabel: string
  /** Persian-digit label like «۵۰۰+» */
  countLabel: string
}

export async function getReviewStats(): Promise<ReviewStats> {
  const agg = await prisma.review.aggregate({
    where: { isApproved: true },
    _avg: { rating: true },
    _count: { _all: true },
  })
  const avg = agg._avg.rating ?? 0
  const count = agg._count._all
  return {
    avg,
    count,
    avgLabel: avg > 0 ? faDecimal.format(avg) : '—',
    countLabel: `+${faInt.format(count)}`,
  }
}
