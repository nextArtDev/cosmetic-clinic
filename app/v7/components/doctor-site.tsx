'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Pause,
  Play,
} from 'lucide-react'
import {
  services,
  results,
  faqs,
  principles,
  type OverlayState,
  type ConsultationLocation,
} from '../lib/site-content'
import { getLenis } from '../lib/lenis'
import { Logo, Reveal, MaskReveal, ImageReveal, Parallax, SwapText } from './ui'
import SiteOverlays from './site-overlays'

const ease = [0.22, 1, 0.36, 1] as const

const heroFade = (delay: number) => ({
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease, delay } },
})

function Preloader() {
  return (
    <motion.div
      className="v7-preloader"
      exit={{ y: '-100%' }}
      transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
      aria-hidden="true"
    >
      <motion.div
        className="v7-preloader__inner"
        exit={{ opacity: 0, y: -26, transition: { duration: 0.35, ease: 'easeIn' } }}
      >
        <span className="v7-preloader__mark">گریگوری</span>
        <span className="v7-preloader__sub">متخصص لیزر مو و پوست</span>
      </motion.div>
      <motion.div
        className="v7-preloader__line"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.55, ease: [0.65, 0, 0.35, 1] }}
      />
    </motion.div>
  )
}

export default function DoctorWebsite() {
  const [overlay, setOverlay] = useState<OverlayState>(null)
  const [scrolled, setScrolled] = useState(false)
  const [headerHidden, setHeaderHidden] = useState(false)
  const [paused, setPaused] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [heroDone, setHeroDone] = useState(false)
  const [activeService, setActiveService] = useState(0)
  const [resultFilter, setResultFilter] = useState('all')
  const [resultIndex, setResultIndex] = useState(0)
  const [activePrinciple, setActivePrinciple] = useState(0)
  const [activeFaq, setActiveFaq] = useState(-1)
  const [contactLocation, setContactLocation] = useState<ConsultationLocation>('تهران')
  const reducedMotion = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const prevScrollRef = useRef(0)
  const { scrollY, scrollYProgress } = useScroll()
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '22%'])
  const heroOpacity = useTransform(heroProgress, [0, 0.85], [1, 0.15])
  // Reference: entrance title scales to .87, lifts -5vh and fades out
  // across the first ~20% of the hero's scroll (data-parallax-0-20).
  const titleScale = useTransform(heroProgress, [0, 0.22], [1, 0.87])
  const titleY = useTransform(heroProgress, [0, 0.22], ['0vh', '-5vh'])
  const titleOpacity = useTransform(heroProgress, [0, 0.22], [1, 0])
  const pointerX = useSpring(0, { stiffness: 35, damping: 20 })
  useMotionValueEvent(scrollY, 'change', (value) => {
    setScrolled(value > 60)
    const previous = prevScrollRef.current
    if (value > 420 && value > previous + 4) setHeaderHidden(true)
    else if (value < previous - 4 || value <= 420) setHeaderHidden(false)
    prevScrollRef.current = value
  })
  useMotionValueEvent(heroProgress, 'change', (value) => {
    const done = value > 0.24
    if (done !== heroDone) setHeroDone(done)
  })

  // Entrance preloader gates the hero choreography, like the reference's
  // landing preloader (reveal delays are timed off its completion).
  // Reduced motion skips the show — loaded flips on the next tick.
  useEffect(() => {
    window.scrollTo(0, 0)
    if (!reducedMotion) document.documentElement.setAttribute('data-v7-loading', '')
    const timer = window.setTimeout(() => setLoaded(true), reducedMotion ? 0 : 2050)
    return () => {
      window.clearTimeout(timer)
      document.documentElement.removeAttribute('data-v7-loading')
    }
  }, [reducedMotion])
  useEffect(() => {
    if (loaded) document.documentElement.removeAttribute('data-v7-loading')
    const lenis = getLenis()
    if (!lenis) return
    if (loaded) lenis.start()
    else lenis.stop()
  }, [loaded])

  const closeOverlay = useCallback(() => setOverlay(null), [])
  const navigate = useCallback(
    (id: string) => {
      setOverlay(null)
      window.setTimeout(() => {
        const target = document.getElementById(id)
        if (!target) return
        const lenis = getLenis()
        if (lenis && !reducedMotion) lenis.scrollTo(target, { offset: -72, duration: 1.25 })
        else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
      }, 320)
    },
    [reducedMotion],
  )
  const service = services[activeService]
  const filteredResults =
    resultFilter === 'all' ? results : results.filter((item) => item.service === resultFilter)
  const visibleResults = Array.from(
    { length: Math.min(filteredResults.length, 3) },
    (_, index) => filteredResults[(resultIndex + index) % filteredResults.length],
  )
  const heroState = loaded ? 'show' : 'hidden'

  return (
    <>
      <AnimatePresence>{!loaded && !reducedMotion && <Preloader />}</AnimatePresence>
      <div id="v7-content">
        <motion.div className="page-progress" style={{ scaleX: scrollYProgress }} />
        <motion.header
          className={`site-header ${scrolled ? 'is-scrolled' : ''} ${headerHidden ? 'is-hidden' : ''}`}
          initial={reducedMotion ? false : { opacity: 0, y: -16 }}
          animate={loaded || reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: 0.8, ease, delay: 0.9 }}
        >
          <button
            className="header-menu text-button"
            onClick={() => setOverlay({ type: 'menu' })}
            aria-label="باز کردن منو"
            aria-haspopup="dialog"
          >
            <span className="menu-lines">
              <i />
              <i />
            </span>
            <span>منو</span>
          </button>
          <a className="header-logo" href="#home" aria-label="صفحه اصلی دکتر گریگوری">
            <Logo />
          </a>
          <button className="header-book text-button" onClick={() => setOverlay({ type: 'appointment' })}>
            <span>
              <SwapText text="رزرو نوبت" />
            </span>
            <ArrowUpRight size={17} strokeWidth={1.1} />
          </button>
        </motion.header>

        <main id="main-content">
          <section
            className="hero"
            id="home"
            ref={heroRef}
            onMouseMove={(event) => {
              if (!paused && !reducedMotion)
                pointerX.set((event.clientX / window.innerWidth - 0.5) * 18)
            }}
            onMouseLeave={() => pointerX.set(0)}
          >
            <motion.div
              className="hero-scene"
              style={{
                y: reducedMotion || paused ? 0 : heroY,
                x: reducedMotion || paused ? 0 : pointerX,
                opacity: reducedMotion ? 1 : heroOpacity,
              }}
            >
              <motion.div
                className="hero-photo"
                animate={{ scale: paused || reducedMotion ? 1 : [1, 1.035, 1] }}
                transition={{ duration: 20, ease: 'easeInOut', repeat: Infinity }}
              >
                <Image
                  src="/v7/images/hero.webp"
                  alt="پرتره‌ای با نور ملایم که زیبایی طبیعی را جشن می‌گیرد"
                  fill
                  priority
                  sizes="(max-width: 760px) 120vw, 80vw"
                />
              </motion.div>
              <div className="hero-shade" />
            </motion.div>
            <motion.div
              className="hero-topline"
              variants={heroFade(0.55)}
              initial={reducedMotion ? false : 'hidden'}
              animate={heroState}
            >
              <span>
                آرمان گریگوری
                <br />
                <span className="muted">متخصص لیزر مو و پوست</span>
              </span>
              <span>
                تهران
                <br />
                کرج
              </span>
            </motion.div>
            <motion.div
              className="hero-center"
              style={
                reducedMotion
                  ? undefined
                  : {
                      scale: titleScale,
                      y: titleY,
                      opacity: titleOpacity,
                      pointerEvents: heroDone ? 'none' : 'auto',
                      willChange: 'transform, opacity',
                    }
              }
            >
              <MaskReveal play={loaded} delay={0.15} className="hero-h1-mask">
                <h1>زیباییِ تو</h1>
              </MaskReveal>
              <motion.div
                className="hero-statement"
                variants={heroFade(0.6)}
                initial={reducedMotion ? false : 'hidden'}
                animate={heroState}
              >
                <span className="little-star" aria-hidden="true">
                  ✧
                </span>
                <p>
                  بی‌نقص،
                  <br />
                  تا آخرین جزئیات
                </p>
              </motion.div>
            </motion.div>
            <motion.div
              className="hero-bottom"
              initial={reducedMotion ? false : 'hidden'}
              animate={heroState}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.75 } } }}
            >
              <motion.div className="hero-description" variants={heroFade(0)}>
                <span className="eyebrow">زیبایی، شخصی است.</span>
                <p>رویکرد ما هم همین‌طور.</p>
              </motion.div>
              <motion.a
                className="hero-discover"
                href="#doctor"
                aria-label="آشنایی با پزشک"
                variants={heroFade(0)}
              >
                <span>
                  <SwapText text="کشف کنید" />
                </span>
                <span className="square-arrow">
                  <ArrowDown size={25} strokeWidth={1} />
                </span>
                <span className="discover-line" />
              </motion.a>
              <motion.button
                className="motion-control"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? 'پخش حرکت ملایم' : 'توقف حرکت ملایم'}
                variants={heroFade(0)}
              >
                {paused ? <Play size={11} fill="currentColor" /> : <Pause size={11} />}
                <span>{paused ? 'پخش حرکت' : 'توقف حرکت'}</span>
              </motion.button>
            </motion.div>
            <div className="hero-grain" aria-hidden="true" />
          </section>

          <section className="doctor-section section-padding" id="doctor">
            <div className="section-topline">
              <span className="eyebrow">۰۱ / پزشک</span>
              <span className="eyebrow">جایی که تخصص به هنر می‌رسد</span>
            </div>
            <Parallax distance={44}>
              <div className="doctor-title-wrap">
                <MaskReveal className="doctor-honed-mask" delay={0.1}>
                  <div className="doctor-honed">
                    پخته
                    <br />
                    در دلِ سال‌ها
                  </div>
                </MaskReveal>
                <h2 className="sr-only">کمال، پخته در دلِ سال‌ها</h2>
                <MaskReveal>
                  <div className="doctor-title" aria-hidden="true">
                    کمالِ مطلق
                  </div>
                </MaskReveal>
              </div>
            </Parallax>
            <div className="doctor-portrait">
              <ImageReveal className="v7-abs-fill">
                <Parallax distance={0} scale className="v7-abs-fill">
                  <Image
                    src="/v7/images/portrait.webp"
                    alt="دکتر آرمان گریگوری، متخصص لیزر مو و پوست"
                    fill
                    sizes="(max-width: 760px) 100vw, 64vw"
                  />
                </Parallax>
              </ImageReveal>
              <div />
            </div>
            <div className="doctor-editorial">
              <Reveal className="doctor-bio">
                <span className="eyebrow">دکتر آرمان گریگوری</span>
                <p>
                  متخصص اصلی و سرپرست بخش لیزر.
                  <br />
                  نگاهی دقیق به زیبایی.
                  <br />
                  رویکردی کاملاً شخصی.
                </p>
                <button
                  className="text-button underlined-link"
                  onClick={() => setOverlay({ type: 'profile' })}
                >
                  آشنایی با پزشک <ArrowUpRight size={19} strokeWidth={1} />
                </button>
              </Reveal>
              <Parallax distance={26}>
                <Reveal className="doctor-quote" delay={0.15}>
                  <span className="quote-mark">”</span>
                  <blockquote>
                    تنها چشمِ ورزیده و دستِ ماهرِ استادی می‌تواند کمالِ پنهان را آشکار کند.
                  </blockquote>
                  <span className="signature">آ. گریگوری</span>
                </Reveal>
              </Parallax>
            </div>
            <Reveal className="doctor-stats">
              <div>
                <span className="stat-number">
                  ۱۲<span>+</span>
                </span>
                <span className="eyebrow">سال تجربه تخصصی</span>
              </div>
              <div>
                <span className="stat-number">
                  ۹٬۵۰۰<span>+</span>
                </span>
                <span className="eyebrow">مراجعه‌کننده</span>
              </div>
              <div>
                <span className="stat-number">
                  ۲۵٬۰۰۰<span>+</span>
                </span>
                <span className="eyebrow">جلسه لیزر موفق</span>
              </div>
            </Reveal>
          </section>

          <section className="philosophy-section section-padding" id="philosophy">
            <div className="section-topline">
              <span className="eyebrow">۰۲ / فلسفه ما</span>
              <span className="eyebrow">طبیعی، بی‌مانندِ خودتان</span>
            </div>
            <div className="philosophy-grid">
              <div className="philosophy-left">
                <div className="philosophy-heading">
                  <MaskReveal>
                    <h2>
                      درخششِ
                      <br />
                      <span>پوست.</span>
                    </h2>
                  </MaskReveal>
                </div>
                <div className="philosophy-phase philosophy-phase--intro">
                  <Reveal>
                    <p className="philosophy-intro">
                      نسخه‌ای دیگر از شما نه؛
                      <br />
                      درخشان‌ترینِ خودتان.
                    </p>
                  </Reveal>
                  <div className="philosophy-small-image">
                    <ImageReveal className="v7-abs-fill" delay={0.1}>
                      <Image
                        src="/v7/images/face.webp"
                        alt="مطالعه‌ای در هماهنگی طبیعی پوست"
                        fill
                        sizes="220px"
                      />
                    </ImageReveal>
                    <span className="image-caption">نگاهی به فردِ یکتا.</span>
                  </div>
                </div>
              </div>
              <div className="philosophy-right">
                <ImageReveal className="philosophy-image">
                  <Parallax axis="x" distance={26} className="v7-abs-fill">
                    <Image
                      src="/v7/images/aesthetic.webp"
                      alt="مطالعه‌ای هنری از ظرافت و تناسب"
                      fill
                      sizes="(max-width: 760px) 90vw, 42vw"
                    />
                  </Parallax>
                </ImageReveal>
              </div>
              <div className="philosophy-phase philosophy-phase--copy">
                <Reveal className="philosophy-copy">
                  <span className="little-star" aria-hidden="true">
                    ✧
                  </span>
                  <p>
                    حس زیبایی‌شناسانه هدیه‌ای کمیاب است. دکتر گریگوری با تجربه‌ای گسترده و نگاهی
                    هنری، ویژگی‌های طبیعی پوست شما را برجسته می‌کند تا هماهنگی و ظرافتی اصیل شکل
                    بگیرد.
                  </p>
                </Reveal>
              </div>
            </div>
          </section>

          <section className="services-section section-padding" id="services">
            <div className="section-topline">
              <span className="eyebrow">۰۳ / تخصص ما</span>
              <button
                className="text-button small-link"
                onClick={() => setOverlay({ type: 'calculator' })}
              >
                راهنمای قیمت <ArrowUpRight size={15} />
              </button>
            </div>
            <div className="services-heading">
              <MaskReveal>
                <h2>
                  خدمات
                  <br />
                  اصلی.
                </h2>
              </MaskReveal>
              <Reveal>
                <p>
                  درخشش نگاه شما. ظرافت خطوط چهره. شفافیت پوست.
                  <br />
                  <br />
                  <span>بگذارید تصویرِ تازه‌تان حرف بزند.</span>
                </p>
              </Reveal>
            </div>
            <div className="services-grid">
              <div className="service-list" aria-label="خدمات لیزری کلینیک">
                {services.map((item, index) => (
                  <button
                    key={item.id}
                    className={`service-row ${index === activeService ? 'active' : ''}`}
                    onMouseEnter={() => setActiveService(index)}
                    onFocus={() => setActiveService(index)}
                    onClick={() => setOverlay({ type: 'service', service: item.id })}
                  >
                    <span className="service-number">{item.number}</span>
                    <span>{item.title}</span>
                    <ArrowUpRight size={25} strokeWidth={1} />
                  </button>
                ))}
                <div className="service-list-footer">
                  <span className="little-star" aria-hidden="true">
                    ✧
                  </span>
                  <p>
                    هر جزئیات دیده شده.
                    <br />
                    هر درمان، شخصی.
                  </p>
                </div>
              </div>
              <button
                className="service-preview"
                onClick={() => setOverlay({ type: 'service', service: service.id })}
                aria-label={`مشاهده ${service.title}`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    className="service-preview-image"
                    key={service.id}
                    initial={{ opacity: 0, scale: 1.035 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Image
                      src={service.image}
                      alt={service.subtitle}
                      fill
                      sizes="(max-width: 760px) 100vw, 50vw"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="service-preview-shade" />
                <span className="service-preview-top eyebrow">{service.number} / ۰۵</span>
                <span className="service-preview-bottom">
                  <span>
                    <span className="eyebrow">{service.subtitle}</span>
                    <span className="service-preview-description">{service.description}</span>
                  </span>
                  <span className="square-arrow">
                    <ArrowUpRight size={25} strokeWidth={1} />
                  </span>
                </span>
              </button>
            </div>
          </section>

          <section className="results-section section-padding" id="results">
            <div className="section-topline">
              <span className="eyebrow">۰۴ / گالری نتیجه‌ها</span>
              <span className="eyebrow">اعتمادی از جنس شفافیت</span>
            </div>
            <div className="results-heading">
              <MaskReveal>
                <h2>
                  نتیجه،
                  <br />
                  <span>واقعی.</span>
                </h2>
              </MaskReveal>
              <Reveal>
                <p>
                  زیباییِ فردی. چشم‌اندازی شخصی.
                  <br />
                  امکان‌ها را ببینید.
                </p>
                <span className="small-note">
                  عکس‌ها ناحیه درمان را نشان می‌دهند، نه قبل و بعد.
                </span>
              </Reveal>
            </div>
            <div className="results-toolbar">
              <div className="result-filters" aria-label="فیلتر نتیجه‌ها بر اساس خدمت">
                {[
                  { id: 'all', title: 'همه نتیجه‌ها' },
                  ...services.map((item) => ({ id: item.id as string, title: item.title })),
                ].map((item) => (
                  <button
                    key={item.id}
                    className={resultFilter === item.id ? 'active' : ''}
                    aria-pressed={resultFilter === item.id}
                    onClick={() => {
                      setResultFilter(item.id)
                      setResultIndex(0)
                    }}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              <div className="result-nav">
                <button
                  className="circle-button"
                  aria-label="نتیجه‌های قبلی"
                  disabled={filteredResults.length < 2}
                  onClick={() =>
                    setResultIndex(
                      (index) => (index - 1 + filteredResults.length) % filteredResults.length,
                    )
                  }
                >
                  <ArrowLeft size={19} strokeWidth={1} />
                </button>
                <button
                  className="circle-button"
                  aria-label="نتیجه‌های بعدی"
                  disabled={filteredResults.length < 2}
                  onClick={() => setResultIndex((index) => (index + 1) % filteredResults.length)}
                >
                  <ArrowRight size={19} strokeWidth={1} />
                </button>
              </div>
            </div>
            <div
              className={`results-grid ${visibleResults.length === 1 ? 'is-filtered' : ''}`}
              aria-live="polite"
            >
              <AnimatePresence mode="popLayout">
                {visibleResults.map((item) => (
                  <motion.button
                    layout
                    key={item.id}
                    className="result-card"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setOverlay({ type: 'gallery', result: item.id })}
                  >
                    <span className="result-image">
                      <Image
                        src={item.image}
                        alt={`${item.category} — پیش‌نمایش ناحیه درمان`}
                        fill
                        sizes="(max-width: 600px) 85vw, 32vw"
                      />
                      <span className="result-image-cta">
                        مشاهده نتیجه <ArrowUpRight size={20} />
                      </span>
                    </span>
                    <span className="result-caption">
                      <span>
                        <span className="eyebrow">{item.category}</span>
                        <span className="result-title">{item.title}</span>
                      </span>
                      <ArrowUpRight size={23} strokeWidth={1} />
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
              {visibleResults.length === 1 && (
                <div className="result-insight">
                  <span className="little-star" aria-hidden="true">
                    ✧
                  </span>
                  <h3>
                    داستانِ شما.
                    <br />
                    امکان‌های شما.
                  </h3>
                  <p>
                    هر تغییر با یک گفت‌وگو آغاز می‌شود. ببینید رویکردی شخصی چه معنایی برای شما
                    می‌تواند داشته باشد.
                  </p>
                  <button
                    className="text-button underlined-link"
                    onClick={() =>
                      setOverlay({ type: 'appointment', service: visibleResults[0].service })
                    }
                  >
                    بیایید از شما حرف بزنیم <ArrowUpRight size={18} />
                  </button>
                </div>
              )}
            </div>
            <p className="results-disclaimer">
              پیش‌نمایش‌ها صرفاً ناحیه درمان را نشان می‌دهند، نه نتیجه قبل و بعد. نتیجه در هر فرد
              متفاوت است. مشاوره حضوری لازم است.
            </p>
          </section>

          <section className="approach-section section-padding" id="approach">
            <div className="section-topline">
              <span className="eyebrow">۰۵ / رویکرد</span>
              <span className="eyebrow">دقت. مراقبت. ظرافت.</span>
            </div>
            <MaskReveal className="approach-heading">
              <h2>
                ارکانِ
                <br />
                بی‌نقصی.
              </h2>
            </MaskReveal>
            <div className="approach-grid">
              <div className="hand-image">
                <ImageReveal className="v7-abs-fill">
                  <Parallax distance={30} className="v7-abs-fill">
                    <Image
                      src="/v7/images/hands.webp"
                      alt="دست متخصص در حال تنظیم دقیق دستگاه لیزر"
                      fill
                      sizes="(max-width: 760px) 85vw, 50vw"
                    />
                  </Parallax>
                </ImageReveal>
                <span className="hand-caption eyebrow">
                  دستی دقیق.
                  <br />
                  تفاوتی چشمگیر.
                </span>
              </div>
              <div className="principles-list">
                {principles.map((item, index) => (
                  <div
                    className={`principle ${activePrinciple === index ? 'active' : ''}`}
                    key={item.title}
                  >
                    <button
                      onClick={() =>
                        setActivePrinciple((current) => (current === index ? -1 : index))
                      }
                      aria-expanded={activePrinciple === index}
                      aria-controls={`principle-${index}`}
                    >
                      <span className="eyebrow">{['۰۱', '۰۲', '۰۳'][index]}</span>
                      <span>{item.title}</span>
                      {activePrinciple === index ? (
                        <Minus size={24} strokeWidth={1} />
                      ) : (
                        <Plus size={24} strokeWidth={1} />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {activePrinciple === index && (
                        <motion.div
                          id={`principle-${index}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35 }}
                        >
                          <p>{item.text}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                <button
                  className="text-button underlined-link approach-cta"
                  onClick={() => setOverlay({ type: 'appointment' })}
                >
                  رویکردی شخصی را تجربه کنید <ArrowUpRight size={19} strokeWidth={1} />
                </button>
              </div>
            </div>
          </section>

          <section className="faq-section section-padding" id="faq">
            <div className="section-topline">
              <span className="eyebrow">۰۶ / پرسش‌های شما</span>
              <span className="eyebrow">اعتماد از شفافیت آغاز می‌شود</span>
            </div>
            <div className="faq-grid">
              <Reveal>
                <MaskReveal>
                  <h2>
                    اندکی
                    <br />
                    شفافیتِ
                    <br />
                    بیشتر.
                  </h2>
                </MaskReveal>
                <p>
                  پاسخ‌هایی موشکافانه،
                  <br />
                  برای تصمیمی موشکافانه.
                </p>
                <button
                  className="text-button underlined-link"
                  onClick={() => setOverlay({ type: 'appointment' })}
                >
                  پرسش خودتان را بپرسید <ArrowUpRight size={18} />
                </button>
              </Reveal>
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <div className={`faq-item ${activeFaq === index ? 'active' : ''}`} key={faq.question}>
                    <h3>
                      <button
                        onClick={() => setActiveFaq((current) => (current === index ? -1 : index))}
                        aria-expanded={activeFaq === index}
                        aria-controls={`faq-answer-${index}`}
                      >
                        <span>{faq.question}</span>
                        {activeFaq === index ? (
                          <Minus size={20} strokeWidth={1} />
                        ) : (
                          <Plus size={20} strokeWidth={1} />
                        )}
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {activeFaq === index && (
                        <motion.div
                          id={`faq-answer-${index}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="contacts-section section-padding" id="contacts">
            <div className="section-topline">
              <span className="eyebrow">۰۷ / دعوتی شخصی</span>
              <span className="eyebrow">فصل تازه‌تان از همین‌جا آغاز می‌شود</span>
            </div>
            <div className="contact-intro">
              <div className="contact-photo">
                <ImageReveal className="v7-abs-fill">
                  <Parallax distance={44} className="v7-abs-fill">
                    <Image
                      src="/v7/images/consultation.webp"
                      alt="دکتر گریگوری، آماده برای یک گفت‌وگوی شخصی"
                      fill
                      sizes="(max-width: 760px) 100vw, 55vw"
                    />
                  </Parallax>
                </ImageReveal>
              </div>
              <Reveal className="contact-heading">
                <MaskReveal>
                  <h2>
                    دیداری که
                    <br />
                    مسیرِ پوستِ شما
                    <br />
                    را عوض می‌کند.
                  </h2>
                </MaskReveal>
                <button className="contact-book" onClick={() => setOverlay({ type: 'appointment' })}>
                  <span>
                    <SwapText text="رزرو نوبت" />
                  </span>
                  <span className="circle-button">
                    <ArrowUpRight size={30} strokeWidth={1} />
                  </span>
                </button>
              </Reveal>
            </div>
            <div className="contact-details">
              <div>
                <span className="eyebrow">حضوری. یا از هر جای دنیا.</span>
                <div className="contact-location-tabs">
                  {(['تهران', 'کرج', 'آنلاین'] as ConsultationLocation[]).map((location) => (
                    <button
                      key={location}
                      className={contactLocation === location ? 'active' : ''}
                      aria-pressed={contactLocation === location}
                      onClick={() => setContactLocation(location)}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
              <div className="contact-location-info" aria-live="polite">
                <span className="eyebrow">
                  {contactLocation === 'آنلاین'
                    ? 'گفت‌وگویی بدون مرز'
                    : 'مشاوره و درمان'}
                </span>
                <p>
                  {contactLocation === 'کرج' ? (
                    <>
                      کرج، عظیمیه، میدان مهر
                      <br />
                      برج پزشکان کسری، طبقه ۲
                    </>
                  ) : contactLocation === 'آنلاین' ? (
                    <>
                      یک ویدئو مشاوره اولیه،
                      <br />
                      از آرامش خانه‌تان.
                    </>
                  ) : (
                    <>
                      تهران، ولیعصر، نرسیده به پارک ساعی
                      <br />
                      برج پزشکان مهر، طبقه ۳
                    </>
                  )}
                </p>
                {contactLocation === 'آنلاین' ? (
                  <button
                    className="text-button"
                    onClick={() => setOverlay({ type: 'appointment', location: contactLocation })}
                  >
                    وقت مشاوره بگیرید <ArrowUpRight size={14} />
                  </button>
                ) : (
                  <a
                    className="text-button"
                    href="https://www.google.com/maps/search/?api=1&query=Valiasr+Tehran"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    روی نقشه ببینید <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
              <div>
                <span className="eyebrow">یک گفت‌وگوی مستقیم</span>
                <a className="contact-email" href="mailto:info@dr-grigori-laser.ir">
                  info@dr-grigori-laser.ir <ArrowUpRight size={18} />
                </a>
                <a className="contact-phone" href="tel:+982188776655">
                  ۰۲۱ ۸۸ ۷۷ ۶۶ ۵۵ <ArrowUpRight size={15} />
                </a>
                <p className="contact-small">
                  قدمی سنجیده.
                  <br />
                  مسیری کاملاً فردی.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="site-footer section-padding">
          <div className="footer-main">
            <a href="#home" aria-label="بازگشت به خانه">
              <Logo />
            </a>
            <span className="eyebrow">لیزر؛ به روایتِ هنر</span>
            <a href="#home" className="back-top">
              <SwapText text="بازگشت به بالا" /> <ArrowUp size={18} strokeWidth={1} />
            </a>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} دکتر گریگوری</span>
            <span className="footer-credit">بازآفرینی طراحی · الهام‌گرفته از Vide Infra</span>
            <button onClick={() => setOverlay({ type: 'privacy' })}>
              حریم خصوصی <ArrowUpRight size={12} />
            </button>
          </div>
        </footer>
      </div>
      <SiteOverlays overlay={overlay} onClose={closeOverlay} onOpen={setOverlay} onNavigate={navigate} />
    </>
  )
}
