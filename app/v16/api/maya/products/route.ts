import { NextResponse } from "next/server";
import { getBundleProducts, getCollections } from "../../../lib/data";

/** /v16 mock catalog endpoint — replace internals with Prisma queries later. */
export async function GET() {
  const [products, collections] = await Promise.all([getBundleProducts(), getCollections()]);
  return NextResponse.json({ ok: true, products, collections });
}
