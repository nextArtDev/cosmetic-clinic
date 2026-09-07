import { NextRequest, NextResponse } from 'next/server'

/**
 * /v9 appointment request API — MOCK ONLY.
 *
 * This route intentionally does NOT touch Prisma or any real schema. The
 * salvato v9 frontend is a demo port; when v9 becomes a real part of the
 * clinic product, replace the in-memory store below with real persistence
 * (e.g. a prisma model) — the client contract is:
 *   POST /v9/api/appointments
 *     { name, phone, email, interest, preferredDate?, preferredPeriod,
 *       consent, requestToken }
 *   -> 201 { reference }
 *      400 { error }  (validation / bad token)
 *      403 (bad origin)  413 (too large)  415 (wrong content type)
 *      429 (rate limit: 3 per 30min per phone)
 */

export const runtime = 'nodejs'

type StoredRequest = {
  id: string
  requestToken: string
  phone: string
  createdAt: number
}

const recentRequests: StoredRequest[] = []

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest) {
  try {
    if (!request.headers.get('content-type')?.includes('application/json'))
      return fail('درخواست را با قالب صحیح ارسال کنید.', 415)
    if (Number(request.headers.get('content-length') || 0) > 5000)
      return fail('درخواست بیش از حد طولانی است.', 413)
    const raw = await request.text()
    if (raw.length > 5000) return fail('درخواست بیش از حد طولانی است.', 413)
    let body: Record<string, unknown>
    try {
      const parsed: unknown = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
        return fail('درخواست نامعتبر است.')
      body = parsed as Record<string, unknown>
    } catch {
      return fail('درخواست نامعتبر است.')
    }
    const string = (key: string) => (typeof body[key] === 'string' ? (body[key] as string).trim() : '')
    const name = string('name')
    const phone = string('phone').replace(/\D/g, '')
    const email = string('email').toLowerCase()
    const interest = string('interest')
    const preferredDate = string('preferredDate')
    const preferredPeriod = string('preferredPeriod') || 'any'
    const requestToken = string('requestToken')
    if (name.length < 3 || name.length > 120)
      return fail('نام و نام خانوادگی خود را وارد کنید (۳ تا ۱۲۰ نویسه).')
    if (phone.length < 10 || phone.length > 15)
      return fail('یک شماره تماس معتبر وارد کنید؛ همراه با کد شهر.')
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return fail('یک ایمیل معتبر وارد کنید.')
    if (!treatmentsKnown(interest)) return fail('حوزه مورد علاقه را انتخاب کنید.')
    if (body.consent !== true) return fail('برای تماس، اجازه خود را تأیید کنید.')
    if (!['any', 'morning', 'afternoon'].includes(preferredPeriod))
      return fail('یک بازه زمانی معتبر انتخاب کنید.')
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestToken)
    )
      return fail('فرم را دوباره باز کنید و مجدد تلاش کنید.')
    if (preferredDate) {
      const date = new Date(`${preferredDate}T12:00:00Z`)
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(new Date())
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) ||
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== preferredDate ||
        preferredDate < today ||
        date.getTime() > Date.now() + 1000 * 60 * 60 * 24 * 180
      )
        return fail('یک تاریخ معتبر در شش ماه آینده انتخاب کنید.')
      // Persian work week: Saturday(6) through Thursday(4); Friday(5) closed.
      if (date.getUTCDay() === 5) return fail('پذیرش ما شنبه تا چهارشنبه است.')
    }

    const existing = recentRequests.find((item) => item.requestToken === requestToken)
    if (existing) {
      return NextResponse.json({ success: true, reference: `SN-${existing.id.slice(0, 8).toUpperCase()}` })
    }

    const halfHourAgo = Date.now() - 30 * 60 * 1000
    if (recentRequests.filter((item) => item.phone === phone && item.createdAt > halfHourAgo).length >= 3)
      return fail('درخواست‌های شما ثبت شده است. منتظر تماس ما باشید یا در واتس‌اپ پیام دهید.', 429)

    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
    recentRequests.push({ id, requestToken, phone, createdAt: Date.now() })
    console.log(`[v9 mock] appointment request saved in-memory: ${interest} <${email}>`)
    return NextResponse.json(
      { success: true, reference: `SN-${id.slice(0, 8).toUpperCase()}` },
      { status: 201 },
    )
  } catch (error) {
    console.error(
      'Could not save consultation request:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return fail('فعلاً امکان ارسال نیست. دوباره تلاش کنید یا در واتس‌اپ پیام دهید.', 503)
  }
}

function treatmentsKnown(interest: string) {
  // Mirror of lib/content slugs + the generic consultation value; kept local
  // so this mock route stays dependency-free from the client content tree.
  return [
    'visit',
    'dandan',
    'orthodonti',
    'child',
    'smile-design',
    'tandorosti-dehan',
    'fanavari-ha',
  ].includes(interest)
}
