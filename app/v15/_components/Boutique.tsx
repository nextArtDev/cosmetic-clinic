'use client'

import { Clock, MapPin, Phone, ArrowLeft } from 'lucide-react'
import { useV15 } from '../_lib/store'
import { faDigits } from '../_lib/format'
import { WordsReveal, FadeUp, ImageReveal } from './Reveal'
import Magnetic from './Magnetic'

/**
 * Boutique appointment — split editorial panel with parallax imagery
 * and a magnetic CTA (mock booking, ready for a real reservation API).
 */
export default function Boutique() {
  const { toast } = useV15()

  return (
    <section id="boutique" className="v15-bg2 grid grid-cols-1 md:grid-cols-2">
      {/* image */}
      <div className="relative min-h-[70svh] md:min-h-[88svh]">
        <ImageReveal
          src="/maison/craft-tools.jpg"
          alt="میزِ کارِ کارگاهِ راگا با ابزارِ برنجی"
          ratio="absolute inset-0 h-full"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* content */}
      <div className="flex flex-col justify-center gap-8 px-6 py-20 md:px-16 md:py-28">
        <FadeUp>
          <p className="mb-3 flex items-center gap-3 text-xs tracking-[0.2em] opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--v15-caramel)]" />
            بوتیکِ راگا
            <span className="v15-latin text-[10px] uppercase tracking-[0.35em] opacity-60">
              The Boutique
            </span>
          </p>
        </FadeUp>

        <WordsReveal
          as="h2"
          text="تجربه را از نزدیک ببینید"
          className="text-4xl font-extralight leading-[1.5] md:text-5xl"
        />

        <FadeUp delay={0.1}>
          <p className="v15-ink2 max-w-md text-sm font-light leading-8">
            پشتِ دیوارِ شیشه‌ایِ بوتیک، کارگاه بیدار است. نوبت بگیرید تا دوختنِ
            کیفِ شما را جلویِ چشمانتان آغاز کنیم — همراه با چایِ نبعادی.
          </p>
        </FadeUp>

        <FadeUp delay={0.15} className="flex flex-col gap-4 text-sm font-light">
          <p className="flex items-center gap-3">
            <MapPin className="h-4 w-4 opacity-60" strokeWidth={1.5} />
            تهران، فرمانیه، گالری راگا — طبقه‌ی همکف
          </p>
          <p className="flex items-center gap-3">
            <Clock className="h-4 w-4 opacity-60" strokeWidth={1.5} />
            شنبه تا پنجشنبه — {faDigits('10')} تا {faDigits('21')}
          </p>
          <p className="flex items-center gap-3" dir="ltr">
            <Phone className="h-4 w-4 opacity-60" strokeWidth={1.5} />
            <span className="v15-latin tracking-[0.15em]">+98 21 220 00 000</span>
          </p>
        </FadeUp>

        <FadeUp delay={0.2}>
          <Magnetic strength={0.25}>
            <button
              type="button"
              data-cursor="hover"
              onClick={() =>
                toast(
                  'درگاهِ رزروِ نوبت به‌زودی متصل می‌شود',
                  'نسخه‌ی نمایشی — آماده‌ی اتصال به بک‌اند شما',
                )
              }
              className="v15-btn v15-btn--fill"
            >
              درخواستِ نوبت
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </Magnetic>
        </FadeUp>
      </div>
    </section>
  )
}