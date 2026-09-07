import { NextRequest, NextResponse } from 'next/server'

/**
 * /v7 appointment request API — MOCK ONLY.
 *
 * This route intentionally does NOT touch Prisma or any real schema. The
 * grigoriak v7 frontend is a demo port; when v7 becomes a real part of the
 * clinic product, replace the in-memory store below with real persistence
 * (e.g. a prisma model) — the client contract is:
 *   POST /v7/api/appointments { name, email, phone, procedure?, location?,
 *                               preferredDate?, message?, consent }
 *   -> 201 { reference }
 *      400 { error, errors? }  (validation / honeypot)
 *      403 (bad origin)  413 (too large)  429 (rate limit: 3/day per email)
 */

export const runtime = 'nodejs'

type StoredRequest = {
  id: string
  email: string
  createdAt: number
}

const recentRequests: StoredRequest[] = []

function reference() {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

export async function POST(request: NextRequest) {
  if (Number(request.headers.get('content-length') || 0) > 16000) {
    return NextResponse.json(
      { error: 'پیام شما بیش از حد طولانی است.' },
      { status: 413 },
    )
  }
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      const originHost = new URL(origin).host
      if (
        originHost !== request.headers.get('host') &&
        originHost !== request.headers.get('x-forwarded-host')
      ) {
        return NextResponse.json(
          { error: 'این درخواست مجاز نیست.' },
          { status: 403 },
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'این درخواست مجاز نیست.' },
        { status: 403 },
      )
    }
  }

  let body: Record<string, unknown>
  try {
    const parsed: unknown = await request.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Invalid form')
    }
    body = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json(
      { error: 'لطفاً یک فرم مشاوره معتبر ارسال کنید.' },
      { status: 400 },
    )
  }

  const field = (key: string) =>
    typeof body[key] === 'string' ? (body[key] as string).trim() : ''

  if (field('website')) {
    return NextResponse.json(
      { error: 'امکان پردازش این درخواست وجود ندارد.' },
      { status: 400 },
    )
  }
  const name = field('name')
  const email = field('email').toLowerCase()
  const phone = field('phone')
  const procedure = field('procedure')
  const location = field('location')
  const preferredDate = field('preferredDate')
  const message = field('message')

  const errors: Record<string, string> = {}
  if (name.length < 2 || name.length > 120) {
    errors.name = 'لطفاً نام خود را وارد کنید (۲ تا ۱۲۰ حرف).'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    errors.email = 'لطفاً یک آدرس ایمیل معتبر وارد کنید.'
  }
  if (phone.length < 7 || phone.length > 40 || !/^[+\d\s().-]{5,40}$/.test(phone)) {
    errors.phone = 'لطفاً یک شماره تماس معتبر وارد کنید.'
  }
  const validProcedures = [
    'not-sure',
    'laser-hair',
    'laser-skin',
    'laser-tattoo',
    'laser-vascular',
    'laser-rejuvenation',
  ]
  if (procedure && !validProcedures.includes(procedure)) {
    errors.procedure = 'لطفاً خدمت موردنظر را انتخاب کنید.'
  }
  if (location && !['تهران', 'کرج', 'آنلاین'].includes(location)) {
    errors.location = 'لطفاً محل مشاوره را انتخاب کنید.'
  }
  if (preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    errors.preferredDate = 'لطفاً یک تاریخ معتبر انتخاب کنید.'
  }
  if (message.length > 2000) {
    errors.message = 'لطفاً پیام خود را کمتر از ۲۰۰۰ حرف نگه دارید.'
  }
  if (body.consent !== true) {
    errors.consent = 'برای ادامه، لطفاً با توضیحات حریم خصوصی موافقت کنید.'
  }
  if (Object.keys(errors).length) {
    return NextResponse.json(
      { error: 'لطفاً فیلدهای مشخص‌شده را بررسی کنید.', errors },
      { status: 400 },
    )
  }

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  while (recentRequests.length && recentRequests[0].createdAt < oneDayAgo) {
    recentRequests.shift()
  }
  if (recentRequests.filter((r) => r.email === email).length >= 3) {
    return NextResponse.json(
      {
        error:
          'امروز درخواست‌هایی با این ایمیل ثبت شده است. لطفاً فردا دوباره تلاش کنید.',
      },
      { status: 429 },
    )
  }

  const id = `${Date.now().toString(36)}${reference()}`
  recentRequests.push({ id, email, createdAt: Date.now() })
  console.log(`[v7 mock] appointment request saved in-memory: ${procedure || 'not-sure'} <${email}>`)
  return NextResponse.json({ reference: reference().slice(0, 8) }, { status: 201 })
}
