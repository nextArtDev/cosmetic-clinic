import { NextResponse } from 'next/server';
import { unionRepository } from '@/app/v21/data';

// Namespaced mock API for the /v21 UNION demo. No auth, database, or email.
export async function GET() {
  return NextResponse.json({ screenings: await unionRepository.listScreenings(), mode: 'demo' });
}
