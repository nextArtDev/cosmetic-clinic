import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CART_COOKIE, cartTotal, emailIsValid, findProduct } from '../../lib/content'
import { mockCarts, mockOrders, type MockCartItem } from '../../lib/mock-store'

/**
 * /v10 demo order API — MOCK ONLY (in-memory, no Prisma).
 * Mirrors the nervana checkout contract: reads the visitor cart, prices it
 * from the catalog, stores a demo order and clears the cart. Swap for a
 * real orders table when v10 goes live.
 */

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'درخواست نامعتبر است.' }, { status: 400 }) }

  const field = (key: string) => (typeof body[key] === 'string' ? (body[key] as string).trim() : '')
  const email = field('email').toLowerCase()
  const name = field('name')
  const phone = field('phone').replace(/\D/g, '')
  const city = field('city')
  const postalCode = field('postalCode')
  const address = field('address')

  if (!emailIsValid(email) || name.length < 3 || name.length > 100 || phone.length < 10 || phone.length > 15 || city.length < 2 || city.length > 100 || postalCode.length < 3 || postalCode.length > 20 || address.length > 250) {
    return NextResponse.json({ error: 'ایمیل، شماره تماس و نشانی خود را کامل و صحیح وارد کنید.' }, { status: 400 })
  }

  const jar = await cookies()
  const cartId = jar.get(CART_COOKIE)?.value
  if (!cartId || !/^[0-9a-f-]{36}$/i.test(cartId)) return NextResponse.json({ error: 'سبد شما خالی است.' }, { status: 400 })

  const cart = mockCarts.get(cartId)
  if (!cart?.items.length) return NextResponse.json({ error: 'سبد شما خالی است؛ ابتدا خدمتی انتخاب کنید.' }, { status: 409 })

  try {
    const reference = `MS-${Math.random().toString(36).slice(2, 12).toUpperCase()}`
    const items = cart.items.map((item: MockCartItem) => {
      const product = findProduct(item.productId)!
      return { ...item, name: product.name, variant: product.variant, price: product.price }
    })
    mockOrders.set(reference, {
      reference, email, name, phone, city, postalCode,
      items,
      total: cartTotal(cart.items),
      status: 'demo',
      createdAt: new Date().toISOString(),
    })
    mockCarts.set(cartId, { items: [], updatedAt: Date.now() })
    console.log(`[v10 mock] demo order saved: ${reference} <${email}>`)
    return NextResponse.json({ reference, total: cartTotal(cart.items), message: 'درخواست نمایشی شما ذخیره شد. پرداختی انجام نشده و نوبتی رزرو نشده است.' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'درخواست شما ذخیره نشد؛ سبدتان سر جای خود است، دوباره تلاش کنید.' }, { status: 500 })
  }
}
