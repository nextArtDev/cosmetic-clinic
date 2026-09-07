import { NextResponse } from 'next/server'

/**
 * /api/v6/newsletter — mock endpoint for the v6 port.
 * Validates the email shape and always succeeds. Swap the body for a
 * Prisma insert when the route goes real.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown }
    const email = typeof body.email === 'string' ? body.email.trim() : ''

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: 'ایمیل معتبر نیست.' },
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
