'use server'

// lib/actions/home/user-timeline.ts
// Thin, client-callable wrapper around the shared /user visits data layer.
// Infinite scroll: returns the next page of merged visits after `cursor`.
// Each page is fetched DB-side (appointments keyset-filtered on
// appointmentStartUTC), so a page queries only the rows it needs.
//
// The user is ALWAYS derived from the session — a client-supplied id is
// never trusted — so one patient can never page through another's visits.

import { currentUser } from '@/lib/auth'
import {
  fetchVisitsPage,
  parseCursor,
  VISITS_PAGE_SIZE,
} from '@/app/(home)/user/lib/visit-data'
import type { VisitNode } from '@/app/(home)/user/components/visit-timeline'

export interface FetchMoreVisitsResult {
  nodes: VisitNode[]
  nextCursor: string | null
}

export async function fetchMoreVisits(
  cursor: string,
): Promise<FetchMoreVisitsResult> {
  const user = await currentUser()
  if (!user?.id) return { nodes: [], nextCursor: null }

  const parsed = parseCursor(cursor)
  if (!Number.isFinite(parsed.epoch) || parsed.epoch <= 0 || !parsed.id) {
    return { nodes: [], nextCursor: null }
  }

  return fetchVisitsPage(user.id, parsed, VISITS_PAGE_SIZE)
}
