'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { treatments } from '../lib/content'
import { usePageMotion } from '../lib/use-page-motion'
import { AmbientVideo, Arrow, GlowButton, SectionTitle, Words } from './visuals'
import {
  ContactSection,
  DoctorSection,
  StatementSection,
  TechnologySection,
  TestimonialsSection,
} from './sections'

function Hero() {
  return (
    <section className="hero-section" aria-label="دندانپزشکی تخصصی در تهران">
      <div className="hero-inner">
        <div className="hero-art">
          <div className="hero-gradient" aria-hidden="true" />
          <div className="hero-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/v9/images/hero-woman.png"
              alt="زیبایی و بهزیستی در یک لبخند سالم و طبیعی"
              width="960"
              height="1200"
              fetchPriority="high"
            />
          </div>
        </div>
        <div className="hero-copy">
          <h1>
            <Words text="سلامت و زیبایی، بسیار بیش از یک لبخند سفید است." wordClass="hero-word" />
          </h1>
          <p className="hero-subtitle">
            همه‌ی فناوری، در خدمت سلامت و
            <br /> زیبایی دندان‌های شما.
          </p>
          <GlowButton className="hero-cta" />
        </div>
      </div>
    </section>
  )
}

function Introduction() {
  return (
    <section className="intro-section section-shell" id="about-clinic">
      <div className="intro-copy">
        <Link href="/v9/clinic" className="eyebrow">
          کلینیک دکتر سپیده نادری
        </Link>
        <SectionTitle text="۱۵ سال است که بهترین‌های دندانپزشکی را ارائه می‌کنیم" />
        <div className="care-pillars">
          {[
            { icon: 'care', text: 'مراقبت متفاوت توسط تیمی بسیار متخصص' },
            { icon: 'tech', text: 'فناوری روز برای نتایجی ایمن و طبیعی' },
            { icon: 'location', text: 'موقعیتی عالی در تهران برای بیشترین آسایش' },
          ].map((item) => (
            <div className="care-pillar" key={item.icon} data-reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/v9/images/icon-${item.icon}.svg`} alt="" width="84" height="84" loading="lazy" />
              <p>{item.text}</p>
            </div>
          ))}
        </div>
        <div className="intro-rating" data-reveal>
          <p>بیش از ۱۰٫۰۰۰ بیمار درمان‌شده</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Clinic+Dr+Sepideh+Naderi+Tehran"
            target="_blank"
            rel="noreferrer"
            aria-label="نظرات بیماران درباره کلینیک را ببینید"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/v9/images/google-review.svg"
              alt="امتیاز ۴٫۸ از ۵ در گوگل"
              width="200"
              height="28"
              loading="lazy"
            />
          </a>
        </div>
      </div>
      <div className="intro-art">
        <AmbientVideo
          src="/v9/videos/care.mp4"
          poster="/v9/images/care-poster.jpg"
          className="intro-video"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v9/images/drop-gradient.svg" alt="" className="intro-photo-outline" aria-hidden="true" />
        <div className="journey-entry">
          <div className="journey-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/v9/images/face.jpg"
              alt="مراقبت اختصاصی دندانی برای لبخندی سالم"
              width="860"
              height="860"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function TreatmentMarquees() {
  return (
    <div className="treatment-marquees" aria-label="درمان مناسب خود را پیدا کنید">
      {treatments.slice(0, 3).map((category, row) => (
        <div className={`treatment-marquee ${row === 1 ? 'reverse' : ''}`} key={category.slug}>
          <div className="marquee-track">
            {[0, 1, 2].map((duplicate) => (
              <div className="marquee-group" key={duplicate} aria-hidden={duplicate > 0}>
                {category.procedures.map((procedure, index) => (
                  <span className="marquee-link-wrap" key={procedure.id}>
                    <Link
                      tabIndex={duplicate > 0 ? -1 : undefined}
                      className="treatment-chip"
                      href={`/v9/treatments/${category.slug}#${procedure.id}`}
                    >
                      {procedure.title}
                    </Link>
                    {index === 0 && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        className="marquee-symbol"
                        src={`/v9/images/icon-${['care', 'tech', 'location'][row]}.svg`}
                        alt=""
                      />
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TreatmentCards() {
  return (
    <section className="treatments-section" id="treatments" aria-label="درمان‌های دندان، لثه و زیبایی">
      <div className="treatment-grid">
        {[
          { item: treatments[1], className: 'hair' },
          { item: treatments[0], className: 'face' },
          { item: treatments[2], className: 'body' },
        ].map(({ item, className }) => (
          <Link
            className={`treatment-card ${className}`}
            href={`/v9/treatments/${item.slug}`}
            key={item.slug}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.title} loading="lazy" />
            <div className="card-shade" />
            <div className="card-outline" aria-hidden="true" />
            <h2>{item.shortTitle}</h2>
            <span className="card-arrow">
              <Arrow diagonal />
            </span>
          </Link>
        ))}
      </div>
      <TreatmentMarquees />
    </section>
  )
}

function SpecialtySections() {
  return (
    <section className="specialty-stage section-shell" aria-label="مراقبت تخصصی و طراحی لبخند">
      <div className="specialty-visual">
        <div className="specialty-glow warm" aria-hidden="true" />
        <div className="specialty-glow cool" aria-hidden="true" />
        <div className="specialty-outline" aria-hidden="true" />
        <div className="specialty-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v9/images/clinical.jpg"
            className="clinical-photo"
            alt="درمان‌های تخصصی دندانپزشکی"
            loading="lazy"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v9/images/collagen.jpg"
            className="collagen-photo"
            alt="درمان‌های پیشگیرانه برای سلامت دهان و دندان"
            loading="lazy"
          />
        </div>
      </div>
      <div className="specialty-panels">
        {treatments.slice(3, 5).map((item, index) => (
          <div
            className={`specialty-panel ${index === 1 ? 'collagen-panel' : ''}`}
            id={index === 1 ? 'collagen-panel' : 'clinical-panel'}
            key={item.slug}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="mobile-specialty-photo"
              src={item.image}
              alt={item.title}
              loading="lazy"
            />
            <SectionTitle text={item.title} />
            <p className="section-paragraph" data-reveal>
              {item.description}
            </p>
            <div className="specialty-links" data-reveal>
              {item.procedures.map((procedure) => (
                <Link
                  className="outline-button"
                  href={`/v9/treatments/${item.slug}#${procedure.id}`}
                  key={procedure.id}
                >
                  {procedure.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomePage() {
  const ref = useRef<HTMLElement>(null)
  usePageMotion(ref)
  return (
    <main ref={ref} id="main-content" className="site-main home-main">
      <Hero />
      <Introduction />
      <TreatmentCards />
      <SpecialtySections />
      <TechnologySection />
      <DoctorSection />
      <StatementSection />
      <TestimonialsSection />
      <ContactSection />
    </main>
  )
}
