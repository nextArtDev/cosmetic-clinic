'use client'

import { useRef, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { gsap } from '../lib/anim'
import Magnetic from './Magnetic'
import { faToman } from '../lib/fa'
import type { IranfitPlan } from '../data/types'

export default function Pricing({ plans }: { plans: IranfitPlan[] }) {
  const [yearly, setYearly] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLSpanElement>(null)
  const toggleRef = useRef<HTMLDivElement>(null)

  const switchPeriod = (toYearly: boolean) => {
    setYearly(toYearly)
    const toggle = toggleRef.current
    const thumb = thumbRef.current
    if (toggle && thumb) {
      const btn = toggle.querySelectorAll('button')[toYearly ? 1 : 0]
      gsap.to(thumb, {
        x: btn.offsetLeft * -1 + (document.dir === 'rtl' ? 0 : 0),
        left: btn.offsetLeft,
        width: btn.offsetWidth,
        duration: 0.5,
        ease: 'power3.inOut',
      })
    }
    const grid = gridRef.current
    if (grid) {
      gsap.fromTo(
        grid.querySelectorAll('.if-price-value b'),
        { scale: 0.82, opacity: 0.3 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.55,
          stagger: 0.06,
          ease: 'back.out(2.2)',
        },
      )
    }
  }

  return (
    <section id="pricing" data-if-spy="۶" className="if-section">
      <span className="if-ghost" data-if-parallax>
        ۰۶
      </span>
      <div className="if-container">
        <div style={{ textAlign: 'center' }}>
          <p
            className="if-kicker"
            style={{ justifyContent: 'center' }}
            data-if-reveal
          >
            ۰۶ · تعرفه‌ها
          </p>
          <h2 className="if-title" data-if-reveal data-if-delay="0.08">
            از امروز شروع کن، <em>از خودت که بگذری</em>
          </h2>
          <p
            className="if-lead"
            style={{ marginInline: 'auto' }}
            data-if-reveal
            data-if-delay="0.16"
          >
            هفت روز اول رایگان است؛ بدون نیاز به کارت بانکی. هر وقت خواستی، با
            چند لمس لغوش کن.
          </p>
        </div>

        <div className="if-toggle-wrap" data-if-reveal data-if-delay="0.2">
          <div
            className="if-toggle"
            ref={toggleRef}
            role="tablist"
            aria-label="دوره پرداخت"
          >
            <span
              ref={thumbRef}
              className="if-toggle-thumb"
              style={{ left: 5, width: 'calc(50% - 5px)' }}
              aria-hidden
            />
            <button
              role="tab"
              aria-selected={!yearly}
              className={!yearly ? 'is-on' : ''}
              onClick={() => switchPeriod(false)}
            >
              ماهانه
            </button>
            <button
              role="tab"
              aria-selected={yearly}
              className={yearly ? 'is-on' : ''}
              onClick={() => switchPeriod(true)}
            >
              سالانه
            </button>
            <span className="if-toggle-save">٪۲۰ تخفیف</span>
          </div>
        </div>

        <div className="if-price-grid" ref={gridRef}>
          {plans.map((p, i) => {
            const price = yearly ? p.yearlyPrice : p.monthlyPrice
            return (
              <article
                key={p.slug}
                className={`if-price-card ${p.popular ? 'is-popular' : ''}`}
                data-if-reveal
                data-if-delay={String(0.12 + i * 0.1)}
              >
                {p.popular && (
                  <span className="if-price-tag">پیشنهاد محبوب</span>
                )}
                <div>
                  <h3 className="if-price-name">{p.name}</h3>
                  <p className="if-price-desc">
                    {p.slug === 'basic' && 'برای شروع و ساختن عادت'}
                    {p.slug === 'pro' && 'برای نتیجه جدی با پشتیبانی مربی'}
                    {p.slug === 'champion' && 'تجربه کامل مربیگری اختصاصی'}
                  </p>
                </div>
                <div className="if-price-value">
                  <b>{faToman(price)}</b>
                  <span>تومان / ماه</span>
                  {yearly && <s>{faToman(p.monthlyPrice)}</s>}
                </div>
                <ul className="if-price-feats">
                  {p.features.map((f) => (
                    <li key={f}>
                      <Check size={15} strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Magnetic strength={0.3}>
                  <button
                    className={`if-btn ${p.popular ? 'if-btn--solid' : 'if-btn--ghost'}`}
                    style={{ width: '100%' }}
                  >
                    <Sparkles size={15} />
                    {p.popular ? 'شروع با پلن حرفه‌ای' : 'انتخاب پلن ' + p.name}
                  </button>
                </Magnetic>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
