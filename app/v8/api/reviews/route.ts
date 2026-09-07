import { NextRequest, NextResponse } from 'next/server'

/**
 * /v8 community reviews API — MOCK ONLY (same pattern as the other v8
 * mock routes). No Prisma; the GET list lives in module memory for this
 * server instance. Replace with real persistence when v8 goes live.
 *   GET  /v8/api/reviews            -> Review[]
 *   POST /v8/api/reviews { name, rating, comment }
 *      -> 201 { success: true, review } | 400 | 403 | 429
 */

export const runtime = 'nodejs'

export const dynamic = 'force-dynamic'

type Review = { id: number; name: string; rating: number; comment: string; verified: boolean }

let nextId = 1
const reviews: Review[] = []

export async function GET() {
  return NextResponse.json(
    [...reviews].reverse().slice(0, 30),
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(request: NextRequest) {
  if (Number(request.headers.get('content-length') || 0) > 16000) {
    return NextResponse.json({ error: 'درخواست شما بیش از حد طولانی است.' }, { status: 413 })
  }
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      const originHost = new URL(origin).host
      if (
        originHost !== request.headers.get('host') &&
        originHost !== request.headers.get('x-forwarded-host')
      ) {
        return NextResponse.json({ error: 'این درخواست مجاز نیست.' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'این درخواست مجاز نیست.' }, { status: 403 })
    }
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'درخواست نامعتبر است.' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const comment = typeof body.comment === 'string' ? body.comment.trim() : ''
  const rating = body.rating

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json(
      { error: 'نام را بین ۲ تا ۸۰ نویسه وارد کنید.' },
      { status: 400 },
    )
  }
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'امتیاز باید بین ۱ تا ۵ باشد.' }, { status: 400 })
  }
  if (comment.length < 12 || comment.length > 2000) {
    return NextResponse.json(
      { error: 'متن تجربه را بین ۱۲ تا ۲۰۰۰ نویسه وارد کنید.' },
      { status: 400 },
    )
  }

  const review: Review = { id: nextId++, name, rating, comment, verified: false }
  reviews.push(review)

  return NextResponse.json({ success: true, review }, { status: 201 })
}
