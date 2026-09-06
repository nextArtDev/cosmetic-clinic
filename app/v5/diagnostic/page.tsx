import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Clock3, ShieldCheck, Stethoscope } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import NovaSite from "../components/nova-site";
import { V5Shell } from "../components/v5-shell";
import DiagnosticClient from "./DiagnosticClient";

export const metadata: Metadata = {
  title: "مشاوره آنلاین کاشت مو",
  description:
    "در سه مرحله وضعیت خود را توضیح دهید و ظرف ۴۸ ساعت ارزیابی اولیه تخصصی دریافت کنید؛ بدون تعهد.",
  robots: { index: false, follow: false },
};

const points = [
  { icon: Stethoscope, title: "بازبینی توسط پزشک", text: "پاسخ خودکار نیست؛ وضعیت شما توسط پزشک خوانده می‌شود." },
  { icon: Clock3, title: "در ۴۸ ساعت کاری", text: "برآورد اولیه تعداد گرافت و روش مناسب." },
  { icon: ShieldCheck, title: "بدون تعهد", text: "سپس با تمام اطلاعات در دست، خودتان تصمیم می‌گیرید." },
];

export default function DiagnosticPage() {
  return (
    <V5Shell>
      <NovaSite>
        <section className="nc:relative   nc:overflow-hidden   nc:bg-paper   nc:pb-24   nc:pt-[120px]   nc:sm:pb-32   nc:sm:pt-[150px]">
          <div className="nc:pointer-events-none   nc:absolute   nc:inset-0   nc:-z-0">
            <div className="nc:absolute   nc:start-1/2   nc:top-[-30%]   nc:h-[60vh]   nc:w-[100vw]   nc:-translate-x-1/2   nc:rounded-[100%]   nc:bg-[radial-gradient(closest-side,rgba(212,233,214,.7),transparent)]" />
          </div>
          <div className="nc:relative   nc:mx-auto   nc:grid   nc:max-w-7xl   nc:gap-12   nc:px-5   nc:sm:px-8   nc:lg:grid-cols-12   nc:lg:gap-14">
            <div className="nc:lg:col-span-5">
              <SectionHeading
                as="h1"
                eyebrow="مشاوره آنلاین"
                title={"تحلیل موهای شما\nدر *سه مرحله*"}
                description="به چند پرسش پاسخ می‌دهید، پزشک کلینیک وضعیت شما را بررسی و شخصاً پاسخ می‌دهد. حدود دو دقیقه."
              />
              <ul className="nc:mt-10   nc:space-y-4">
                {points.map((p, i) => (
                  <Reveal key={p.title} delay={i + 2} as="li" className="nc:flex   nc:items-start   nc:gap-4   nc:rounded-2xl   nc:bg-white   nc:p-4   nc:ring-1   nc:ring-ink/5">
                    <span className="nc:grid   nc:size-10   nc:shrink-0   nc:place-items-center   nc:rounded-full   nc:bg-sage-soft   nc:text-sage-deep">
                      <p.icon className="nc:size-4" />
                    </span>
                    <div>
                      <p className="nc:text-[15px]   nc:font-semibold">{p.title}</p>
                      <p className="nc:text-[13.5px]   nc:text-graphite">{p.text}</p>
                    </div>
                  </Reveal>
                ))}
              </ul>
              <Reveal delay={5} className="nc:relative   nc:mt-8   nc:aspect-[16/10]   nc:overflow-hidden   nc:rounded-[24px]   nc:shadow-soft">
                <Image
                  src="/v5/images/diagnostic.webp"
                  alt="بررسی پوست سر با تریکوسکوپ"
                  fill
                  sizes="(min-width:1024px) 38vw, 100vw"
                  className="nc:object-cover"
                />
              </Reveal>
            </div>
            <Reveal delay={1} className="nc:lg:col-span-7">
              <div className="nc:rounded-[28px]   nc:bg-white   nc:p-6   nc:shadow-lift   nc:ring-1   nc:ring-ink/5   nc:sm:p-9">
                <Suspense fallback={null}>
                  <DiagnosticClient />
                </Suspense>
              </div>
            </Reveal>
          </div>
        </section>
      </NovaSite>
    </V5Shell>
  );
}
