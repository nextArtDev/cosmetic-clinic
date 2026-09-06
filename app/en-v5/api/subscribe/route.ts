import { NextResponse } from "next/server";
import { z } from "zod";

// Mock route for the /v5 NOVA Capillaire port — no database.

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide").max(160),
  source: z.string().trim().max(40).optional().default("footer"),
});

const store = globalThis as unknown as {
  __v5GuideSubscribers?: Set<string>;
};
store.__v5GuideSubscribers ??= new Set();

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 422 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const already = store.__v5GuideSubscribers!.has(email);
  store.__v5GuideSubscribers!.add(email);
  console.log("[v5 mock] guide subscriber:", email, already ? "(duplicate ignored)" : "");

  return NextResponse.json({
    ok: true,
    message: already
      ? "Vous êtes déjà inscrit : le guide arrive dans votre boîte mail."
      : "C'est noté : le guide arrive dans votre boîte mail.",
  });
}
