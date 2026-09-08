import { NextRequest, NextResponse } from 'next/server'
import { mockDemoRequests, phoneIsValid } from '../../lib/mock-store'

/**
 * /v11 demo request API — MOCK ONLY (in-memory, no Prisma).
 * Mirrors the showcasemd /api/demo contract, adapted for an Iranian
 * clinic (phone instead of e-mail as the primary contact).
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ ok: true, total: mockDemoRequests.length })
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'درخواست نامعتبر است.' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const clinic = typeof body.clinic === 'string' ? body.clinic.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const screens = Number(body.screens) || 1

  if (name.length < 3 || name.length > 100) {
    return NextResponse.json(
      { ok: false, error: 'نام و نام خانوادگی را کامل وارد کنید.' },
      { status: 400 },
    )
  }
  if (!phoneIsValid(phone)) {
    return NextResponse.json(
      { ok: false, error: 'شمارهٔ تماس معتبر وارد کنید (مثلاً ۰۹۱۲۱۲۳۴۵۶۷).' },
      { status: 400 },
    )
  }

  mockDemoRequests.push({
    name,
    clinic,
    phone,
    screens: Math.min(Math.max(Math.trunc(screens), 1), 99),
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true, total: mockDemoRequests.length }, { status: 201 })
}
