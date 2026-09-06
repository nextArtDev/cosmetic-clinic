import { NextRequest, NextResponse } from "next/server";
import { bookingTreatments, timeSlots } from "../../lib/clinic-data";

export const dynamic = "force-dynamic";

/**
 * /v4 mock appointment backend — in-memory only, mirrors the response
 * contract of chat-clone/pegasus-clinic's /api/appointments (drizzle+pg in
 * the original). Replace the store below with Prisma when wiring this up to
 * the real backend. Nothing here touches the production database.
 */
const bookedSlots = new Map<string, Set<string>>();

function validateDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00+09:00`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  const max = new Date();
  max.setDate(max.getDate() + 90);
  return value > today && value <= max.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!validateDate(date)) return NextResponse.json({ error: "明日から90日以内の日付を選択してください。" }, { status: 400 });
  if (new Date(`${date}T12:00:00+09:00`).getUTCDay() === 3) return NextResponse.json({ slots: [], closed: true });
  const booked = bookedSlots.get(date) ?? new Set<string>();
  return NextResponse.json({ slots: timeSlots.filter((time) => !booked.has(time)), closed: false });
}

export async function POST(request: NextRequest) {
  try {
    if (Number(request.headers.get("content-length") ?? 0) > 16_384) return NextResponse.json({ error: "入力内容が長すぎます。" }, { status: 413 });
    const body = await request.json();
    const { name, email, phone, treatment, date, time, message, consent } = body ?? {};
    if (typeof name !== "string" || name.trim().length < 2 || name.length > 100) return NextResponse.json({ error: "お名前を2〜100文字で入力してください。" }, { status: 400 });
    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "有効なメールアドレスを入力してください。" }, { status: 400 });
    if (typeof phone !== "string" || !/^[+\d\s()-]{8,30}$/.test(phone) || phone.replace(/\D/g, "").length < 8) return NextResponse.json({ error: "電話番号を正しく入力してください。" }, { status: 400 });
    if (!bookingTreatments.includes(treatment) || !validateDate(date) || !timeSlots.includes(time) || consent !== true) return NextResponse.json({ error: "施術、予約日時、ご同意内容をご確認ください。" }, { status: 400 });
    if (new Date(`${date}T12:00:00+09:00`).getUTCDay() === 3) return NextResponse.json({ error: "休診日以外の日付を選択してください。" }, { status: 400 });
    if (message != null && (typeof message !== "string" || message.length > 2000)) return NextResponse.json({ error: "ご相談内容は2,000文字以内で入力してください。" }, { status: 400 });
    let daySlots = bookedSlots.get(date);
    if (!daySlots) { daySlots = new Set<string>(); bookedSlots.set(date, daySlots); }
    if (daySlots.has(time)) return NextResponse.json({ error: "この時間は予約済みです。別の時間をお選びください。" }, { status: 409 });
    const reference = `PG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    daySlots.add(time);
    return NextResponse.json({ reference, date, time, treatment, demo: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "入力内容をご確認ください。" }, { status: 400 });
    console.error("Appointment request failed", error);
    return NextResponse.json({ error: "送信できませんでした。時間をおいて再度お試しください。" }, { status: 503 });
  }
}
