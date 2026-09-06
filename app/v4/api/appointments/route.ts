import { NextRequest, NextResponse } from "next/server";
import { bookingTreatments, timeSlots } from "../../lib/clinic-data";

export const dynamic = "force-dynamic";

/**
 * بک‌اند آزمایشی نوبت‌دهی /v4 — فقط در حافظه، هم‌قرارداد با پاسخ
 * /api/appointments پروژهٔ مرجع. هنگام اتصال به بک‌اند واقعی، همین
 * قرارداد با Prisma پیاده‌سازی شود. به دیتابیس پروDUCTION دست نمی‌زند.
 */
const bookedSlots = new Map<string, Set<string>>();

function validateDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00+03:30`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tehran" });
  const max = new Date();
  max.setDate(max.getDate() + 90);
  return value > today && value <= max.toLocaleDateString("sv-SE", { timeZone: "Asia/Tehran" });
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!validateDate(date)) return NextResponse.json({ error: "تاریخ را از فردا تا ۹۰ روز آینده انتخاب کنید." }, { status: 400 });
  if (new Date(`${date}T12:00:00+03:30`).getDay() === 5) return NextResponse.json({ slots: [], closed: true });
  const booked = bookedSlots.get(date) ?? new Set<string>();
  return NextResponse.json({ slots: timeSlots.filter((time) => !booked.has(time)), closed: false });
}

export async function POST(request: NextRequest) {
  try {
    if (Number(request.headers.get("content-length") ?? 0) > 16_384) return NextResponse.json({ error: "حجم اطلاعات ارسالی بیش از حد مجاز است." }, { status: 413 });
    const body = await request.json();
    const { name, email, phone, treatment, date, time, message, consent } = body ?? {};
    if (typeof name !== "string" || name.trim().length < 2 || name.length > 100) return NextResponse.json({ error: "نام را با ۲ تا ۱۰۰ نویسه وارد کنید." }, { status: 400 });
    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "ایمیل معتبر وارد کنید." }, { status: 400 });
    if (typeof phone !== "string" || !/^[+\d\s()-]{8,30}$/.test(phone) || phone.replace(/\D/g, "").length < 8) return NextResponse.json({ error: "شماره تماس را صحیح وارد کنید." }, { status: 400 });
    if (!bookingTreatments.includes(treatment) || !validateDate(date) || !timeSlots.includes(time) || consent !== true) return NextResponse.json({ error: "خدمت، تاریخ و ساعت و تأیید قوانین را بررسی کنید." }, { status: 400 });
    if (new Date(`${date}T12:00:00+03:30`).getDay() === 5) return NextResponse.json({ error: "روزی غیر از جمعه انتخاب کنید؛ جمعه‌ها کلینیک تعطیل است." }, { status: 400 });
    if (message != null && (typeof message !== "string" || message.length > 2000)) return NextResponse.json({ error: "متن توضیحات حداکثر ۲۰۰۰ نویسه است." }, { status: 400 });
    let daySlots = bookedSlots.get(date);
    if (!daySlots) { daySlots = new Set<string>(); bookedSlots.set(date, daySlots); }
    if (daySlots.has(time)) return NextResponse.json({ error: "این ساعت پیش‌تر رزرو شده است؛ ساعت دیگری انتخاب کنید." }, { status: 409 });
    const reference = `DRF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    daySlots.add(time);
    return NextResponse.json({ reference, date, time, treatment, demo: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "اطلاعات ارسالی را بررسی کنید." }, { status: 400 });
    console.error("Appointment request failed", error);
    return NextResponse.json({ error: "ارسال انجام نشد؛ کمی بعد دوباره تلاش کنید." }, { status: 503 });
  }
}
