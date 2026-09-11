import { NextResponse } from 'next/server';
import { getIranfitContent } from '@/app/v20/data';

// Scoped mock-backend endpoint for the /v20 IRANFIT route only (mirrors the
// upstream /api/iranfit/content route). Additive: nothing else in app/api is
// touched. Swap the loader with a Prisma-backed one later — the response
// contract (IranfitContent) stays the same.
export const dynamic = 'force-dynamic';

export async function GET() {
  const content = await getIranfitContent();
  return NextResponse.json(content, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
