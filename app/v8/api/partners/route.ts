import { NextRequest, NextResponse } from 'next/server'

/**
 * /v8 partnership enquiry API — MOCK ONLY (same pattern as
 * /v7/api/appointments and /v8/api/appointments). No Prisma, no schema.
 * Replace the in-memory store with real persistence when v8 goes live.
 *   POST /v8/api/partners { name, email, company?, message }
 *   -> 201 { success: true, reference }
 */

export const runtime = 'nodejs'

type StoredRequest = { id: string; email: string; createdAt: number }

const recentRequests: StoredRequest[] = []

function reference() {
  return `MH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export async function POST(request: NextRequest) {
  if (Number(request.headers.get('content-length') || 0) > 16000) {
    return NextResponse.json({ error: 'درخواست شما بیش از حد طولانی است.' }, { status: 413 })
  }
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      const originHost = new URL(origin).host
      if (
        originHost !== request.headers.get('host') &&
        originHost !== request.headers.get('x-forwarded-host')
      ) {
        return NextResponse.json({ error: 'این درخواست مجاز نیست.' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'این درخواست مجاز نیست.' }, { status: 403 })
    }
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'درخواست نامعتبر است.' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const company = typeof body.company === 'string' ? body.company.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json(
      { error: 'نام را بین ۲ تا ۱۰۰ نویسه وارد کنید.' },
      { status: 400 },
    )
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'ایمیل معتبر وارد کنید.' }, { status: 400 })
  }
  if (company.length > 200) {
    return NextResponse.json({ error: 'نام مجموعه بیش از حد طولانی است.' }, { status: 400 })
  }
  if (message.length < 10 || message.length > 4000) {
    return NextResponse.json(
      { error: 'پیام را بین ۱۰ تا ۴۰۰۰ نویسه وارد کنید.' },
      { status: 400 },
    )
  }

  const now = Date.now()
  const window = recentRequests.filter(entry => now - entry.createdAt < 86_400_000)
  if (window.filter(entry => entry.email === email).length >= 3) {
    return NextResponse.json(
      { error: 'برای هر ایمیل، حداکثر سه درخواست در روز ثبت می‌شود.' },
      { status: 429 },
    )
  }
  const ref = reference()
  window.push({ id: ref, email, createdAt: now })
  recentRequests.length = 0
  recentRequests.push(...window)

  return NextResponse.json({ success: true, reference: ref }, { status: 201 })
}
