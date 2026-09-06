import { NextResponse } from 'next/server'

/**
 * نقطه‌ی اتصال فرم تماس دموی /v3. اعتبارسنجی همان روحیه‌ی مسیر اصلی را دارد
 * اما ذخیره‌سازی، ماکِ درون‌حافظه است: نه Prisma را لمس می‌کند و نه دیتابیس
 * production را. وقتی /v3 واقعی شد، بخش ماک را با insert خودتان در Prisma
 * جایگزین کنید.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type StoredInquiry = { id: string; name: string; phone: string; email: string | null; service: string; callTime: string; message: string; consent: true; createdAt: string }

// «جدول» ماک در سطح ماژول. ری‌استارت سرور -> داده‌ها پاک می‌شوند؛ عمداً.
const globalForMock = globalThis as typeof globalThis & { __v3MockInquiries?: StoredInquiry[] }
const inquiries: StoredInquiry[] = (globalForMock.__v3MockInquiries ??= [])

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin')
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    if (origin && new URL(origin).host !== host) {
      return NextResponse.json({ error: 'این درخواست مجاز نیست.' }, { status: 403 })
    }
    if (Number(request.headers.get('content-length') || 0) > 16000) {
      return NextResponse.json({ error: 'متن شما طولانی است.' }, { status: 413 })
    }
    const raw = await request.text()
    if (raw.length > 16000) {
      return NextResponse.json({ error: 'متن شما طولانی است.' }, { status: 413 })
    }
    let body: Record<string, unknown>
    try { body = JSON.parse(raw) } catch {
      return NextResponse.json({ error: 'فرم نامعتبر است.' }, { status: 400 })
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'فرم نامعتبر است.' }, { status: 400 })
    }
    const clean = (key: string) => typeof body[key] === 'string' ? (body[key] as string).trim() : ''
    if (clean('nickname')) {
      return NextResponse.json({ error: 'لطفاً فرم را به‌صورت عادی ارسال کنید.' }, { status: 400 })
    }
    const name = clean('name')
    const phone = clean('phone').replace(/[\s-]/g, '')
    const email = clean('email').toLowerCase()
    const service = clean('service')
    const callTime = clean('callTime')
    const message = clean('message')
    const fields: Record<string, string> = {}
    if (name.length < 2 || name.length > 120) fields.name = 'نام و نام خانوادگی را کامل وارد کنید (۲ تا ۱۲۰ نویسه).'
    if (!/^(?:\+?98|0)?9\d{9}$/.test(phone)) fields.phone = 'شماره موبایل معتبر وارد کنید؛ مثل ۰۹۱۲۱۲۳۴۵۶۷.'
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255)) fields.email = 'در صورت تمایل، یک ایمیل معتبر وارد کنید.'
    if (!service || service.length > 100) fields.service = 'یکی از خدمات را انتخاب کنید.'
    if (!callTime || callTime.length > 50) fields.callTime = 'زمان مناسب برای تماس را انتخاب کنید.'
    if (message.length < 20 || message.length > 5000) fields.message = 'درخواست‌تان را بین ۲۰ تا ۵٬۰۰۰ نویسه بنویسید.'
    if (body.consent !== true) fields.consent = 'برای ثبت درخواست، پذیرش سیاست حریم خصوصی لازم است.'
    if (Object.keys(fields).length) {
      return NextResponse.json({ error: 'فیلدهای مشخص‌شده را بررسی کنید.', fields }, { status: 400 })
    }

    // ---- ذخیره‌سازی ماک (در نسخه‌ی واقعی با Prisma جایگزین شود) ----
    const recent = inquiries.filter(item =>
      item.phone === phone && Date.now() - new Date(item.createdAt).getTime() < 60_000,
    )
    if (recent.length >= 3) {
      return NextResponse.json({ error: 'درخواست شما در حال بررسی است. یک دقیقه دیگر تلاش کنید.' }, { status: 429, headers: { 'Retry-After': '60' } })
    }
    const record: StoredInquiry = {
      id: crypto.randomUUID(),
      name, phone,
      email: email || null,
      service, callTime, message,
      consent: true,
      createdAt: new Date().toISOString(),
    }
    inquiries.push(record)
    console.log('[v3 mock] inquiry stored (in-memory only):', record.id)
    return NextResponse.json({ success: true, id: record.id }, { status: 201 })
  } catch (error) {
    console.error('v3 contact submission failed:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'ثبت درخواست موقتاً در دسترس نیست. چند لحظه دیگر دوباره تلاش کنید.' }, { status: 503 })
  }
}
