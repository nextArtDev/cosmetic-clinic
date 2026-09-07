import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CART_COOKIE, validateCart } from '../../lib/content'
import { mockCarts } from '../../lib/mock-store'

/**
 * /v10 cart API — MOCK ONLY (in-memory, no Prisma).
 * Same contract as the nervana drizzle route: GET loads the visitor cart
 * (creating one lazily via a random uuid cookie), PUT validates and
 * replaces the items. When v10 goes live, swap mockCarts for a real carts
 * table; the client never changes.
 */

export const dynamic = 'force-dynamic'

const validId = (id?: string) => !!id && /^[0-9a-f-]{36}$/i.test(id)

function newId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

async function getOrCreateCart() {
  const jar = await cookies()
  const id = jar.get(CART_COOKIE)?.value
  if (validId(id) && mockCarts.has(id!)) return id!
  const fresh = newId()
  mockCarts.set(fresh, { items: [], updatedAt: Date.now() })
  jar.set(CART_COOKIE, fresh, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return fresh
}

export async function GET() {
  try {
    const id = await getOrCreateCart()
    return NextResponse.json({ items: mockCarts.get(id)!.items }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'سبد شما باز نشد؛ دوباره تلاش کنید.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'درخواست نامعتبر است.' }, { status: 400 }) }
  const items = validateCart((body as { items?: unknown } | null)?.items)
  if (!items) return NextResponse.json({ error: 'خدمت و تعداد انتخابی معتبر نیست (۱ تا ۲۰).' }, { status: 400 })
  try {
    const id = await getOrCreateCart()
    mockCarts.set(id, { items, updatedAt: Date.now() })
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'سبد شما ذخیره نشد؛ دوباره تلاش کنید.' }, { status: 500 })
  }
}
