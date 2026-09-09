import { NextRequest, NextResponse } from 'next/server'
import { leadIsValid, mockLeads } from '../../lib/mock-store'

/**
 * /v12 leads API — MOCK ONLY (in-memory, no Prisma).
 * Mirrors the grind /api/leads contract (situation/goal/commitment/
 * name/email -> 201 { ok, id }), so the LeadForm port works unchanged.
 */

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'درخواست نامعتبر است.' }, { status: 400 })
  }

  const lead = {
    situation: String(body.situation ?? ''),
    goal: String(body.goal ?? ''),
    commitment: String(body.commitment ?? ''),
    name: String(body.name ?? ''),
    email: String(body.email ?? ''),
  }

  if (!leadIsValid(lead)) {
    return NextResponse.json(
      { error: 'همهٔ فیلدها را درست پر کنید.' },
      { status: 400 },
    )
  }

  mockLeads.push({ ...lead, email: lead.email.trim().toLowerCase(), createdAt: new Date().toISOString() })
  return NextResponse.json({ ok: true, id: mockLeads.length }, { status: 201 })
}
