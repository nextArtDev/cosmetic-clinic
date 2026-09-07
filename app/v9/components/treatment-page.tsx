'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { treatments, type TreatmentCategory } from '../lib/content'
import { usePageMotion } from '../lib/use-page-motion'
import { useBooking } from './booking-provider'
import { Arrow, GlowButton, SectionTitle, Words } from './visuals'
import { ContactSection } from './sections'

function AccordionItem({
  id,
  title,
  description,
  index,
  open,
  onToggle,
  onBook,
}: {
  id: string
  title: string
  description: string
  index: number
  open: boolean
  onToggle: () => void
  onBook?: () => void
}) {
  return (
    <article className={`accordion-item ${open ? 'is-open' : ''}`} id={id}>
      <button
        type="button"
        id={`trigger-${id}`}
        className="accordion-trigger"
        aria-expanded={open}
        aria-controls={`content-${id}`}
        onClick={onToggle}
      >
        <span className="accordion-index">{String(index + 1).padStart(2, '0')}</span>
        <h3>{title}</h3>
        <span className="accordion-plus" aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            className="accordion-content"
            id={`content-${id}`}
            role="region"
            aria-labelledby={`trigger-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.25 },
            }}
            onAnimationComplete={() => ScrollTrigger.refresh()}
          >
            <div className="accordion-content-inner">
              <p>{description}</p>
              {onBook && (
                <button type="button" className="outline-button" onClick={onBook}>
                  رزرو یک ارزیابی <Arrow diagonal />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}

export function TreatmentPage({ category }: { category: TreatmentCategory }) {
  const ref = useRef<HTMLElement>(null)
  usePageMotion(ref)
  const { openBooking } = useBooking()
  const [open, setOpen] = useState<string | null>(category.procedures[0].id)
  const [faq, setFaq] = useState<string | null>(null)
  useEffect(() => {
    const applyHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1))
      if (category.procedures.some((item) => item.id === hash)) setOpen(hash)
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [category])
  const faqs = [
    {
      id: 'evaluation',
      title: 'از کجا بفهمم کدام درمان برای من مناسب است؟',
      description:
        'همه‌چیز با یک ویزیت دندانپزشکی شروع می‌شود. دکتر نادری نیازها، سابقه و انتظارات شما را بررسی می‌کند تا برنامه‌ای اختصاصی بسازد و گزینه‌ها، منافع و مراقبت‌های هر مسیر را توضیح دهد.',
    },
    {
      id: 'results',
      title: 'چه زمانی نتیجه را می‌بینم؟',
      description:
        'سرعت پاسخ به نوع درمان، شرایط دهان و دندان و پروتکل انتخابی شما بستگی دارد. در جلسه ویزیت درباره مراحل، همراهی و انتظارات واقع‌بینانه برای وضعیت شما راهنمایی می‌شوید.',
    },
    {
      id: 'booking',
      title: 'نوبت اولین ویزیت را چطور رزرو کنم؟',
      description:
        'می‌توانید درخواست خود را از فرم ثبت کنید یا مستقیماً با تیم ما در واتس‌اپ گفت‌وگو کنید. کلینیک در خیابان ولیعصر، پلاک ۲۹۱، ونکِ تهران قرار دارد. تاریخ و ساعت توسط تیم پذیرش تأیید می‌شود.',
    },
  ]
  const related = treatments.filter((item) => item.slug !== category.slug).slice(0, 3)
  return (
    <main ref={ref} className="site-main detail-main" id="main-content">
      <section className="detail-hero">
        <div className="detail-copy">
          <nav className="breadcrumb" aria-label="جای شما در سایت">
            <Link href="/v9">خانه</Link>
            <span aria-hidden="true">/</span>
            <Link href="/v9/#treatments">خدمات</Link>
            <span aria-hidden="true">/</span>
            <span>{category.shortTitle}</span>
          </nav>
          <p className="eyebrow" data-reveal>
            {category.title}
          </p>
          <h1 data-word-reveal>
            <Words text={category.headline} />
          </h1>
          <p className="section-paragraph" data-reveal>
            {category.description}
          </p>
          <GlowButton interest={category.slug} />
        </div>
        <div className="detail-art">
          <div className="detail-shape organic-backdrop" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.image}
            alt={category.title}
            className="detail-image"
            fetchPriority="high"
          />
        </div>
      </section>
      <section className="procedures-section" id="options">
        <p className="eyebrow" data-reveal>
          مراقبتی برای شما
        </p>
        <SectionTitle text="یک نگاه اختصاصی. بسیاری از امکان‌ها." />
        <div className="accordion-list">
          {category.procedures.map((procedure, index) => (
            <AccordionItem
              key={procedure.id}
              {...procedure}
              index={index}
              open={open === procedure.id}
              onToggle={() => {
                const next = open === procedure.id ? null : procedure.id
                setOpen(next)
                window.history.replaceState(
                  null,
                  '',
                  `${window.location.pathname}${next ? `#${next}` : ''}`,
                )
              }}
              onBook={() => openBooking(category.slug)}
            />
          ))}
        </div>
        <p className="medical-note">
          هر روش درمانی نیازمند معاینه پزشک است. مناسب بودن، نتیجه و دوره بهبود در هر فرد متفاوت است.
        </p>
      </section>
      <section className="faq-section">
        <p className="eyebrow" data-reveal>
          برای راهنمایی شما اینجاییم
        </p>
        <SectionTitle text="پرسش‌های شما، با دقت." />
        <div className="accordion-list">
          {faqs.map((item, index) => (
            <AccordionItem
              key={item.id}
              {...item}
              id={`faq-${item.id}`}
              index={index}
              open={faq === item.id}
              onToggle={() => setFaq(faq === item.id ? null : item.id)}
            />
          ))}
        </div>
      </section>
      <section className="related-section">
        <SectionTitle text="این‌ها را هم ببینید" />
        <div className="related-grid">
          {related.map((item) => (
            <Link
              href={`/v9/treatments/${item.slug}`}
              className="treatment-card"
              key={item.slug}
              data-reveal
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.title} loading="lazy" />
              <div className="card-shade" />
              <div className="card-outline" />
              <h2>{item.shortTitle}</h2>
              <span className="card-arrow">
                <Arrow diagonal />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <ContactSection />
    </main>
  )
}
