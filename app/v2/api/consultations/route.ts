import { NextRequest, NextResponse } from 'next/server'

/**
 * /v2 consultation request API — MOCK ONLY.
 *
 * This route intentionally does NOT touch Prisma or any real schema. The
 * shanina v2 frontend is a demo port; when v2 becomes a real part of the
 * clinic product, replace the in-memory store below with real persistence
 * (e.g. a prisma model) — the client contract is:
 *   POST /v2/api/consultations { name, email, phone?, country?, message?,
 *                                consultationType, consent }
 *   -> 201 { success, reference }
 *      400 { error, errors? }  (validation / honeypot)
 *      403 (bad origin)  413 (too large)  429 (rate limit)
 */

export const runtime = 'nodejs'

type StoredRequest = {
  id: string
  email: string
  consultationType: string
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
  const country = field('country')
  const message = field('message')
  const consultationType = field('consultationType')

  const errors: Record<string, string> = {}
  if (name.length < 2 || name.length > 120) {
    errors.name = 'لطفاً نام خود را وارد کنید (۲ تا ۱۲۰ حرف).'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    errors.email = 'لطفاً یک آدرس ایمیل معتبر وارد کنید.'
  }
  if (phone.length > 40 || (phone && !/^[+\d\s().-]{5,40}$/.test(phone))) {
    errors.phone = 'لطفاً یک شماره تماس معتبر وارد کنید.'
  }
  if (country.length > 120) {
    errors.country = 'لطفاً کمتر از ۱۲۰ حرف وارد کنید.'
  }
  if (message.length > 3000) {
    errors.message = 'لطفاً پیام خود را کمتر از ۳۰۰۰ حرف نگه دارید.'
  }
  if (!['general', 'targeted', 'follow-up'].includes(consultationType)) {
    errors.consultationType = 'لطفاً نوع مشاوره را انتخاب کنید.'
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

  const tenMinutesAgo = Date.now() - 10 * 60 * 1000
  while (recentRequests.length && recentRequests[0].createdAt < tenMinutesAgo) {
    recentRequests.shift()
  }
  if (recentRequests.some((r) => r.email === email)) {
    return NextResponse.json(
      {
        error:
          'اخیراً درخواستی با این ایمیل دریافت شده است. لطفاً ۱۰ دقیقه بعد دوباره تلاش کنید.',
      },
      { status: 429 },
    )
  }

  const id = `${Date.now().toString(36)}${reference()}`
  recentRequests.push({
    id,
    email,
    consultationType,
    createdAt: Date.now(),
  })
  console.log(
    `[v2 mock] consultation request saved in-memory: ${consultationType} <${email}>`,
  )
  return NextResponse.json(
    { success: true, reference: reference().slice(0, 8) },
    { status: 201 },
  )
}
