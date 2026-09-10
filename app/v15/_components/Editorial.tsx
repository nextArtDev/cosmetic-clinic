'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { V15_EASE, getV15IntroDelay } from './Preloader';
import { FadeUp } from './Reveal';

/** V15 — One large editorial hero image (image pulls in from far below,
 * settles as it enters). Clickable → shop, with a tagline + buy button.
 */
export default function Editorial() {
  const delay = getV15IntroDelay();

  return (
    <section
      id="editorial"
      className="relative overflow-hidden px-5 py-8 md:px-10 md:py-14"
    >
      <div className="mx-auto max-w-4xl">
        <FadeUp delay={0.05}>
          <p className="mb-3 flex items-center gap-3 text-xs tracking-[0.2em] opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--v15-caramel)]" />
            از کارگاه
            <span className="v15-latin text-[10px] uppercase tracking-[0.35em] opacity-60">
              From The Atelier
            </span>
          </p>
        </FadeUp>

        <div
          className="group cursor-pointer relative aspect-[5/6] w-full overflow-hidden"
          onClick={() => {
            const shopHref = document.querySelector('[href="#shop"]');
            shopHref?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          role="button"
          tabIndex={0}
          aria-label="برگشت به نمایشگاهِ فروشگاه"
        >
          <motion.div
            className="absolute inset-0"
            initial={{ y: '42%', scale: 0.9 }}
            whileInView={{ y: '0%', scale: 1 }}
            viewport={{ once: true, margin: '-20% 0px' }}
            transition={{ duration: 1.55, ease: V15_EASE, delay: 0.25 }}
          >
            <Image
              src="/maison/collection-2.jpg"
              alt="ماه‌تابِ مینی — زنده‌نمایی از کارگاه در نورِ طبیعی"
              fill
              sizes="(max-width: 900px) 88vw, 50vw"
              className="v15-zoom object-cover"
            />
          </motion.div>

          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--v15-ink)]/92 via-transparent to-transparent">
            <motion.div
              className="absolute left-0 bottom-0 z-10 max-w-md p-6 md:left-10 md:p-10 md:max-w-lg"
              initial={{ opacity: 0, x: '-12%' }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: V15_EASE, delay: 0.55 }}
            >
              <h3 className="text-2xl font-extralight md:text-3xl lg:text-4xl">
                ماه‌تابِ مینی
              </h3>
              <p className="v15-latin mt-3 text-sm tracking-[0.3em] uppercase opacity-70">
                MAHTAB MINI — SPRING 1404 SH
              </p>
              <p className="v15-ink2 mt-4 text-sm font-light leading-7 md:text-base">
                چرمِ ارز اولیه، بندِ کتان؛ سبکِ روزهای کوتاه‌تر.
                یک کیفی که در راستِ در، ناپدید می‌شود اگر آست.
              </p>
              <button
                type="button"
                data-cursor="hover"
                className="mt-6 v15-btn v15-btn--light"
              >
                بخرید از فروشگاه'
                '
                <span className="text-xs opacity-60">→</span>
              </button>
            </motion.div>
          </div>

          <div className="absolute bottom-4 right-4 h-1.5 w-1.5 rounded-full bg-[color:var(--v15-paper)] opacity-70" />
        </div>

        <FadeUp delay={0.1}>
          <p className="mt-4 text-right text-xs font-light opacity-50">
            فالس‌نامهِ کیف در کاتالوگِ بوتیک
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
