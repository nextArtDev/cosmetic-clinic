import { NextResponse } from 'next/server';
import { saveDemoRequest, type DemoRequest } from '@/app/v18/_server/demo-repository';

// Demo endpoint for the /v18 Melius experience. Validation and response
// contract are identical to the upstream chat-clone/melus-v2 route
// (src/app/api/melius/demo); persistence is the in-memory demo adapter in
// app/v18/_server/demo-repository.ts (upstream used a Drizzle table, which
// would touch this app's database). This route is additive: nothing else in
// app/api is touched.
export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 10000) return NextResponse.json({ error: 'حجم درخواست بیش از حد مجاز است.' }, { status: 413 });
    let body: Record<string, unknown>;
    try { body = JSON.parse(text); } catch { return NextResponse.json({ error: 'درخواست نامعتبر است.' }, { status: 400 }); }
    if (!body || typeof body !== 'object' || !['signup', 'contact', 'generate'].includes(String(body.intent))) {
      return NextResponse.json({ error: 'نوع درخواست معتبر نیست.' }, { status: 400 });
    }
    const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
    const intent = body.intent as DemoRequest['intent'];
    const name = clean(body.name, 100);
    const email = clean(body.email, 254).toLowerCase();
    const prompt = clean(body.prompt, 1500);
    const plan = clean(body.plan, 40);
    if (intent !== 'generate' && (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return NextResponse.json({ error: 'نام و ایمیل معتبر وارد کن.' }, { status: 400 });
    }
    if (intent === 'generate' && prompt.length < 5) {
      return NextResponse.json({ error: 'ایده‌ات را در حداقل ۵ کاراکتر توصیف کن.' }, { status: 400 });
    }
    const result = await saveDemoRequest({ intent, name: name || undefined, email: email || undefined, prompt: prompt || undefined, plan: plan || undefined });
    const image = /جنگل|طبیعت|درخت/.test(prompt) ? 10 : /کفش|چرم/.test(prompt) ? 3 : /گل|ایران|اصفهان/.test(prompt) ? 23 : /نوشیدنی|پرتقال/.test(prompt) ? 16 : 17;
    return NextResponse.json({ id: result.id, demo: true, image: `/melius/images/hero-${image}.webp`, message: intent === 'generate' ? 'پیش‌نمایش آماده از گالری نمونه‌ها انتخاب شد؛ این تصویر تولید زنده نیست.' : 'درخواست آزمایشی تو با موفقیت ثبت شد. هیچ حساب یا اشتراک پولی ایجاد نشده است.' }, { status: 201 });
  } catch (error) {
    console.error('Melius demo request failed', error);
    return NextResponse.json({ error: 'ثبت درخواست ممکن نشد. لطفاً دوباره تلاش کن.' }, { status: 500 });
  }
}
