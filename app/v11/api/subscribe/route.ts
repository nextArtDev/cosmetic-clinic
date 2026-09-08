import { NextRequest, NextResponse } from 'next/server'
import { mockSubscribers } from '../../lib/mock-store'

/**
 * /v11 subscribe API — MOCK ONLY (in-memory, no Prisma).
 * Mirrors the showcasemd /api/subscribe contract.
 */

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'درخواست نامعتبر است.' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: 'ایمیل معتبر وارد کنید.' },
      { status: 400 },
    )
  }

  if (!mockSubscribers.some((s) => s.email === email)) {
    mockSubscribers.push({ email, createdAt: new Date().toISOString() })
  }
  return NextResponse.json({ ok: true }, { status: 201 })
}
