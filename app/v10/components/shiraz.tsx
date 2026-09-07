'use client'

import { useRef, useState, type MouseEvent } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowLeft, ArrowRight, Check, CircleDashed, HeartPulse, Plus, RotateCcw, Stethoscope, Truck, X } from 'lucide-react'
import { Action, Corners, Eyebrow, Flower } from './ui'
import { useCart } from './cart-provider'
import {
  clinic, faqs, formatMoney, products, pressNames, reviews, steps, useCases, usePhotos,
} from '../lib/content'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const stepIcons = [CircleDashed, HeartPulse, Stethoscope]

/* -------------------------------- Opening -------------------------------- */

function Opening() {
  const previewMove = (event: MouseEvent<HTMLButtonElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    gsap.to(event.currentTarget.querySelector('.hero-patch'), { x: x * 0.2, y: y * 0.2, rotation: x * 0.015, duration: 0.65, ease: 'power3.out' })
  }
  const previewLeave = (event: MouseEvent<HTMLButtonElement>) => {
    gsap.to(event.currentTarget.querySelector('.hero-patch'), { x: 0, y: 0, rotation: 0, duration: 0.7, ease: 'power3.out' })
  }

  const stories = [
    { label: 'پزشکی بر پایهٔ شواهد', text: 'هر توصیه در این مطب، پشتوانهٔ پروتکل‌های روز دنیا را دارد؛ نه حدس، نه سنت.' },
    { label: 'همراهی در هر مرحله', text: 'از نخستین ویزیت تا پس از زایمان؛ یک تیم ثابت که مسیر شما را می‌شناسد.' },
    { label: 'تعهد ما، روشن و شفاف', text: 'هیچ‌گاه کاری که لازم نیست انجام نمی‌دهیم. اعتماد شما، سرمایهٔ ماست.' },
  ]

  return (
    <section className="opening-section" data-theme="dark" aria-label="به دورهٔ سلامت خوش آمدید">
      <div className="opening-sticky">
        <div className="story-scene">
          <picture className="story-image">
            <source media="(max-width: 600px)" srcSet="/v10/assets/background-mobile.5fe12084.jpg" />
            <source media="(max-width: 1000px)" srcSet="/v10/assets/background-tablet.4a08630d.webp" />
            <img src="/v10/assets/background.ccdc4950.webp" alt="فضای آرام مطب؛ مراقبتی دلسوزانه" width="3200" height="2160" />
          </picture>
          <div className="story-shade" />
          {stories.map((story, i) => (
            <div className={`story-copy story-copy-${i + 1}`} key={story.label}>
              <Eyebrow ring>{story.label}</Eyebrow>
              <p>{story.text}</p>
              <span className="story-index mono">۰{i + 1} / ۰۳</span>
            </div>
          ))}
          <div className="story-bottom mono">
            <span>علم، نه شایعه.</span>
            <Flower />
            <span>مراقبتی تازه.</span>
          </div>
        </div>
        <div className="hero-curtain"><div className="hero-inner">
          <picture className="hero-background">
            <source media="(max-width: 600px)" srcSet="/v10/assets/HeroBGM.97f50e37.webp" />
            <img src="/v10/assets/HeroBG.cafba854.webp" width="3200" height="2116" alt="فضای آرام و روشن مطب دکتر شریفی" fetchPriority="high" />
          </picture>
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="hero-title-wrap"><h1 className="hero-heading">سلامتی، آغاز هر زندگی</h1></div>
            <div className="hero-grid">
              <div className="hero-card hero-message">
                <Corners /><Flower />
                <Eyebrow>مراقبت تخصصی زنان</Eyebrow>
                <p>همراهی دلسوزانه در هر مرحله از زندگی شما</p>
              </div>
              <button
                className="hero-card hero-preview"
                onMouseMove={previewMove}
                onMouseLeave={previewLeave}
                onClick={() => window.dispatchEvent(new CustomEvent('v10:scroll', { detail: '#shop' }))}
                aria-label="دیدن بستهٔ ویزیت و مشاوره"
              >
                <Corners />
                <Eyebrow>ویزیت حضوری</Eyebrow>
                <div className="hero-patch"><Image src="/v10/assets/patch-left.687721d1.webp" alt="ویزیت و مشاورهٔ حضوری در مطب" fill sizes="25vw" /></div>
                <span className="preview-hint mono">کمتر معطلی. زودتر به جواب. <ArrowLeft size={14} /></span>
              </button>
              <button
                className="hero-card hero-preview"
                onMouseMove={previewMove}
                onMouseLeave={previewLeave}
                onClick={() => window.dispatchEvent(new CustomEvent('v10:scroll', { detail: '#shop' }))}
                aria-label="دیدن بستهٔ دوران بارداری"
              >
                <Corners />
                <Eyebrow>دوران بارداری</Eyebrow>
                <div className="hero-patch"><Image src="/v10/assets/patch-right.c6d10d67.webp" alt="بستهٔ مراقبت پیش از زایمان" fill sizes="25vw" /></div>
                <span className="preview-hint mono">از نخستین سونو تا لحظهٔ زایمان <ArrowLeft size={14} /></span>
              </button>
              <div className="hero-card hero-discover">
                <Corners /><Flower />
                <p>با دکتر مریم شریفی، متخصص زنان و زایمان، از نخستین ویزیت تا لحظهٔ دیدن چهرهٔ کودکتان کنار هستید؛ دقیق، صبور و بدون عجله.</p>
                <Action href="#how-it-works" className="hero-action">آشنایی با مسیر درمان</Action>
              </div>
            </div>
          </div>
        </div></div>
      </div>
    </section>
  )
}

/* ------------------------------- Science --------------------------------- */

function PatchDiagram() {
  return (
    <div className="patch-stage" aria-hidden="true">
      <svg className="energy-rings" viewBox="0 0 600 600" fill="none">
        {[130, 170, 210, 250].map((radius) => <circle key={radius} cx="300" cy="300" r={radius} stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 7" />)}
        <path d="M30 300h540M300 30v540" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 7" />
      </svg>
      <div className="patch-layers">
        <div className="patch-base"><span /><span /><span /><span /><span /></div>
        <div className="patch-membrane">
          <svg viewBox="0 0 320 320" fill="none">
            <circle cx="160" cy="160" r="152" stroke="currentColor" />
            {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${80 - Math.sin(i) * 22} ${70 + i * 23} H230 Q250 ${70 + i * 23} 250 ${80 + i * 23} V${90 + i * 23} H80`} stroke="currentColor" strokeWidth="1.2" />)}
            <circle cx="160" cy="160" r="136" stroke="currentColor" strokeDasharray="2 5" />
          </svg>
        </div>
        <div className="patch-face"><Image src="/v10/assets/illustration-1.43f3fe6b.png" fill sizes="38vw" alt="" /></div>
      </div>
      <span className="diagram-note mono">همراه شما، در هر مرحله.</span>
    </div>
  )
}

function Science() {
  return (
    <section className="science-section" id="how-it-works" data-theme="light">
      <div className="science-sticky">
        <div className="science-heading">
          <span className="section-pill mono">مسیر درمان</span>
          <h2>علم، پایهٔ هر تصمیم</h2>
        </div>
        <svg className="science-connector" viewBox="0 0 930 74" fill="none" aria-hidden="true">
          <path stroke="currentColor" strokeDasharray="2 5" d="M929 1H307.67L1 73" />
          <circle cx="3" cy="72" r="3" fill="currentColor" />
        </svg>
        <div className="science-steps">
          {steps.map((step, index) => {
            const Icon = stepIcons[index] ?? CircleDashed
            return (
              <article className={`science-step science-step-${index + 1}`} key={step.title}>
                <div className="step-icon"><Icon strokeWidth={1} size={24} /></div>
                <Eyebrow>{step.title}</Eyebrow>
                <p>{step.text}</p>
                <Image className="step-mobile-art" src={step.image} width={450} height={500} sizes="90vw" alt={`تصویر مراحل درمان: ${step.title}`} />
                <span className="step-number mono">۰{index + 1} — ۰۳</span>
              </article>
            )
          })}
        </div>
        <PatchDiagram />
        <Action className="science-cta" href="#shop">رزرو نوبت و خدمات</Action>
        <div className="science-progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  )
}

/* ------------------------------- Movement -------------------------------- */

function Movement() {
  return (
    <section className="movement-section" data-theme="dark" aria-label="مراقبتی برای هر سن و شرایط">
      <div className="movement-sticky">
        <div className="movement-marquee" aria-hidden="true">
          <span>سلامت زنان <Flower /> سلامت زنان <Flower /></span>
        </div>
        <div className="movement-image">
          <Image src="/v10/assets/background.042700a4.webp" alt="مادر و نوزاد؛ لحظه‌ای آرام پس از زایمان" fill sizes="100vw" />
          <div className="movement-shade" />
        </div>
        <div className="movement-statement">
          <Eyebrow>برای زندگی، نه فقط برای درمان</Eyebrow>
          <p>مراقبتی که برای <span className="circled-word">زندگی</span> شما طراحی شده؛<br />برای هر سن، هر شرایط<br />و هر <span className="circled-word">انتظاری</span>.</p>
          <Flower />
        </div>
        <div className="movement-bottom mono">
          <span>کمتر نگرانی.</span>
          <span>بیشتر زندگی کردن.</span>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- UseCases -------------------------------- */

function UseCases() {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <section className="use-section" data-theme="light" aria-label="در هر مرحله‌ای که نیاز دارید">
      <div className="use-sticky">
        <div className="use-photo-track">
          {usePhotos.map((photo, i) => (
            <div className={`use-photo use-photo-${i + 1}`} key={photo.image}>
              <Image src={`/v10/assets/${photo.image}`} alt={photo.alt} fill sizes="(max-width: 800px) 100vw, 34vw" />
              <span className="photo-corner mono">۰{i + 1} / برای شما</span>
            </div>
          ))}
        </div>
        <div className="use-content">
          <h2>هیچ مرحله‌ای بی‌همراه نیست</h2>
          <p className="use-description">هر سؤالی که دربارهٔ بدن و سلامت خود دارید، این‌جا جای درست پرسیدن آن است؛ بدون خجالت، بدون تعارف.</p>
          <div className="use-map">
            <svg className="use-arrow" viewBox="0 0 210 160" fill="none" aria-hidden="true">
              <path d="M2 3C26 95 98 125 176 88M154 63l35 16-14 37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="use-tags">
              <div className="use-tags-heading"><Flower /><span>در هر مرحله‌ای که نیاز دارید</span></div>
              <div className="tag-list">
                {useCases.map((item, index) => (
                  <button key={item.name} className={selected === index ? 'selected' : ''} onClick={() => setSelected(selected === index ? null : index)} aria-pressed={selected === index}>
                    {item.name}
                    <Plus size={11} />
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.p className="placement-tip" aria-live="polite" key={selected ?? 'none'} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                  {selected !== null ? useCases[selected].text : 'یک مطب. بی‌شمار راه مراقبت.'}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <Action href="#shop">رزرو نوبت و خدمات</Action>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- Reviews -------------------------------- */

function Reviews() {
  const track = useRef<HTMLDivElement>(null)
  function slide(direction: number) {
    const card = track.current?.querySelector('article')
    if (card) track.current?.scrollBy({ left: direction * (card.clientWidth + 24), behavior: 'smooth' })
  }
  return (
    <section className="reviews-section" data-theme="light" aria-labelledby="v10-reviews-heading">
      <div className="reviews-heading reveal">
        <h2 id="v10-reviews-heading">از زبان خودِ مراجعان</h2>
        <div className="review-controls">
          <button className="icon-button flip-rtl" aria-label="نظر قبلی" onClick={() => slide(1)}><ArrowLeft size={22} strokeWidth={1} /></button>
          <button className="icon-button flip-rtl" aria-label="نظر بعدی" onClick={() => slide(-1)}><ArrowRight size={22} strokeWidth={1} /></button>
        </div>
        <Flower />
      </div>
      <div className="review-track" ref={track}>
        {reviews.map((review) => (
          <article className="review-card reveal" key={review.name}>
            <Image className="stars" src="/v10/assets/4.5.3500d8fa.svg" alt="۴٫۵ از ۵ ستاره" width={96} height={16} />
            <blockquote>{review.quote}</blockquote>
            <div className="review-person">
              <Image src={`/v10/assets/${review.image}`} alt={review.name} width={52} height={52} />
              <div>
                <p>{review.name}</p>
                <span>تهران</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="press-logos reveal">
        {pressNames.map((logo) => (
          <Image key={logo.name} src={`/v10/assets/${logo.file}`} alt={logo.name} width={logo.width} height={50} />
        ))}
      </div>
    </section>
  )
}

/* --------------------------------- Shop ---------------------------------- */

function ProductCard({ product, index }: { product: (typeof products)[number]; index: number }) {
  const [subscription, setSubscription] = useState(false)
  const { add, ready } = useCart()
  return (
    <article className="product-card reveal">
      <div className="product-image">
        <Image src={product.image} alt={`${product.name} — ${product.variant}`} fill sizes="(max-width: 650px) 90vw, (max-width: 1000px) 45vw, 31vw" />
        <span className="product-number mono">۰{index + 1}</span>
        <span className="product-image-caption mono">برای روزهای بهتر طراحی شده.</span>
      </div>
      <div className="product-title"><h3>{product.name}</h3><span>{formatMoney(product.price)}</span></div>
      <div className="product-variant"><i style={{ background: product.color }} /><span>{product.variant}</span></div>
      <Action className="product-add" onClick={() => add(product.id, subscription)} disabled={!ready}>افزودن به سبد رزرو</Action>
      <label className="subscription-label">
        <input
          type="checkbox"
          checked={subscription}
          onChange={(event) => setSubscription(event.target.checked)}
          aria-label={`پیگیری ماهانه برای ${product.name}`}
        />
        <span className="switch-track" aria-hidden="true"><span /></span>
        <span>پیگیری ماهانه</span>
        {subscription && <span className="subscription-price">{formatMoney(product.price)}/ماه</span>}
      </label>
    </article>
  )
}

function Shop() {
  const { setDialog } = useCart()
  return (
    <section className="shop-section" id="shop" data-theme="light">
      <div className="shop-heading reveal">
        <h2>با خیال راحت شروع کنید</h2>
        <p>پشتوانهٔ ما <button className="text-link" onClick={() => setDialog('guarantee')}>تعهد شفاف به شماست</button>.<br />اگر راضی نباشید، ما هم راضی نیستیم.</p>
      </div>
      <div className="shop-perks reveal">
        {[
          { icon: Check, text: 'انتخاب روز و ساعت نوبت توسط خودتان' },
          { icon: Truck, text: 'مشاورهٔ آنلاین از هرجای ایران' },
          { icon: X, text: 'بدون تعهد؛ انصراف در هر مرحله' },
          { icon: RotateCcw, text: 'بازگشت هزینه در صورت عدم رضایت' },
        ].map((perk) => (
          <div key={perk.text}><perk.icon size={22} strokeWidth={1} /><span>{perk.text}</span></div>
        ))}
      </div>
      <div className="product-grid">
        {products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
      </div>
    </section>
  )
}

/* ---------------------------------- FAQ ---------------------------------- */

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="faq-section" id="faq" data-theme="light">
      <div className="faq-intro">
        <h2 className="reveal">پاسخ پرسش‌های<br />پرتکرار شما</h2>
        <div className="faq-photo reveal">
          <Image src="/v10/assets/faq.0982ca32.webp" alt="فضای آرام و خصوصی معاینه در مطب" fill sizes="(max-width: 800px) 45vw, 31vw" />
          <div className="faq-photo-caption">
            <Flower />
            <span className="mono">طبیعی است که پرسش‌هایتان باشد.</span>
          </div>
        </div>
      </div>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <article className={`faq-item ${open === index ? 'faq-open' : ''}`} key={faq.question}>
            <h3>
              <button
                aria-expanded={open === index}
                aria-controls={`v10-faq-answer-${index}`}
                id={`v10-faq-question-${index}`}
                onClick={() => setOpen(open === index ? null : index)}
              >
                <span>{faq.question}</span>
                <span className="faq-plus"><Plus size={20} strokeWidth={1.2} /></span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open === index && (
                <motion.div
                  id={`v10-faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`v10-faq-question-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  onAnimationComplete={() => ScrollTrigger.refresh()}
                >
                  <p>{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        ))}
      </div>
    </section>
  )
}

/* --------------------------------- Footer --------------------------------- */

function Footer() {
  const { setDialog } = useCart()
  return (
    <footer className="site-footer" data-theme="light">
      <div className="live-marquee" aria-label="سلامت، هر روز">
        <div>{[0, 1, 2, 3].map((i) => <span key={i} aria-hidden={i > 0}>سلامت، هر روز <Flower /></span>)}</div>
      </div>
      <div className="footer-top">
        <p className="footer-mission">همراهی دلسوزانه برای<br />هر مرحله از زندگی شما</p>
        <div className="footer-address">
          <p>{clinic.name} © ۱۴۰۴</p>
          <p>{clinic.address}<br />شماره تماس: {clinic.phone}</p>
        </div>
        <nav aria-label="ناوبری پابرگ">
          <a href="#shop">رزرو نوبت <ArrowLeft size={15} /></a>
          <button onClick={() => setDialog('account')}>پیگیری درخواست <ArrowLeft size={15} /></button>
          <button onClick={() => setDialog('contact')}>تماس با ما <ArrowLeft size={15} /></button>
        </nav>
        <a href="#top" className="back-top" aria-label="بازگشت به بالای صفحه"><ArrowLeft size={24} strokeWidth={1} /></a>
      </div>
      <a className="footer-wordmark" href="#top" aria-label={`${clinic.name} — بازگشت به بالا`}>{clinic.short}</a>
      <div className="footer-fineprint">
        <span>بازآفرینی طرح · نسخهٔ نمایشی</span>
        <p>محتوای این صفحه صرفاً نمایشی است و جایگزین ویزیت و توصیهٔ پزشکی نیست.</p>
        <span>برای زندگی بهتر.</span>
      </div>
    </footer>
  )
}

/* ------------------------------- Experience ------------------------------- */

export function Experience() {
  const root = useRef<HTMLElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({ desktop: '(min-width: 901px)', mobile: '(max-width: 900px)', reduce: '(prefers-reduced-motion: reduce)' }, (context) => {
      const { desktop, reduce } = context.conditions!
      if (reduce) return
      gsap.from('.hero-heading', { y: 45, opacity: 0, duration: 1.5, ease: 'power4.out', delay: 0.12 })
      gsap.from('.hero-background', { scale: 1.055, duration: 2.4, ease: 'power2.out' })
      gsap.from('.hero-grid', { y: 26, opacity: 0, duration: 1.3, ease: 'power3.out', delay: 0.5 })
      gsap.set('.story-copy', { autoAlpha: 0, y: 35 })

      const opening = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.opening-section', start: 'top top', end: 'bottom bottom', scrub: 0.8 } })
      opening.to('.hero-curtain', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1 }, 0)
        .to('.hero-inner', { yPercent: -16, duration: 1 }, 0)
        .fromTo('.story-image', { scale: 1.08, yPercent: 3 }, { scale: 1, yPercent: -3, duration: 4.15 }, 0)
      ;[1, 2, 3].forEach((number) => {
        const at = 0.65 + (number - 1) * 1.08
        opening.to(`.story-copy-${number}`, { autoAlpha: 1, y: 0, duration: 0.36, ease: 'power2.out' }, at)
        if (number < 3) opening.to(`.story-copy-${number}`, { autoAlpha: 0, y: -30, duration: 0.3 }, at + 0.82)
      })

      if (desktop) {
        gsap.set('.science-step:not(:first-child)', { autoAlpha: 0, y: 30 })
        gsap.set('.patch-membrane, .patch-base', { autoAlpha: 0 })
        const science = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: '.science-section', start: 'top top', end: 'bottom bottom', scrub: 0.8 } })
        science.to('.patch-layers', { rotationZ: 18, duration: 0.6 }, 0)
          .to('.science-step-1', { autoAlpha: 0, y: -25, duration: 0.22 }, 0.85)
          .to('.science-step-2', { autoAlpha: 1, y: 0, duration: 0.3 }, 1.02)
          .to('.patch-layers', { rotationX: 52, rotationZ: -28, duration: 0.8 }, 0.8)
          .to('.patch-membrane, .patch-base', { autoAlpha: 1, duration: 0.5 }, 0.95)
          .to('.patch-face', { z: 110, duration: 0.8 }, 0.8)
          .to('.patch-membrane', { z: 45, duration: 0.8 }, 0.8)
          .to('.energy-rings', { rotation: 75, scale: 1.05, duration: 3.1, ease: 'none' }, 0)
          .to('.science-step-2', { autoAlpha: 0, y: -25, duration: 0.22 }, 1.95)
          .to('.science-step-3', { autoAlpha: 1, y: 0, duration: 0.3 }, 2.12)
          .to('.patch-layers', { rotationX: 62, rotationZ: 12, duration: 0.8 }, 2)
          .to('.patch-face', { z: 180, duration: 0.8 }, 2)
          .to('.patch-membrane', { z: 75, duration: 0.8 }, 2)
          .fromTo('.science-progress span', { scaleX: 0 }, { scaleX: 1, duration: 3.1, ease: 'none' }, 0)

        const use = gsap.timeline({ scrollTrigger: { trigger: '.use-section', start: 'top top', end: 'bottom bottom', scrub: 0.9 } })
        // RTL: the photo track slides the other way and the content panel
        // enters from the physical left (inline-start in RTL).
        use.to('.use-photo-track', { xPercent: 66.666, duration: 1.6, ease: 'power2.inOut' }, 0.1)
          .fromTo('.use-content', { xPercent: -105 }, { xPercent: 0, duration: 1.6, ease: 'power2.inOut' }, 0.1)
          .to({}, { duration: 0.45 })
      }

      const movement = gsap.timeline({ scrollTrigger: { trigger: '.movement-section', start: 'top top', end: 'bottom bottom', scrub: 0.9 } })
      movement.fromTo('.movement-image', { clipPath: desktop ? 'inset(16% 35% 16% 35% round 220px)' : 'inset(20% 16% 20% 16% round 180px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.3, ease: 'power2.inOut' }, 0)
        .fromTo('.movement-image img', { scale: 1.22 }, { scale: 1, duration: 2, ease: 'none' }, 0)
        .fromTo('.movement-statement', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.7)
        .to('.movement-marquee', { xPercent: 25, duration: 2.5, ease: 'none' }, 0)
        .to('.movement-statement', { y: -35, duration: 0.6 }, 1.9)

      gsap.utils.toArray<HTMLElement>('.reveal').forEach((element) => {
        gsap.from(element, { y: 35, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 94%', once: true } })
      })
    })

    let alive = true
    void document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh() })
    return () => { alive = false; mm.revert() }
  }, { scope: root })

  return (
    <>
      <a className="skip-link" href="#shop">رفتن به بخش رزرو</a>
      <main id="top" ref={root}>
        <Opening />
        <Science />
        <Movement />
        <UseCases />
        <Reviews />
        <Shop />
        <FAQ />
        <Footer />
      </main>
    </>
  )
}
