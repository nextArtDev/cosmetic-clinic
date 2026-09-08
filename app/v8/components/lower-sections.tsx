'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Arrow, BrandIcon, FlowLines, Logo, OvalButton, Reveal, ease } from './primitives'
import { useCases, referenceReviews, type Review } from '../lib/content'

const toPersianDigits = (value: number | string) =>
  String(value).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])

export function UseCases() {
  const [active, setActive] = useState<number | null>(0)
  return (
    <section className="uses-section" id="possibilities">
      <div className="shell">
        <Reveal className="uses-heading">
          <h2>{'یک کلینیک قلب،\nمسیرهای درمانی متفاوت'}</h2>
        </Reveal>
        <div className="uses-list">
          {useCases.map((item, i) => (
            <article key={item.image} className={`use-row ${active === i ? 'active' : ''}`}>
              <button
                className="use-toggle"
                onClick={() => setActive(active === i ? null : i)}
                aria-expanded={active === i}
                aria-controls={`use-description-${i}`}
              >
                <span className="use-photo">
                  <img src={`/v8/media/${item.image}`} alt="" loading="lazy" />
                </span>
                <span className="use-label">
                  <span className="tiny-label">۰{toPersianDigits(i + 1)}</span>
                  <span className="use-title">{item.title}</span>
                </span>
                <span className="round-button">
                  <Plus size={23} strokeWidth={1.1} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {active === i && (
                  <motion.div
                    className="use-description"
                    id={`use-description-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease }}
                  >
                    <p>{item.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Shopping({
  onShop,
  onProduct,
}: {
  onShop: () => void
  onProduct: (mini: boolean) => void
}) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  // Reference site parallax pattern (l-how-to-buy-background): the photo
  // scrolls slower than the page behind the purchase steps.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])
  return (
    <>
      <section className="how-to-buy-section" ref={ref}>
        <motion.img
          className="buy-background"
          src="/v8/media/how-to-buy.webp"
          alt="پذیرش و هماهنگی نوبت قلب در کلینیک قلب مهر"
          loading="lazy"
          style={{ y: reduced ? 0 : backgroundY }}
        />
        <div className="buy-shade" />
        <div className="shell how-to-buy-content">
          <Reveal>
            <h2>چطور نوبت بگیرم؟</h2>
          </Reveal>
          <div className="purchase-steps">
            {[
              {
                title: 'روش را انتخاب کنید',
                body: 'آنلاین فرم را پر کنید یا تلفنی هماهنگ کنید',
              },
              {
                title: 'نوبت قلب رزرو کنید',
                body: 'ویزیت دکتر صادقی، متخصص قلب و عروق',
              },
              {
                title: 'آرام درمان شوید',
                body: 'پرونده قلبی و برنامه پیگیری برایتان آماده است',
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.1} className="purchase-step">
                <span className="purchase-step-number">{toPersianDigits(i + 1)}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                {i === 0 && (
                  <button className="text-link" onClick={onShop}>
                    انتخاب روش
                    <Arrow direction="diagonal" size={19} />
                  </button>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section id="buy" className="products-section">
        <FlowLines />
        <div className="shell">
          <Reveal className="products-title">
            <h2>{'نوبت قلب\nرا رزرو کنید'}</h2>
          </Reveal>
          <div className="product-grid">
            {[false, true].map((mini, i) => (
              <Reveal key={i} delay={i * 0.13} className="product-card">
                <button
                  className="product-image-button"
                  onClick={() => onProduct(mini)}
                  aria-label={`جزئیات ${mini ? 'ویزیت آنلاین' : 'ویزیت حضوری'}`}
                >
                  <img
                    src={`/v8/media/${mini ? 'mini-card' : 'clingr-card'}.webp`}
                    alt={mini ? 'ویزیت آنلاین و مشاوره پیامکی قلب' : 'ویزیت حضوری قلب در کلینیک قلب مهر'}
                    loading="lazy"
                  />
                </button>
                <div className="product-card-content">
                  <div className="product-card-heading">
                    <h3>
                      ویزیت
                      {mini && <span>آنلاین</span>}
                    </h3>
                    <p>
                      {mini
                        ? 'برای پیگیری دارو و مشاوره فوری'
                        : 'معاینه کامل با تجهیزات تشخیصی'}
                    </p>
                  </div>
                  <ul className="product-features">
                    <li>
                      <span>مدت جلسه</span>
                      <span>{mini ? '۲۰ دقیقه' : '۴۵ دقیقه'}</span>
                    </li>
                    <li>
                      <span>پزشک</span>
                      <span>دکتر آرش صادقی</span>
                    </li>
                    <li>
                      <span>نحوه انجام</span>
                      <span>{mini ? 'تماس تصویری' : 'حضوری در کلینیک'}</span>
                    </li>
                    <li>
                      <span>پیگیری</span>
                      <span>{mini ? 'پیامکی و تلفنی' : 'نوبت حضوری پیگیری'}</span>
                    </li>
                  </ul>
                  <div className="product-card-actions">
                    <OvalButton className="filled" onClick={onShop}>
                      دریافت نوبت
                      <Arrow direction="diagonal" size={18} />
                    </OvalButton>
                    <button className="text-link" onClick={() => onProduct(mini)}>
                      جزئیات بیشتر
                      <Plus size={19} strokeWidth={1.1} />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function Reviews({ onReview, refresh }: { onReview: () => void; refresh: number }) {
  const [reviews, setReviews] = useState<Review[]>(referenceReviews)
  const [active, setActive] = useState(0)
  useEffect(() => {
    const abort = new AbortController()
    fetch('/v8/api/reviews', { signal: abort.signal })
      .then(async response => {
        if (!response.ok) return
        const data: unknown = await response.json()
        if (Array.isArray(data)) {
          const saved = data.filter(
            (entry): entry is Review =>
              typeof entry === 'object' &&
              entry !== null &&
              typeof entry.name === 'string' &&
              typeof entry.comment === 'string' &&
              typeof entry.id === 'number',
          )
          setReviews([...saved, ...referenceReviews])
          setActive(0)
        }
      })
      .catch(() => {})
    return () => abort.abort()
  }, [refresh])
  const review = reviews[active] || reviews[0]
  const next = (delta: number) => setActive((active + delta + reviews.length) % reviews.length)
  return (
    <section className="reviews-section" id="reviews">
      <div className="shell">
        <div className="reviews-header">
          <Reveal>
            <h2>تجربه بیماران</h2>
          </Reveal>
          <button className="text-link" onClick={onReview}>
            ثبت تجربه شما
            <Plus size={18} strokeWidth={1.2} />
          </button>
        </div>
        <div className="review-layout">
          <div className="review-image">
            <img
              src={`/v8/media/review-${(active % 2) + 1}.jpg`}
              alt="بیماران قلبی در جلسه ویزیت کلینیک قلب مهر"
              loading="lazy"
            />
          </div>
          <div className="review-main">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={review.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.35, ease }}
              >
                <p>«{review.comment}»</p>
                <footer>
                  {review.name}
                  <span>{review.id < 0 ? 'از وب‌سایت کلینیک' : 'تجربه ثبت‌شده بیمار'}</span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
            <div className="review-controls">
              <span className="review-position" aria-live="polite">
                {toPersianDigits(String(active + 1).padStart(2, '0'))}
                <span className="muted">
                  {' / '}
                  {toPersianDigits(String(reviews.length).padStart(2, '0'))}
                </span>
              </span>
              <button className="round-button" onClick={() => next(-1)} aria-label="تجربه قبلی">
                <Arrow direction="left" />
              </button>
              <button className="round-button" onClick={() => next(1)} aria-label="تجربه بعدی">
                <Arrow />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Kit() {
  const kit = [
    { icon: 'certificate', fa: 'پرونده الکترونیک قلب' },
    { icon: 'instruction', fa: 'برنامه درمانی و کنترل فشار خون' },
    { icon: 'fastening', fa: 'خط تماس مستقیم با دستیار دکتر صادقی' },
    { icon: 'clingr', fa: 'یادآور نوبت و دارو، پیامکی' },
  ]
  return (
    <section className="kit-section">
      <div className="kit-layout shell">
        <Reveal className="kit-picture">
          <img
            src="/v8/media/kit.webp"
            alt="پرونده قلبی و برنامه پیگیری کلینیک قلب مهر"
            loading="lazy"
          />
        </Reveal>
        <div className="kit-copy">
          <Reveal>
            <h2>با هر بیمار قلبی همراه می‌شود:</h2>
          </Reveal>
          <ul>
            {kit.map((item, i) => (
              <li key={item.icon}>
                <Reveal delay={i * 0.06}>
                  <BrandIcon name={item.icon} />
                  <span>{item.fa}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function PartnerAndFooter({
  onPartner,
  onPrivacy,
  onShop,
}: {
  onPartner: () => void
  onPrivacy: () => void
  onShop: () => void
}) {
  return (
    <section id="partner" className="partner-section">
      <img
        className="partner-background"
        src="/v8/media/partner.webp"
        alt=""
        loading="lazy"
      />
      <FlowLines />
      <div className="partner-content shell">
        <Reveal>
          <p className="eyebrow">قلب سالم جامعه را با هم بسازیم</p>
          <h2>{'همکاری\nبا ما'}</h2>
          <OvalButton onClick={onPartner} className="partner-cta" arrow>
            ارسال درخواست
          </OvalButton>
        </Reveal>
        <p className="partner-note">
          برای پزشکان عمومی، آزمایشگاه‌ها، مراکز تصویربرداری و باشگاه‌های ورزشی. اگر به
          پیشگیری قلبی و مراقبت پیوسته باور دارید، بیایید مسیر سلامت قلب را برای مردم
          ساده‌تر کنیم.
        </p>
      </div>
      <footer className="site-footer shell">
        <div className="footer-top">
          <a href="#top" aria-label="بازگشت به بالا">
            <Logo />
          </a>
          <button className="text-link" onClick={onShop}>
            نوبت ویزیت قلب در مهر
            <Arrow direction="diagonal" size={21} />
          </button>
          <a href="#top" className="footer-back-top" aria-label="بازگشت به بالا">
            <Arrow direction="down" size={21} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© کلینیک قلب مهر {toPersianDigits(new Date().getFullYear())}</span>
          <button onClick={onPrivacy}>حریم خصوصی و کوکی‌ها</button>
          <span className="footer-credit">
            نسخه آزمایشی طراحی v8 <span className="credit-dot" />
          </span>
        </div>
      </footer>
    </section>
  )
}
