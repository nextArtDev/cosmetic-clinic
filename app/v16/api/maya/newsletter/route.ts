import { NextResponse } from "next/server";

/**
 * /v16 mock newsletter — same contract as the v2 drizzle route, backed by an
 * in-memory set (no Prisma model, no table, no migration). Swap with a real
 * insert when the route goes live; the client never changes.
 */
const globalForV16 = globalThis as typeof globalThis & {
  __v16MayaSubscribers?: string[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    const subscribers = (globalForV16.__v16MayaSubscribers ??= []);
    const already = subscribers.includes(email);
    if (!already) subscribers.push(email);

    return NextResponse.json({ ok: true, already });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
