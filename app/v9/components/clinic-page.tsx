'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePageMotion } from '../lib/use-page-motion'
import { AmbientVideo, Arrow, SectionTitle, Words } from './visuals'
import { ContactSection, DoctorSection } from './sections'
import { Modal } from './modal'

const gallery = [
  { src: '/v9/images/care-poster.jpg', caption: 'فضاهایی که دلنشین‌اند' },
  { src: '/v9/images/clinic-2.jpg', caption: 'مراقبت در تک‌تک جزئیات' },
  { src: '/v9/images/clinic-poster.jpg', caption: 'لحظه‌های بهزیستی شما' },
]

export function ClinicPage() {
  const ref = useRef<HTMLElement>(null)
  usePageMotion(ref)
  const [selected, setSelected] = useState<number | null>(null)
  useEffect(() => {
    if (selected === null) return
    const navigate = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setSelected((value) => ((value ?? 0) + 1) % gallery.length)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setSelected((value) => ((value ?? 0) + gallery.length - 1) % gallery.length)
      }
    }
    window.addEventListener('keydown', navigate)
    return () => window.removeEventListener('keydown', navigate)
  }, [selected])
  return (
    <>
      <main ref={ref} className="site-main clinic-main" id="main-content">
        <section className="clinic-hero">
          <p className="eyebrow" data-reveal>
            کلینیک دکتر سپیده نادری · تهران
          </p>
          <h1 data-word-reveal>
            <Words text="جایی برای مراقبت از شما. در تمامیت." />
          </h1>
          <p className="section-paragraph" data-reveal>
            ۱۵ سال است که برتری دندانپزشکی، فناوری و نگاهی دقیق به یکتایی شما را کنار هم می‌گذاریم.
            فضایی دلنشین که مراقبت از دهان و دندان را به تجربه‌ای از بهزیستی بدل می‌کند.
          </p>
          <AmbientVideo
            src="/v9/videos/clinic.mp4"
            poster="/v9/images/clinic-poster.jpg"
            className="clinic-hero-video"
            label="کلینیک دکتر سپیده نادری را ببینید"
            controllable
          />
        </section>
        <section className="clinic-values" aria-label="مراقبت ما">
          {[
            {
              icon: 'care',
              title: 'مراقبت اختصاصی',
              text: 'تیمی بسیار متخصص که می‌شنود، راهنمایی می‌کند و شما را در هر مرحله همراهی می‌کند.',
            },
            {
              icon: 'tech',
              title: 'فناوری و دانش',
              text: 'به‌روزرسانی مستمر و فناوری‌های پیشرفته، انتخاب‌شده برای هر نیاز.',
            },
            {
              icon: 'location',
              title: 'آسایش در هر جزئیات',
              text: 'موقعیتی ممتاز در مرکز تهران، در فضایی که برای پذیرایی از شما طراحی شده است.',
            },
          ].map((item) => (
            <article className="clinic-value" key={item.icon} data-reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/v9/images/icon-${item.icon}.svg`} alt="" loading="lazy" />
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </section>
        <section className="gallery-section">
          <div className="gallery-heading">
            <SectionTitle text="شما لایق احساس خوب هستید." />
            <p>برای دیدن کلینیک روی تصاویر بزنید</p>
          </div>
          <div className="gallery-grid">
            {gallery.map((image, index) => (
              <button
                type="button"
                className="gallery-button"
                key={image.src}
                onClick={() => setSelected(index)}
                aria-label={`بزرگ‌نمایی عکس: ${image.caption}`}
                data-reveal
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.caption} loading="lazy" />
                <span className="gallery-zoom" aria-hidden="true">
                  +
                </span>
              </button>
            ))}
          </div>
        </section>
        <DoctorSection />
        <ContactSection showAddress />
      </main>
      <AnimatePresence>
        {selected !== null && (
          <Modal key="gallery" titleId="gallery-title" className="gallery-dialog" onClose={() => setSelected(null)}>
            <div className="lightbox-stage">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={selected}
                  src={gallery[selected].src}
                  alt={gallery[selected].caption}
                  initial={{ opacity: 0, scale: 1.025 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) > 45)
                      setSelected((selected + (info.offset.x < 0 ? 1 : gallery.length - 1)) % gallery.length)
                  }}
                />
              </AnimatePresence>
            </div>
            <div className="lightbox-footer">
              <div>
                <h2 id="gallery-title">{gallery[selected].caption}</h2>
                <p className="lightbox-count">
                  {toFa(selected + 1, 2)} / {toFa(gallery.length, 2)}
                </p>
              </div>
              <div className="lightbox-controls">
                <button
                  className="previous"
                  type="button"
                  onClick={() => setSelected((selected + gallery.length - 1) % gallery.length)}
                  aria-label="عکس قبلی"
                >
                  <Arrow />
                </button>
                <button
                  className="next"
                  type="button"
                  onClick={() => setSelected((selected + 1) % gallery.length)}
                  aria-label="عکس بعدی"
                >
                  <Arrow />
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}

export function toFa(value: number, pad = 1) {
  return value.toLocaleString('fa-IR', { minimumIntegerDigits: pad, useGrouping: false })
}
