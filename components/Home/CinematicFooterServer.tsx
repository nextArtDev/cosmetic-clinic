import prisma from '@/lib/prisma'
import { currentUser } from '@/lib/auth'
import { CinematicFooter } from './CinematicFooter'
import { FooterReviewForm } from './footer-review-form'

const FALLBACK_SERVICES = [
  'جراحی بینی',
  'فیس‌لیفت',
  'لیپوساکشن',
  'پروتز زیبایی',
]

/**
 * Server wrapper for the cinematic footer: pulls the active specializations
 * from the database so the footer always mirrors what the dashboard manages.
 * Falls back to a static list if the DB is unreachable, so the footer never
 * breaks page rendering. Also gates the review form on the session.
 */
export async function CinematicFooterServer() {
  let services = FALLBACK_SERVICES
  try {
    const rows = await prisma.specialization.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 8,
      select: { name: true },
    })
    if (rows.length > 0) {
      services = rows.map((r) => r.name)
    }
  } catch {
    // keep fallback list
  }

  let loggedIn = false
  try {
    loggedIn = Boolean(await currentUser())
  } catch {
    // treat as signed out
  }

  return (
    <CinematicFooter
      services={services}
      reviewSlot={<FooterReviewForm loggedIn={loggedIn} />}
    />
  )
}
