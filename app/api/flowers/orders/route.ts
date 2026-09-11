import { NextResponse } from 'next/server';
import { products } from '@/app/v19/_lib/catalog';
export async function POST(request: Request) {
 try {
  const body = await request.json();
  const phone = String(body.phone ?? '').replace(/[۰-۹]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[\s-]/g, '');
  if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.length > 100 || !/^09\d{9}$/.test(phone) || typeof body.address !== 'string' || body.address.trim().length < 10 || body.address.length > 1000) {
   return NextResponse.json({ error: 'لطفاً نام، شماره موبایل معتبر و آدرس کامل را وارد کنید.' }, { status: 400 });
  }
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 20) return NextResponse.json({ error: 'سبد گل شما خالی است.' }, { status: 400 });
  let total = 0;
  for (const item of body.items) {
   const product = products.find(p => p.id === item.id);
   if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) return NextResponse.json({ error: 'محصول یا تعداد انتخاب‌شده معتبر نیست.' }, { status: 400 });
   total += product.price * item.quantity;
  }
  // Mock adapter: no payment is taken and no production database is accessed.
  return NextResponse.json({ id: `SIM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, total, status: 'mock', message: 'سفارش آزمایشی شما ثبت شد. پرداخت یا ارسال واقعی انجام نمی‌شود.' }, { status: 201 });
 } catch { return NextResponse.json({ error: 'درخواست معتبر نیست. دوباره تلاش کنید.' }, { status: 400 }); }
}
