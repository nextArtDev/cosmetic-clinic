import { mockSubscribers, countSubscribers } from '../../lib/mock-store'

export const dynamic = 'force-dynamic'

/**
 * /v13 mock newsletter API (mirrors the original clone's drizzle-backed
 * route, minus the database). The contract is { ok, error? } so the
 * NewsletterForm needs no changes when this is swapped for a real Prisma
 * client on the project's own backend. Subscribers are tracked in-memory
 * per server process and vanish on restart.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(request: Request) {
  let body: { email?: string; source?: string } = {}
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'داده‌ها نامعتبر است.' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: 'یک نشانی ایمیل معتبر وارد کن.' }, { status: 400 })
  }

  if (!mockSubscribers.some((s) => s.email === email)) {
    mockSubscribers.push({
      email,
      source: body.source ?? 'home',
      createdAt: new Date().toISOString(),
    })
  }

  return Response.json({ ok: true })
}

export async function GET() {
  return Response.json({ ok: true, total: countSubscribers() })
}
