import { NextRequest, NextResponse } from 'next/server'
import { emailIsValid } from '../../../lib/content'
import { mockOrders } from '../../../lib/mock-store'

/**
 * /v10 order lookup API — MOCK ONLY (in-memory, no Prisma).
 * Mirrors the nervana lookup contract: email + reference -> order.
 */

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'درخواست نامعتبر است.' }, { status: 400 }) }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const reference = typeof body.reference === 'string' ? body.reference.trim().toUpperCase() : ''
  if (!emailIsValid(email) || !/^MS-[0-9A-Z]{10}$/.test(reference)) {
    return NextResponse.json({ error: 'ایمیل و کد پیگیری (MS-…) را در قالب صحیح وارد کنید.' }, { status: 400 })
  }
  const order = mockOrders.get(reference)
  if (!order || order.email !== email) {
    return NextResponse.json({ error: 'درخواستی با این مشخصات پیدا نشد؛ دوباره بررسی کنید.' }, { status: 404 })
  }
  return NextResponse.json({ order }, { headers: { 'Cache-Control': 'no-store' } })
}
