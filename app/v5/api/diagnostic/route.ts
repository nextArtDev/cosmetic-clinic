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
  firstName: z.string().trim().min(2, "نام خیلی کوتاه است").max(80),
  email: z.string().trim().email("ایمیل نامعتبر است").max(160),
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
  consent: z.literal(true, { message: "تأیید رضایت الزامی است." }),
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
    return NextResponse.json({ ok: false, message: "درخواست نامعتبر است." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    // Persian field labels for client-facing validation messages
    const labels: Record<string, string> = {
      profile: "پروفایل",
      concern: "ناحیه مورد نظر",
      duration: "مدت زمان",
      age: "سن",
      firstName: "نام",
      email: "ایمیل",
      phone: "شماره تماس",
      message: "توضیحات",
      consent: "رضایت‌نامه",
    };
    const field = String(first?.path?.[0] ?? "");
    const label = labels[field] ?? "اطلاعات";
    // zod enum/required failures arrive in English — map to a Persian sentence
    const msg = first?.message?.startsWith("Invalid") || first?.message?.startsWith("Invalid input")
      ? `${label} را کامل و درست انتخاب کنید.`
      : first?.message ?? "داده‌ها نامعتبرند.";
    return NextResponse.json(
      { ok: false, message: msg, field: field || undefined },
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
    reference: `KMC-${String(id).padStart(5, "0")}`,
    message: "درخواست شما ثبت شد. پاسخ ظرف ۴۸ ساعت اعلام می‌شود.",
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, total: store.__v5DiagnosticRequests?.length ?? 0, mock: true });
}
