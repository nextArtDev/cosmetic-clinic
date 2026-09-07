import Reveal from './Reveal'
import { site } from '../lib/data'

export default function Visit() {
  return (
    <section id="visit" className="component overflow-hidden">
      <div className="container-wondr">
        <div className="grid grid-cols-1 gap-[3.2rem] lg:grid-cols-2">
          {/* Gift cards */}
          <Reveal y={50} x={0} skew={3}>
            <div
              id="gift-cards"
              className="group relative overflow-hidden rounded-[3rem] lk:bg-gradient-to-br lk:from-rose lk:via-pink-soft/70 lk:to-pink p-[4rem] md:p-[6rem]"
            >
              <span
                aria-hidden
                className="blob-shape absolute -left-[8rem] -top-[8rem] h-[32rem] w-[32rem] lk:bg-cream/25"
              />
              <div className="relative z-[1]">
                <span className="eyebrow-wide block lk:text-ink/60">کارتی هدیه سلامتی</span>
                <h3 className="mt-[1.6rem] text-[3.6rem] leading-[5rem] lk:text-ink">
                  هدیه‌ای که زندگی را آسان‌تر می‌کند
                </h3>
                <p className="body-sm mt-[2rem] max-w-[38rem] lk:text-ink/70">
                  با هر مبلغی قابل تهیه و قابل استفاده برای همه‌ی خدمات و آزمایش‌ها. بلافاصله
                  پیامک می‌شود یا به‌صورت کارت چاپی از کلینیک تحویل داده می‌شود.
                </p>
                <a
                  href="#enquire"
                  data-cursor="cta"
                  className="mt-[3.2rem] inline-flex h-[4.8rem] items-center rounded-full lk:bg-ink px-[2.8rem] text-[1.6rem] font-bold lk:text-cream transition-all duration-500 hover:shadow-[0_20px_20px_rgba(0,0,0,.15)]"
                >
                  خرید کارت هدیه
                </a>
              </div>
            </div>
          </Reveal>

          {/* Location */}
          <Reveal delay={0.15} y={50} x={0} skew={3}>
            <div className="relative overflow-hidden rounded-[3rem] lk:bg-gradient-to-br lk:from-sky-pale lk:via-sky-soft/45 lk:to-sky p-[4rem] md:p-[6rem]">
              <span
                aria-hidden
                className="blob-shape absolute -bottom-[10rem] -right-[8rem] h-[32rem] w-[32rem] lk:bg-cream/30"
              />
              <div className="relative z-[1]">
                <span className="eyebrow-wide block lk:text-ink/60">آدرس و ساعت کاری</span>
                <h3 className="mt-[1.6rem] text-[3.6rem] leading-[5rem] lk:text-ink">
                  تجریش، تهران
                </h3>
                <p className="body-sm mt-[2rem] max-w-[38rem] lk:text-ink/75">{site.address}</p>
                <dl className="mt-[3.2rem] grid grid-cols-2 gap-[2rem] max-w-[38rem]">
                  {site.hours.map((row) => (
                    <div key={row.k}>
                      <dt className="text-[1.1rem] font-bold lk:text-ink/50">{row.k}</dt>
                      <dd className="num mt-[0.4rem] text-[1.8rem] font-bold lk:text-ink">
                        {row.v}
                      </dd>
                    </div>
                  ))}
                </dl>
                <a
                  href={site.mapsHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="cta"
                  className="mt-[3.2rem] inline-flex h-[4.8rem] items-center rounded-full lk:bg-cream px-[2.8rem] text-[1.6rem] font-bold lk:text-ink transition-all duration-500 hover:shadow-[0_20px_20px_rgba(0,0,0,.15)]"
                >
                  مسیر کلینیک
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
