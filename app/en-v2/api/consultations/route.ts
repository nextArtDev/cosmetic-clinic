import { NextRequest, NextResponse } from 'next/server'

/**
 * English (v2 copy) consultation API — MOCK ONLY, in-memory store.
 * Same contract as /v2/api/consultations; swap for real persistence later.
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
      { error: 'Your message is too long.' },
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
          { error: 'This request is not permitted.' },
          { status: 403 },
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'This request is not permitted.' },
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
      { error: 'Please send a valid consultation form.' },
      { status: 400 },
    )
  }

  const field = (key: string) =>
    typeof body[key] === 'string' ? (body[key] as string).trim() : ''

  if (field('website')) {
    return NextResponse.json(
      { error: 'Unable to process this request.' },
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
    errors.name = 'Please enter your name (2–120 characters).'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    errors.email = 'Please enter a valid email address.'
  }
  if (phone.length > 40 || (phone && !/^[+\d\s().-]{5,40}$/.test(phone))) {
    errors.phone = 'Please enter a valid phone number.'
  }
  if (country.length > 120) {
    errors.country = 'Please use fewer than 120 characters.'
  }
  if (message.length > 3000) {
    errors.message = 'Please keep your message under 3,000 characters.'
  }
  if (!['general', 'targeted', 'follow-up'].includes(consultationType)) {
    errors.consultationType = 'Please choose a consultation type.'
  }
  if (body.consent !== true) {
    errors.consent = 'Please agree to the privacy notice to continue.'
  }
  if (Object.keys(errors).length) {
    return NextResponse.json(
      { error: 'Please check the highlighted fields.', errors },
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
          'A request for this email was recently received. Please allow 10 minutes before sending another.',
      },
      { status: 429 },
    )
  }

  const id = `${Date.now().toString(36)}${reference()}`
  recentRequests.push({ id, email, consultationType, createdAt: Date.now() })
  console.log(
    `[v2 copy mock] consultation request saved in-memory: ${consultationType} <${email}>`,
  )
  return NextResponse.json(
    { success: true, reference: reference().slice(0, 8) },
    { status: 201 },
  )
}
