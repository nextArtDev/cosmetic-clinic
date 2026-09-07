import { NextResponse } from 'next/server'

/**
 * /api/v6/enquiries — mock endpoint for the v6 port.
 * Validates the payload shape and always succeeds. When the route becomes
 * the real v6 of the clinic, replace the body with a Prisma
 * `enquiry.create(...)` — the frontend contract is already final.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!name) {
      return NextResponse.json({ ok: false, error: 'نام را وارد کنید.' }, { status: 400 })
    }
    if (!phone && !email) {
      return NextResponse.json(
        { ok: false, error: 'شماره تماس یا ایمیل لازم است.' },
        { status: 400 },
      )
    }
    if (message.length < 5) {
      return NextResponse.json(
        { ok: false, error: 'توضیحات را کامل‌تر بنویسید.' },
        { status: 400 },
      )
    }

    // TODO(v6-real): persist via Prisma.
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'درخواست نامعتبر است.' },
      { status: 400 },
    )
  }
}
