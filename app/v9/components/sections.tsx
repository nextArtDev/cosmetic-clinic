'use client'

import Link from 'next/link'
import { AmbientVideo, Arrow, GlowButton, SectionTitle } from './visuals'
import { doctor, mapUrl, testimonials } from '../lib/content'

export function TechnologySection() {
  return (
    <section className="technology-section section-shell" id="technology">
      <div className="technology-copy">
        <p className="eyebrow" data-reveal>
          کلینیک دکتر سپیده نادری
        </p>
        <SectionTitle text="برتری فناوری در دندانپزشکی" />
        <p className="section-paragraph" data-reveal>
          از نوترین راه‌حل‌های دندانپزشکی مدرن برای نتایجی مؤثر، ایمن و طبیعی
          بهره می‌گیریم. تیم ما درمان‌های اختصاصی را با تمرکز بر آسایش و بهبود
          سریع ارائه می‌دهد تا تجربه‌ای گرم و نتیجه‌ای که زیبایی یکتای شما را
          برجسته کند.
        </p>
        <Link
          href="/v9/treatments/fanavari-ha"
          className="outline-button"
          data-reveal
        >
          بیشتر بدانید <Arrow diagonal />
        </Link>
      </div>
      <div className="technology-art">
        <div className="technology-outline" aria-hidden="true" />
        <AmbientVideo
          src="/v9/videos/clinic.mp4"
          poster="/v9/images/clinic-poster.jpg"
          className="technology-video"
          label="فناوری‌ها و درمان‌های کلینیک دکتر سپیده نادری"
          controllable
        />
      </div>
    </section>
  )
}

export function DoctorSection() {
  return (
    <section id="doctor" className="doctor-section section-shell">
      <div className="doctor-art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="doctor-backdrop organic-backdrop"
          src="/v9/images/clinical.webp"
          alt=""
          loading="lazy"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="doctor-portrait"
          src="/v9/images/hero-woman.webp"
          alt={`${doctor.name}، دندانپزشک`}
          loading="lazy"
          width="472"
          height="588"
        />
      </div>
      <div className="doctor-copy">
        <SectionTitle text={doctor.name} className="text-left" />
        <p className="section-paragraph text-left" data-reveal>
          {doctor.bio}
        </p>
        <div className="education-logos" data-reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v9/images/education-1.png"
            alt="آموزش و به‌روزرسانی بین‌المللی"
            loading="lazy"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v9/images/education-2.png"
            alt="انجمن تخصصی دندانپزشکی"
            loading="lazy"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v9/images/education-3.png"
            alt="دانشگاه علوم پزشکی تهران"
            loading="lazy"
          />
        </div>
        <p className="doctor-credentials" data-reveal>
          {doctor.credentials}
        </p>
      </div>
    </section>
  )
}

export function StatementSection() {
  return (
    <section
      className="statement-section"
      aria-label="ارتقای سلامت و بهزیستی از طریق تکنیک‌های پیشرفته و درمان‌های اختصاصی"
    >
      <div className="statement-row">
        <span>ارتقای سلامت</span>
        <AmbientVideo
          src="/v9/videos/skin.mp4"
          poster="/v9/images/face.webp"
          className="statement-video"
        />
        <span>و بهزیستی</span>
      </div>
      <div className="statement-row">
        <span>با تکنیک‌های</span>
        <AmbientVideo
          src="/v9/videos/laser.mp4"
          poster="/v9/images/clinic-poster.jpg"
          className="statement-video"
        />
        <span>پیشرفته</span>
      </div>
      <div className="statement-row">
        <span>و درمان‌های</span>
        <AmbientVideo
          src="/v9/videos/beauty.mp4"
          poster="/v9/images/face.webp"
          className="statement-video"
        />
        <span>اختصاصی</span>
      </div>
    </section>
  )
}

export function TestimonialsSection() {
  return (
    <section className="testimonials-section" aria-label="نظرات بیماران">
      <div className="testimonial-glow" aria-hidden="true" />
      {[0, 1].map((row) => (
        <div
          className={`testimonial-track-wrap ${row === 1 ? 'reverse' : ''}`}
          key={row}
        >
          <div className="testimonial-track">
            {[0, 1].map((duplicate) => (
              <div
                className="testimonial-group"
                key={duplicate}
                aria-hidden={duplicate === 1}
              >
                {testimonials.map((item, index) => (
                  <article
                    className={`testimonial-card tone-${(index + row) % 3}`}
                    key={item.name}
                  >
                    <p>«{item.text}»</p>
                    <div
                      className="testimonial-rating"
                      aria-label="۵ از ۵ ستاره"
                    >
                      ★★★★★
                    </div>
                    <span>{item.name}</span>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="media-logos" aria-label="حضور در رسانه‌ها">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v9/images/logo-rbs.png" alt="RBS" loading="lazy" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v9/images/logo-sbt.png" alt="SBT" loading="lazy" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v9/images/logo-nd.png" alt="ND" loading="lazy" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v9/images/logo-nsc.png" alt="NSC" loading="lazy" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/v9/images/logo-dc.png"
          alt="Diário Catarinense"
          loading="lazy"
        />
      </div>
    </section>
  )
}

export function ContactSection({
  showAddress = false,
}: {
  showAddress?: boolean
}) {
  return (
    <section id="contact" className="contact-section section-shell">
      <div className="contact-copy">
        <SectionTitle text="می‌توانیم کمک کنیم؟" className="text-left" />
        <p className="section-paragraph text-left" data-reveal>
          برای پاسخ به پرسش‌هایتان و رزرو نوبت با تیم ما در تماس باشید.
          آماده‌ایم با تمام مراقبت، توجه و حرفه‌ای‌گری در خدمت شما باشیم.
        </p>
        <GlowButton label="پشتیبانی" className="contact-cta" />
        {showAddress && (
          <a
            className="address-link"
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
          >
            خیابان ولیعصر، پلاک ۲۹۱ · ونک، تهران
            <br />
            <span>
              مسیریابی <Arrow diagonal />
            </span>
          </a>
        )}
      </div>
      <div className="contact-art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/v9/images/clinic-1.jpg"
          className="contact-backdrop organic-backdrop"
          alt=""
          loading="lazy"
        />
        <div className="contact-photo" data-reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v9/images/clinic-2.jpg"
            alt="فضایی دلنشین برای مراقبت از شما"
            loading="lazy"
          />
        </div>
        <div className="contact-outline" aria-hidden="true" />
      </div>
    </section>
  )
}
