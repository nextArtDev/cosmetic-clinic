import { NextRequest, NextResponse } from 'next/server'
import { emailIsValid } from '../../lib/content'
import { mockMessages } from '../../lib/mock-store'

/**
 * /v10 contact API — MOCK ONLY (in-memory, no Prisma).
 * Mirrors the nervana contact contract: name + email + message (+subscribe).
 */

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'درخواست نامعتبر است.' }, { status: 400 }) }
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (name.length < 3 || name.length > 100 || !emailIsValid(email) || message.length < 10 || message.length > 4000) {
    return NextResponse.json({ error: 'نام، ایمیل معتبر و متنی بین ۱۰ تا ۴٬۰۰۰ نویسه وارد کنید.' }, { status: 400 })
  }
  mockMessages.push({ name, email, message, subscribe: body.subscribe === true, createdAt: new Date().toISOString() })
  return NextResponse.json({ message: 'پیام شما دریافت شد. از تماس‌تان سپاسگزاریم.' }, { status: 201 })
}
