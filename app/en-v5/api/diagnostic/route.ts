import { NextResponse } from "next/server";
import { z } from "zod";

// Mock route for the /v5 NOVA Capillaire port — no database.
// When the port gets its real backend, replace the in-memory store with
// your Prisma models (see app/(dashboard) patterns in lib/actions).

export const dynamic = "force-dynamic";

const schema = z.object({
  profile: z.enum(["homme", "femme", "afro"]),
  concern: z.enum(["golfes", "tonsure", "ligne", "densite", "traction", "barbe", "autre"]),
  duration: z.enum(["<1", "1-3", "3-5", ">5"]),
  age: z.coerce.number().int().min(18).max(90).optional().nullable(),
  firstName: z.string().trim().min(2, "Prénom trop court").max(80),
  email: z.string().trim().email("Adresse e-mail invalide").max(160),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  message: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  consent: z.literal(true, { message: "Votre consentement est requis." }),
});

const store = globalThis as unknown as {
  __v5DiagnosticRequests?: { id: number; createdAt: string }[];
};
store.__v5DiagnosticRequests ??= [];

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, message: first?.message ?? "Données invalides.", field: first?.path?.[0] },
      { status: 422 },
    );
  }

  const d = parsed.data;
  const id = store.__v5DiagnosticRequests!.length + 1;
  store.__v5DiagnosticRequests!.push({ id, createdAt: new Date().toISOString() });

  console.log("[v5 mock] diagnostic request stored:", {
    id,
    profile: d.profile,
    concern: d.concern,
    email: d.email.toLowerCase(),
  });

  return NextResponse.json({
    ok: true,
    id,
    reference: `NOVA-${String(id).padStart(5, "0")}`,
    message: "Votre demande a bien été enregistrée. Réponse sous 72 h.",
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, total: store.__v5DiagnosticRequests?.length ?? 0, mock: true });
}
