import { NextResponse } from 'next/server';
import { saveInquiry } from '@/app/v17/_server/inquiry-repository';

// Inquiry endpoint for the /v17 Privy demo form. Validation is identical to
// the upstream chat-clone/sobha-privy-collection route; persistence is the
// in-memory demo adapter in app/v17/_server/inquiry-repository.ts. This route
// is additive: nothing else in app/api is touched.
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    const requestHost = request.headers.get('x-forwarded-host')?.split(',')[0].trim() || request.headers.get('host') || new URL(request.url).host;
    if (origin && new URL(origin).host !== requestHost) {
      return NextResponse.json({ error: 'درخواست نامعتبر است.' }, { status: 403 });
    }
    const text = await request.text();
    if (text.length > 4096) return NextResponse.json({ error: 'درخواست بیش از حد طولانی است.' }, { status: 413 });
    const body = JSON.parse(text);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'ساختار درخواست نامعتبر است.' }, { status: 400 });
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.replace(/[۰-۹]/g, (d: string) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d: string) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[\s-]/g, '') : '';
    const { residence, preferredTime, consent } = body;
    if (name.length < 2 || name.length > 100 || !/^09\d{9}$/.test(phone) || !['all', 'elahieh', 'lavasan', 'caspian'].includes(residence) || !['morning', 'afternoon', 'evening'].includes(preferredTime) || consent !== true) {
      return NextResponse.json({ error: 'نام، شماره موبایل و زمان تماس را به‌درستی وارد کنید و رضایت خود را تأیید کنید.' }, { status: 400 });
    }
    if (body.website) return NextResponse.json({ error: 'درخواست نامعتبر است.' }, { status: 400 });
    const result = await saveInquiry({ name, phone, residence, preferredTime });
    if (result.duplicate) return NextResponse.json({ error: 'درخواست شما قبلاً ثبت شده است. برای ثبت مجدد یک دقیقه صبر کنید.' }, { status: 429 });
    return NextResponse.json({ id: result.id, message: 'درخواست نمایشی شما با موفقیت ثبت شد.' }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'ساختار درخواست نامعتبر است.' }, { status: 400 });
    console.error('Privy inquiry submission failed', error);
    return NextResponse.json({ error: 'ثبت درخواست در حال حاضر ممکن نیست. لطفاً دوباره تلاش کنید.' }, { status: 503 });
  }
}
