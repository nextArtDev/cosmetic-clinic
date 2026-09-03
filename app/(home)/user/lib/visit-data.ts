// app/(home)/user/lib/visit-data.ts
// Shared, server-side data layer for the /user visits timeline.
// Used by both the /user page (initial render + stats) and the fetchMoreVisits
// server action (infinite scroll) so pagination stays consistent.
//
// Pagination is DB-side (keyset):
//   - Appointments (the potentially unbounded table) are filtered in SQL with
//     `appointmentStartUTC < cursorEpoch` (+ an id tiebreak for same-start
//     slots), ordered by (start, id) desc and fetched with a `limit + 1` probe
//     so hasMore needs no extra count query.
//   - TimeLine rows are keyed by a *string* date. ISO rows (`YYYY-MM-DD`) sort
//     lexicographically == chronologically and are DB-filtered by date; rare
//     legacy (Jalali) rows are fetched in full (patient-scale, tiny) and are
//     re-checked in JS. A final in-JS cursor pass over the probed window is the
//     correctness backstop that trims each page to exactly `limit` items.

import prisma from '@/lib/prisma'
import {
  getAppTimeZone,
  toClinicHHMM,
  toClinicDateISO,
} from '@/lib/scheduling/tz'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { Prisma } from '@/lib/generated/prisma'
import type { VisitNode } from '@/app/(home)/user/components/visit-timeline'

export const VISITS_PAGE_SIZE = 8

const JALALI_WEEKDAY = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
]

export const STATUS_LABEL: Record<string, string> = {
  PAYMENT_PENDING: 'در انتظار پرداخت',
  BOOKING_CONFIRMED: 'تأیید شده',
  COMPLETED: 'انجام شده',
  CANCELLED: 'لغو شده',
  NO_SHOW: 'عدم حضور',
  CASH: 'نقدی',
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Legacy (Jalali) rows never contain '-' (e.g. "۱۴۰۴/۰۵/۱۲"), while ISO rows
 * always do — Prisma 7 dropped the `regex` string filter, so this `not` on
 * `contains` is the practical detector. Rows caught here are re-verified by
 * ISO_DATE_RE in toTimelineSorted, and the JS cursor pass trims the page.
 */
const LEGACY_DATE_NOT_DASH = { not: { contains: '-' } } as const

export function jalaliLabel(dateISO: string): string {
  if (!ISO_DATE_RE.test(dateISO)) return dateISO
  return format(new Date(`${dateISO}T00:00:00Z`), 'd MMMM yyyy', {
    locale: faIR,
  })
}

export function weekdayLabel(dateISO: string): string {
  return JALALI_WEEKDAY[new Date(`${dateISO}T00:00:00Z`).getUTCDay()]
}

export interface SortedVisit {
  node: VisitNode
  /** Sort/pagination key: UTC epoch of the visit's clinic-local date/time. */
  epoch: number
}

/**
 * Keyset cursor: (epoch, id) of the page's last item, serialized as
 * `epoch:id` (id is a uuid — never contains ':'). The discriminator between
 * a timeline and an appointment cursor is NOT stored: timeline rows always
 * land at UTC midnight, so `epoch % 86_400_000 === 0` identifies them, and
 * the id tiebreak is the same string comparison either way.
 */
export interface VisitCursor {
  epoch: number
  id: string
}

export function serializeCursor(c: VisitCursor): string {
  return `${c.epoch}:${c.id}`
}

export function parseCursor(s: string): VisitCursor {
  const idx = s.indexOf(':')
  if (idx === -1) return { epoch: Number.NaN, id: '' }
  return {
    epoch: Number(s.slice(0, idx)),
    id: s.slice(idx + 1),
  }
}

const appointmentInclude = {
  doctor: { select: { name: true } },
  Order: { select: { paymentStatus: true } },
} as const

export type VisitAppointment = Prisma.AppointmentGetPayload<{
  include: typeof appointmentInclude
}>

export interface VisitStats {
  totalVisits: number
  completedCount: number
  /** Non-cancelled visits at/after now, soonest first. */
  upcoming: VisitAppointment[]
}

function toAppointmentSorted(
  a: VisitAppointment,
  tz: string,
  now: Date,
): SortedVisit {
  const dateISO = toClinicDateISO(a.appointmentStartUTC, tz)
  return {
    epoch: a.appointmentStartUTC.getTime(),
    node: {
      kind: 'appointment',
      id: a.appointmentId,
      sortKey: `${dateISO} ${toClinicHHMM(a.appointmentStartUTC, tz)}`,
      weekdayLabel: weekdayLabel(dateISO),
      dateLabel: jalaliLabel(dateISO),
      timeLabel: toClinicHHMM(a.appointmentStartUTC, tz),
      doctorName: a.doctor.name,
      reason: a.reasonForVisit ?? undefined,
      status: a.status,
      statusLabel: STATUS_LABEL[a.status] ?? a.status,
      paid: a.Order.some((o) => o.paymentStatus === 'Paid'),
      upcoming: a.appointmentStartUTC >= now,
    },
  }
}

type TimelineRow = {
  id: string
  date: string
  description: string
  isEspecial: boolean
  created_at: Date
  images: { url: string }[]
}

function toTimelineSorted(t: TimelineRow): SortedVisit {
  // Seed uses ISO dates; fall back to created_at for legacy (Jalali) records.
  const dateKey = ISO_DATE_RE.test(t.date)
    ? t.date
    : t.created_at.toISOString().slice(0, 10)
  return {
    epoch: new Date(`${dateKey}T00:00:00Z`).getTime(),
    node: {
      kind: 'treatment',
      id: t.id,
      sortKey: `${dateKey} 12:00`,
      dateLabel: jalaliLabel(t.date),
      description: t.description,
      isEspecial: t.isEspecial,
      images: t.images.map((i) => ({ url: i.url })),
    },
  }
}

function isAfterCursor(c: VisitCursor) {
  return (v: SortedVisit): boolean =>
    v.epoch < c.epoch || (v.epoch === c.epoch && v.node.id < c.id)
}

/**
 * One page of merged visits strictly after `cursor` (null = first page).
 *
 * Fetches a `limit + 1` probe from each source so `hasMore` needs no extra
 * query, then merges + re-sorts + cursor-checks the window in JS and trims to
 * `limit`. Result is identical to the old fetch-all-then-slice behavior, but
 * each page only queries the rows it could possibly need.
 */
export async function fetchVisitsPage(
  userId: string,
  cursor: VisitCursor | null,
  limit: number,
): Promise<{ nodes: VisitNode[]; nextCursor: string | null }> {
  const tz = getAppTimeZone()
  const now = new Date()
  const probe = limit + 1

  const cursorDateISO = cursor
    ? new Date(cursor.epoch).toISOString().slice(0, 10)
    : null

  const [appointments, isoTimelines, legacyTimelines] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        userId,
        ...(cursor
          ? {
              OR: [
                { appointmentStartUTC: { lt: new Date(cursor.epoch) } },
                {
                  appointmentStartUTC: new Date(cursor.epoch),
                  appointmentId: { lt: cursor.id },
                },
              ],
            }
          : {}),
      },
      include: appointmentInclude,
      orderBy: [{ appointmentStartUTC: 'desc' }, { appointmentId: 'desc' }],
      take: probe,
    }),
    prisma.timeLine.findMany({
      where: {
        userId,
        // Timeline rows only ever land at UTC midnight of their ISO date, so:
        //  - cursor epoch is UTC midnight (a timeline row, or a hypothetical
        //    appointment at exactly 00:00:00Z): same-day id tiebreak is the
        //    authoritative continuation
        //  - cursor epoch is later in the day (an appointment): every same-day
        //    timeline sits after it, so `date <= cursorDateISO` is exact
        ...(cursor && cursorDateISO
          ? cursor.epoch % 86_400_000 === 0
            ? {
                OR: [
                  { date: { lt: cursorDateISO } },
                  { date: cursorDateISO, id: { lt: cursor.id } },
                ],
              }
            : { date: { lte: cursorDateISO } }
          : {}),
      },
      include: { images: { select: { url: true } } },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      take: probe,
    }),
    // Legacy (non-ISO) dates can't be compared to a cursor date in SQL; they
    // are doctor-written and patient-scale, so fetch them all and let the JS
    // pass decide.
    prisma.timeLine.findMany({
      where: { userId, date: LEGACY_DATE_NOT_DASH },
      include: { images: { select: { url: true } } },
    }),
  ])

  const items: SortedVisit[] = []
  for (const a of appointments) items.push(toAppointmentSorted(a, tz, now))
  for (const t of isoTimelines) items.push(toTimelineSorted(t))
  for (const t of legacyTimelines) items.push(toTimelineSorted(t))

  // Correctness backstop: the DB filters shrink the window; this pass makes
  // the page exactly the next `limit` items in (epoch desc, id desc) order.
  const after = cursor ? items.filter(isAfterCursor(cursor)) : items
  after.sort((a, b) => b.epoch - a.epoch || (a.node.id < b.node.id ? 1 : -1))

  const page = after.slice(0, limit)
  const last = page[page.length - 1]
  const hasMore = after.length > limit

  return {
    nodes: page.map((p) => p.node),
    nextCursor:
      hasMore && last
        ? serializeCursor({ epoch: last.epoch, id: last.node.id })
        : null,
  }
}

/** Header stats for the /user page (counts + upcoming list). */
export async function fetchVisitStats(userId: string): Promise<VisitStats> {
  const now = new Date()
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    include: appointmentInclude,
    orderBy: { appointmentStartUTC: 'desc' },
  })

  return {
    totalVisits: appointments.length,
    completedCount: appointments.filter((a) => a.status === 'COMPLETED').length,
    upcoming: appointments
      .filter(
        (a) =>
          a.appointmentStartUTC >= now &&
          a.status !== 'CANCELLED' &&
          a.status !== 'NO_SHOW',
      )
      .sort((a, b) => a.appointmentStartUTC.getTime() - b.appointmentStartUTC.getTime()),
  }
}
