import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionHeading from "../../components/ui/SectionHeading";
import Reveal from "../../components/ui/Reveal";
import NovaSite from "../../components/nova-site";
import { V5Shell } from "../../components/v5-shell";
import { site } from "../../lib/site";

const pages: Record<
  string,
  { title: string; eyebrow: string; intro: string; sections: { h: string; p: string }[] }
> = {
  "mentions-legales": {
    title: "*شرایط* استفاده",
    eyebrow: "اطلاعات",
    intro: "اطلاعات مربوط به ارائه‌دهنده و میزبانی این سایت.",
    sections: [
      { h: "ارائه‌دهنده", p: `${site.name} — ${site.address}. تلفن: ${site.phone}. ایمیل: ${site.email}.` },
      { h: "مدیر مسئول", p: "مدیریت کلینیک." },
      { h: "میزبانی", p: "این سایت روی زیرساخت داخل ایران میزبانی می‌شود." },
      { h: "مالکیت فکری", p: "تمام محتوا (متن، تصویر، برند) محافظت‌شده است. بازتولید بدون مجوز ممنوع است." },
    ],
  },
  confidentialite: {
    title: "حریم *خصوصی*",
    eyebrow: "داده‌های شما",
    intro: "چگونه اطلاعات شخصی شما را جمع‌آوری، استفاده و محافظت می‌کنیم.",
    sections: [
      { h: "داده‌های گردآوری‌شده", p: "فرم مشاوره (پروفایل، وضعیت، تماس) و ثبت‌نام راهنما (ایمیل). هیچ داده‌ای بازفروش نمی‌شود." },
      { h: "اهداف", p: "پاسخ به درخواست شما، تنظیم جلسه مشاوره و ارسال راهنمای درخواستی." },
      { h: "مدت نگهداری", p: "سه سال از آخرین تماس، مگر الزام قانونی دیگر." },
      { h: "حقوق شما", p: `دسترسی، اصلاح، حذف و مخالفت: به ${site.email} بنویسید.` },
    ],
  },
  cookies: {
    title: "سیاست *کوکی‌ها*",
    eyebrow: "کوکی",
    intro: "ردیاب‌های استفاده‌شده در این سایت و روش تنظیم آن‌ها.",
    sections: [
      { h: "کوکی‌های ضروری", p: "برای عملکرد سایت و ذخیره انتخاب‌های شما لازم‌اند." },
      { h: "آمار بازدید", p: "آمار گمنام بازدید، فقط با موافقت شما." },
      { h: "مارکتینگ", p: "شخصی‌سازی کمپین‌ها، فقط با موافقت شما." },
      { h: "تغییر انتخاب‌ها", p: "داده‌های سایت را در مرورگر پاک کنید تا پیام رضایت دوباره ظاهر شود." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug];
  return { title: page ? page.title.replace(/\*/g, "") : "صفحه", robots: { index: false, follow: false } };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();

  return (
    <V5Shell>
      <NovaSite>
        <section className="nc:bg-paper   nc:pb-24   nc:pt-[120px]   nc:sm:pb-32   nc:sm:pt-[150px]">
          <div className="nc:mx-auto   nc:max-w-3xl   nc:px-5   nc:sm:px-8">
            <SectionHeading as="h1" eyebrow={page.eyebrow} title={page.title} description={page.intro} />
            <div className="nc:mt-12   nc:space-y-4">
              {page.sections.map((s, i) => (
                <Reveal key={s.h} delay={i} className="nc:rounded-2xl   nc:bg-white   nc:p-6   nc:ring-1   nc:ring-ink/5">
                  <h2 className="nc:text-[1.1rem]   nc:font-semibold  ">{s.h}</h2>
                  <p className="nc:mt-2   nc:text-[15px]   nc:leading-relaxed   nc:text-graphite">{s.p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </NovaSite>
    </V5Shell>
  );
}
