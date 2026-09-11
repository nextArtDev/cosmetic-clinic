import { NextRequest, NextResponse } from 'next/server';
import { unionRepository } from '@/app/v21/data';

// Namespaced mock API for the /v21 UNION demo. Deliberately mocked: no email,
// payment, real booking, or production writes.
export async function POST(request: NextRequest) {
  try {
    if (Number(request.headers.get('content-length') || 0) > 8192) {
      return NextResponse.json({ error: 'درخواست بیش از حد طولانی است.' }, { status: 413 });
    }
    const body = await request.json();
    if (!body || typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: 'لطفاً یک نشانی ایمیل معتبر وارد کنید.' }, { status: 400 });
    }
    if (body.type !== 'reservation' && body.type !== 'newsletter') {
      return NextResponse.json({ error: 'نوع درخواست معتبر نیست.' }, { status: 400 });
    }
    if (body.type === 'reservation') {
      if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.length > 100) {
        return NextResponse.json({ error: 'لطفاً نام و نام خانوادگی خود را وارد کنید.' }, { status: 400 });
      }
      const screening = await unionRepository.findScreening(body.screeningId);
      if (!screening || screening.status !== 'upcoming') {
        return NextResponse.json({ error: 'این اکران برای رزرو در دسترس نیست.' }, { status: 400 });
      }
      if (!Number.isInteger(body.quantity) || body.quantity < 1 || body.quantity > 4) {
        return NextResponse.json({ error: 'تعداد صندلی باید بین ۱ تا ۴ باشد.' }, { status: 400 });
      }
    }
    return NextResponse.json({ success: true, mode: 'demo', reference: `UN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, message: body.type === 'reservation' ? 'رزرو آزمایشی شما ثبت شد. این رزرو، بلیت واقعی نیست.' : 'عضویت آزمایشی شما ثبت شد. در این نسخه ایمیلی ارسال نمی‌شود.' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'درخواست قابل پردازش نیست. دوباره تلاش کنید.' }, { status: 400 });
  }
}
