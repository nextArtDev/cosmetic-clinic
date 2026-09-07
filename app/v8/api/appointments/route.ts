import { NextRequest, NextResponse } from 'next/server'

/**
 * /v8 appointment request API — MOCK ONLY.
 *
 * This route intentionally does NOT touch Prisma or any real schema. The
 * Clingr-port v8 frontend is a demo; when v8 becomes a real part of the
 * clinic product, replace the in-memory store below with real
 * persistence (e.g. a prisma model) — the client contract is:
 *   POST /v8/api/appointments { name, phone, specialty?, message? }
 *   -> 201 { success: true, reference }
 *      400 { error }  403 (bad origin)  429 (rate limit)
 */

export const runtime = 'nodejs'

type StoredRequest = { id: string; phone: string; createdAt: number }

const recentRequests: StoredRequest[] = []

function reference() {
  return `V8-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
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
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (name.length < 3 || name.length > 100) {
    return NextResponse.json(
      { error: 'نام را بین ۳ تا ۱۰۰ نویسه وارد کنید.' },
      { status: 400 },
    )
  }
  const digits = phone.replace(/[^\d]/g, '')
  if (digits.length < 10 || digits.length > 14) {
    return NextResponse.json({ error: 'شماره تماس معتبر وارد کنید.' }, { status: 400 })
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'توضیحات بیش از حد طولانی است.' }, { status: 400 })
  }

  const now = Date.now()
  const window = recentRequests.filter(entry => now - entry.createdAt < 86_400_000)
  if (window.filter(entry => entry.phone === digits).length >= 3) {
    return NextResponse.json(
      { error: 'برای هر شماره، حداکثر سه درخواست در روز ثبت می‌شود.' },
      { status: 429 },
    )
  }
  const ref = reference()
  window.push({ id: ref, phone: digits, createdAt: now })
  recentRequests.length = 0
  recentRequests.push(...window)

  return NextResponse.json({ success: true, reference: ref }, { status: 201 })
}
