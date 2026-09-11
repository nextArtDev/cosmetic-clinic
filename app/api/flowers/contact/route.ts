import { NextResponse } from 'next/server';
export async function POST(request: Request) {
 try {
  const body = await request.json();
  const phone = String(body.phone ?? '').replace(/[۰-۹]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[\s-]/g, '');
  if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.length > 100 || !/^09\d{9}$/.test(phone) || typeof body.message !== 'string' || body.message.trim().length < 5 || body.message.length > 2000) return NextResponse.json({ error: 'لطفاً نام، شماره موبایل معتبر و پیامتان را کامل کنید.' }, { status: 400 });
  return NextResponse.json({ status: 'mock', message: 'پیام آزمایشی شما دریافت شد. در این نسخه پیام برای استودیو ارسال نمی‌شود.' });
 } catch { return NextResponse.json({ error: 'ارسال پیام ناموفق بود. دوباره تلاش کنید.' }, { status: 400 }); }
}
