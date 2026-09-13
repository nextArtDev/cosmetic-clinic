'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  Check,
  Globe2,
  Menu,
  Play,
  Plus,
  X,
} from 'lucide-react'
import Image from 'next/image'
import {
  consultationTypes,
  faqs,
  navigation,
  processSteps,
  services,
  testimonials,
} from '../lib/site-content'
import { BookingForm } from './booking-form'
import { MotionSystem, Words, ShaninaShell } from './motion-system'

const imagePath = (name: string) => `/v2/images/${name}`
const refreshLayout = () => window.dispatchEvent(new Event('layout:changed'))

/** Latin digits are kept for section indices (Persian web convention). */
const num = (value: number) => String(value).padStart(2, '0')

function Picture({
  desktop,
  mobile,
  alt = '',
  className = '',
  eager = false,
}: {
  desktop: string
  mobile?: string
  alt?: string
  className?: string
  eager?: boolean
}) {
  // Art-directed hero/service backgrounds: the original swaps a mobile crop
  // under 768px. next/image can't do <source> swaps, so render both and let
  // CSS media queries pick (see .v2 .v2-picture rules in globals.css).
  return (
    <span className={`v2-picture ${className}`}>
      <Image
        src={imagePath(desktop)}
        alt={alt}
        fill
        sizes="(max-width: 767px) 100vw, (min-width: 768px) and (max-height: 700px) 100vw, 100vw"
        priority={eager}
        draggable={false}
        className="v2-img-desktop"
      />
      {mobile && (
        <Image
          src={imagePath(mobile)}
          alt={alt}
          fill
          sizes="(max-width: 767px) 100vw, 100vw"
          priority={eager}
          draggable={false}
          className="v2-img-mobile"
        />
      )}
    </span>
  )
}

function Star({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 356 356"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M178 0s-2.346 100.135 37.76 140.24S356 178 356 178s-100.135-2.346-140.24 37.76S178 356 178 356s2.346-100.135-37.76-140.24S0 178 0 178s100.135 2.346 140.24-37.76S178 0 178 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

function MagneticLink({
  children,
  className = '',
  href = '#form',
  label,
  onClick,
}: {
  children: ReactNode
  className?: string
  href?: string
  label?: string
  onClick?: () => void
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 180, damping: 15 })
  const springY = useSpring(y, { stiffness: 180, damping: 15 })
  const reduced = useReducedMotion()
  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== 'mouse' || reduced) return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) * 0.23)
    y.set((event.clientY - rect.top - rect.height / 2) * 0.23)
  }
  return (
    <motion.a
      href={href}
      className={className}
      aria-label={label}
      onClick={onClick}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.94 }}
    >
      {children}
    </motion.a>
  )
}

function Header() {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  useEffect(() => {
    const handle = () => setVisible(window.scrollY > window.innerHeight * 0.82)
    window.addEventListener('scroll', handle, { passive: true })
    handle()
    return () => window.removeEventListener('scroll', handle)
  }, [])
  useEffect(() => {
    if (!open) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [open])
  return (
    <>
      <header
        className={`site-header ${visible || open ? 'is-visible' : ''}`}
        inert={!visible && !open}
      >
        <div className="header-bar">
          <a
            href="#main"
            className="header-logo"
            onClick={() => setOpen(false)}
          >
            دکتر <strong>شبنم فضلی</strong>
          </a>
          <nav className="header-desktop-nav" aria-label="منو سریع">
            <a href="#about">درباره من</a>
            <a href="#online">مشاوره‌ها</a>
            <a href="#clients">مراجعان</a>
          </nav>
          <a
            href="#form"
            className="header-book"
            onClick={() => setOpen(false)}
            data-stagger-link
          >
            <span data-stagger-text>رزرو مشاوره</span> <ArrowUpLeft size={17} />
          </a>
          <button
            className="menu-toggle"
            aria-label={open ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={open}
            aria-controls="expanded-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.nav
              id="expanded-navigation"
              className="expanded-nav"
              aria-label="منو اصلی"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {navigation.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <span className="nav-index">{num(index + 1)}</span>
                  <span>{item.label}</span>
                  <ArrowUpLeft strokeWidth={1} />
                </a>
              ))}
              <div className="expanded-nav-note">
                مراقبتی شخصی‌سازی‌شده. در هرجای دنیا.
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
        <motion.div className="reading-progress" style={{ scaleX: progress }} />
      </header>
    </>
  )
}

function Hero() {
  const hero = useRef<HTMLElement>(null)
  const [cursorVisible, setCursorVisible] = useState(true)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const x = useSpring(mouseX, { stiffness: 160, damping: 24, mass: 0.55 })
  const y = useSpring(mouseY, { stiffness: 160, damping: 24, mass: 0.55 })
  const reduced = useReducedMotion()
  function handlePointer(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || reduced || !hero.current) return
    const rect = hero.current.getBoundingClientRect()
    const diameter = Math.min(230, Math.max(138, window.innerWidth * 0.1171875))
    mouseX.set(event.clientX - rect.left - diameter / 2)
    mouseY.set(event.clientY - rect.top - diameter / 2)
    const target = event.target as HTMLElement
    setCursorVisible(!target.closest('nav, .hero-facts'))
  }
  return (
    <section
      className="hero text-white! "
      id="main"
      ref={hero}
      onPointerMove={handlePointer}
      onPointerLeave={() => setCursorVisible(false)}
      aria-label="دکتر شبنم فضلی"
    >
      <Picture
        desktop="hero-bg-d-scaled.webp"
        mobile="hero-bg-m.webp"
        alt="نور گرم آفتاب روی صورت و گردن یک زن"
        className="hero-background"
        eager
      />
      <a
        className="hero-background-link"
        href="#form"
        aria-label="رزرو مشاوره با دکتر شبنم فضلی"
        tabIndex={-1}
      />
      <div className="hero-inner px-4!">
        <h1
          className="hero-title text-xl! font-bold! pb-4! text-center! py-4"
          aria-label="دکتر شبنم فضلی"
        >
          <span className="title-word">دکتر</span>{' '}
          <span className="title-word">شبنم فضلی</span>
        </h1>
        <nav className="hero-nav" aria-label="Section navigation">
          {navigation.map((item) => (
            <div
              className={`hero-nav-item ${['#about', '#online', '#availability'].includes(item.href) ? 'desktop-link' : ''}`}
              key={item.href}
            >
              <a href={item.href} className="rolling-link">
                <span data-label={item.label}>{item.label}</span>
              </a>
            </div>
          ))}
        </nav>
        <MagneticLink className="mobile-hero-book" label="رزرو مشاوره">
          <span>
            رزرو
            <br />
            مشاوره
          </span>
        </MagneticLink>
        <div className="hero-copy">
          <h2>
            مراقبت تخصصی از
            <br className="desktop-break" /> پوست و زیبایی شما
          </h2>
          <p className="">
            مشاوره آنلاین شخصی‌سازی‌شده پوست از پزشک زیبایی باتجربه با بیش از ۲۰
            سال تجربه
          </p>
        </div>
        <div className="hero-facts">
          <div>
            <span>پزشک متخصص.</span>
            <strong>شبنم فضلی</strong>
          </div>
          <div className="desktop-fact">
            <span>تجربه</span>
            <strong>۲۰ سال</strong>
          </div>
          <div>
            <span>شخصی</span>
            <strong>نقشه راه پوستی</strong>
          </div>
          <a href="#form" className="desktop-fact">
            <span>مشاوره می‌خواهید؟</span>
            <strong>
              دکمه را لمس کنید <ArrowUpLeft size={14} />
            </strong>
          </a>
        </div>
      </div>
      <motion.div
        className="hero-cursor"
        aria-hidden="true"
        style={{ x, y }}
        animate={{ scale: cursorVisible ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <span>
          رزرو
          <br />
          مشاوره
        </span>
      </motion.div>
      <a
        href="#about"
        className="hero-scroll"
        aria-label="رویکرد من را کشف کنید"
      >
        <ArrowDown size={17} strokeWidth={1} />
      </a>
    </section>
  )
}

function About() {
  const [active, setActive] = useState(0)
  const section = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onScroll = () => {
      if (!section.current) return
      const rect = section.current.getBoundingClientRect()
      if (rect.top <= 0 && rect.bottom > 0)
        setActive(
          -rect.top / Math.max(1, rect.height - window.innerHeight) > 0.5
            ? 1
            : 0,
        )
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const slides = [
    {
      title: 'نگاه جامع',
      heading:
        'من به رویکرد جامع به سلامت بدن باور دارم؛ زیبایی و آرامش از درون آغاز می‌شود.',
      text: 'همه‌ی ابعاد سلامت اهمیت دارند و راه‌حل یکسان برای همه وجود ندارد. در مشاوره‌هایم بر رویکردی جامع تأکید می‌کنم که تمام جنبه‌های مراقبت از بدن و پوست شما را در بر می‌گیرد.',
    },
    {
      title: 'فراتر از مراقبت پوست',
      heading:
        'تخصص من بر پوست متمرکز است، اما به سایر جنبه‌های مهم سلامت و ظاهر هم توجه ویژه دارم.',
      text: 'با هم، نه‌تنها نگرانی‌های پوست صورت و بدن، بلکه مسائل مربوط به مراقبت از مو، روتین پوستی و تغذیه مناسب را نیز بررسی می‌کنیم.',
    },
  ]
  return (
    <div className="about-scene text-white!" id="about" ref={section}>
      <section className="about-section">
        <Picture
          desktop="about-bg-d-scaled.webp"
          mobile="about-bg-m.webp"
          className="about-background  "
        />
        <div
          className="about-indicators "
          role="tablist"
          aria-label="رویکرد من"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              className={active === index ? 'active py-4' : 'py-4'}
              role="tab"
              aria-selected={active === index}
              aria-controls="about-story"
              aria-label={slide.title}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (
                  event.key === 'ArrowDown' ||
                  event.key === 'ArrowRight' ||
                  event.key === 'ArrowUp' ||
                  event.key === 'ArrowLeft'
                ) {
                  event.preventDefault()
                  setActive(1 - active)
                }
              }}
            >
              <span />
            </button>
          ))}
        </div>
        <div className="about-story" id="about-story" role="tabpanel">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45 }}
              onAnimationComplete={() =>
                window.dispatchEvent(
                  new CustomEvent('v2:about-slide', {
                    detail: undefined,
                  }),
                )
              }
            >
              <h3 className="eyebrow" data-line-reveal>
                {slides[active].title}
              </h3>
              <div className="fine-line" />
              <h4 data-line-reveal>{slides[active].heading}</h4>
              <p data-line-reveal>{slides[active].text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="about-author">
          <h2 className="about-name   " data-reveal>
            <span>شبنم</span>
            <span>فضلی</span>
          </h2>
          <div
            className="about-portrait  "
            data-parallax
            style={{ clipPath: 'circle(65% at 50% 50%)' }}
          >
            <Image
              src={imagePath('about-img.webp')}
              alt="دکتر شبنم فضلی، پزشک زیبایی"
              fill
              sizes="(max-width: 767px) 214px, 24.479167vw"
              draggable={false}
              className="mix-blend-luminosity"
            />
            {/* <span className="portrait-caption">پوست شما، درک‌شده.</span> */}
          </div>
        </div>
        <div className="about-footer eyebrow">
          <span>رویکردی شخصی به آرامش شما</span>
          <span>علم. مراقبت. تعادل.</span>
        </div>
      </section>
    </div>
  )
}

function HolisticScene() {
  return (
    <section className="holistic-scene" aria-label="نگاهی جامع به سلامت">
      <div className="holistic-sticky">
        <div className="holistic-marquee" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <div className="holistic-marquee-row" key={index}>
              نگاهی جامع به سلامت <Star /> نگاهی جامع به سلامت <Star />
            </div>
          ))}
        </div>
        <div className="holistic-image">
          <Picture
            desktop="service-img-d-1-scaled.webp"
            mobile="service-img-m-1.webp"
            alt="زیبایی طبیعی پوست سالم"
          />
        </div>
        <span className="holistic-caption eyebrow">
          زیبایی از درون آغاز می‌شود
        </span>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section className="services" id="health" aria-label="حوزه‌های تخصصی">
      {services.map((service, index) => (
        <article
          className="service-panel"
          key={service.image}
          style={{ zIndex: index + 1 }}
        >
          <div className="service-image" data-parallax>
            <Picture
              desktop={`service-img-d-${service.image}-scaled.webp`}
              mobile={`service-img-m-${service.image}.webp`}
              alt={service.label}
            />
          </div>
          <div className="service-shade" />
          <div className="service-audience eyebrow">
            <span> مخاطبان در سنین مختلف </span>
            <span>
              جنسیت: <strong>زنان / مردان</strong>
            </span>
          </div>
          <div className="service-main">
            <div className="service-topline">
              <h2 className="eyebrow">{service.label}</h2>
              <span className="eyebrow">( {num(index + 1)} )</span>
            </div>
            <h3 data-reveal>{service.title}</h3>
          </div>
          <div className="service-bottom">
            <span className="service-year">۲۰ سال تجربه</span>
            <div className="service-index">
              <span>{num(index + 1)}</span>
              <span className="index-track">
                <i style={{ width: `${(index + 1) * 20}%` }} />
              </span>
              <span>05</span>
            </div>
            <MagneticLink
              className="service-book"
              label={`رزرو مشاوره ${service.label}`}
            >
              <span>
                رزرو
                <br />
                مشاوره
              </span>
              <ArrowUpLeft size={23} strokeWidth={1.2} />
            </MagneticLink>
          </div>
        </article>
      ))}
    </section>
  )
}

function Process() {
  return (
    <section className="process-section px-2!" id="process">
      <div className="process-intro">
        <p data-reveal data-line-reveal>
          هر مشاوره بر پایه رویکردی جامع بنا شده است؛ نه‌تنها مراقبت از پوست،
          بلکه آرامش عمومی شما را در نظر می‌گیرد.
        </p>
        <span className="eyebrow section-counter">( روند کار )</span>
        <p data-reveal data-line-reveal>
          از نخستین گام‌ها تا پشتیبانی بعدی، هر مرحله برای مراقبتی شخصی و اثربخش
          طراحی شده است.
        </p>
      </div>
      <div dir="ltr" className="process-marquee" aria-label="روند مشاوره">
        <div className="marquee-track" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <span key={index}>
              روند مشاوره <Star />
            </span>
          ))}
        </div>
      </div>
      <div className="process-timeline">
        <div className="timeline-line">
          <div className="timeline-progress" />
        </div>
        <div className="process-flower-wrap">
          <Star className="process-flower" />
        </div>
        {processSteps.map((step, index) => (
          <article
            className={`process-step step-${index + 1}`}
            key={step.title}
            data-reveal
          >
            <span className="step-number">( {num(index + 1)} )</span>
            <div className="step-copy">
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {step.note && (
                <div className="step-note">
                  <span className="eyebrow">مدت زمان</span>
                  <p>{step.note}</p>
                </div>
              )}
              {index === 0 && (
                <a href="#form" className="text-link">
                  از اینجا شروع کنید <ArrowUpLeft size={17} />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
      <div className="process-end">
        <span className="eyebrow">برنامه‌ای روشن. اعتمادی ماندگار.</span>
        {/* <MagneticLink className="outline-book">
          درباره پوستتان حرف بزنیم <ArrowUpLeft size={20} />
        </MagneticLink> */}
      </div>
    </section>
  )
}

function Consultations({ onSelect }: { onSelect: (id: string) => void }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="consultations px-2!" id="online">
      <div className="section-facts eyebrow">
        <span>
          پزشک متخصص<strong>شبنم فضلی</strong>
        </span>
        <span>
          تجربه<strong>۲۰ سال</strong>
        </span>
        <span>
          مشاوره از<strong>۱۵۰ دلار</strong>
        </span>
        <a href="#form">
          مشاوره می‌خواهید؟
          <strong>
            دکمه را لمس کنید <ArrowUpLeft size={15} />
          </strong>
        </a>
      </div>
      <h2 className="consultation-heading " data-word-reveal>
        <span className="heading-line  text-center!">
          <Words text="درمان در" />
        </span>
        <span className="heading-line text-center!">
          <Words text="سلامت پوست شما" />
        </span>
        <span className="heading-line text-center!">
          <Words text="اکنون به‌صورت آنلاین" />
        </span>
        <span className="heading-line text-center!">
          <Words text="در دسترس شماست" />
          <span className="online-dot" />
        </span>
      </h2>
      <div className="consultation-list">
        {consultationTypes.map((type, index) => (
          <article
            className={`consultation-item ${open === index ? 'is-open' : ''}`}
            key={type.id}
          >
            <button
              className="consultation-toggle"
              onClick={() => setOpen(open === index ? null : index)}
              aria-expanded={open === index}
              aria-controls={`consultation-${type.id}`}
            >
              <span className="eyebrow consultation-number">
                ( {num(index + 1)} )
              </span>
              <h3>{type.title}</h3>
              <span className="plus-wrap">
                <Plus size={28} strokeWidth={1} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open === index && (
                <motion.div
                  id={`consultation-${type.id}`}
                  className="consultation-details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onAnimationComplete={refreshLayout}
                >
                  <div className="consultation-details-inner">
                    <div className="consultation-overview">
                      <p>{type.description}</p>
                      <div className="consultation-meta">
                        <span>{type.duration}</span>
                        <span>{type.price}</span>
                      </div>
                      <a
                        href="#form"
                        onClick={() => onSelect(type.id)}
                        className="text-link gold"
                      >
                        انتخاب این مشاوره <ArrowUpLeft size={19} />
                      </a>
                    </div>
                    <div className="consultation-features">
                      {type.details.map((detail) => (
                        <div key={detail.title}>
                          <h4>{detail.title}</h4>
                          <p>{detail.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        ))}
      </div>
    </section>
  )
}

function Specialties({ onSelect }: { onSelect: (id: string) => void }) {
  const topics = [
    {
      title: 'سلامت و محصولات آرایشی',
      tags: [
        'انتخاب محصولات',
        'حساسیت‌ها',
        'تغذیه',
        'زیبایی‌شناسی',
        'سلامت بدن',
      ],
      text: 'زیبایی و سلامت در کنار هم قرار دارند. توصیه‌های تخصصی درباره مراقبت از پوست، تغذیه و مراقبت جامع از خود دریافت کنید.',
      type: 'general',
    },
    {
      title: 'مراقبت از مو',
      tags: ['ترمیم مو', 'سلامت پوست سر', 'زیبایی و سلامت'],
      text: 'موهای قوی و سالم از مراقبت درست آغاز می‌شود. راه‌حل‌هایی برای ترمیم، تغذیه و سلامت بلندمدت مو کشف کنید.',
      type: 'targeted',
    },
    {
      title: 'مراقبت از پوست',
      tags: ['صورت و بدن', 'پوست خشک', 'حساسیت', 'ضد پیری', 'جوش', 'روزاسه'],
      text: 'پوست سالم به مراقبت درست نیاز دارد. خشکی، حساسیت یا جوش — روتین درست همه‌ی تفاوت را ایجاد می‌کند.',
      type: 'general',
    },
  ]
  return (
    <section
      className="specialties"
      aria-label="مراقبت برای هر بخش از وجود شما"
    >
      {topics.map((topic, index) => (
        <article
          className={`specialty-card specialty-${index + 1}`}
          key={topic.title}
        >
          <div className="specialty-top eyebrow">
            <span>رویکردی جامع</span>
            <span>( {num(index + 1)} / 03 )</span>
          </div>
          <h2 data-reveal>{topic.title}</h2>
          <div className="specialty-bottom">
            <div className="specialty-tags">
              {topic.tags.map((tag) => (
                <a href="#form" key={tag} onClick={() => onSelect(topic.type)}>
                  {tag}
                  <ArrowUpLeft size={12} />
                </a>
              ))}
            </div>
            <p>{topic.text}</p>
            <MagneticLink
              onClick={() => onSelect(topic.type)}
              className="specialty-arrow"
              label={`درباره ${topic.title} بپرسید`}
            >
              <ArrowUpLeft strokeWidth={1} />
            </MagneticLink>
          </div>
        </article>
      ))}
    </section>
  )
}

function Clients({ onVideo }: { onVideo: (index: number) => void }) {
  const [active, setActive] = useState(0)
  const current = testimonials[active]
  const go = (direction: number) =>
    setActive((active + direction + testimonials.length) % testimonials.length)
  return (
    <section className="clients" id="clients">
      <div className="clients-cover">
        <Picture
          desktop="review-bg-d.webp"
          mobile="review-bg-m.webp"
          alt="پوستی طبیعی، با اعتماد مراقبت‌شده"
          className="clients-background"
        />
        <h2 className="clients-heading" data-word-reveal>
          <span>
            <Words text="بهره مراجعه کننده" />
          </span>

          <span>
            <Words text="از مشاوره‌ها" />
          </span>
        </h2>
        <span className="clients-cover-label eyebrow">
          آدم‌های واقعی. قصه‌های شخصی.
        </span>
      </div>
      <div className="client-stories">
        <div className="client-selector">
          <span className="eyebrow client-selector-label">
            حرف‌های خودشان، نه من
          </span>
          <div
            className="client-name-list"
            role="tablist"
            aria-label="قصه‌های مراجعان"
          >
            {testimonials.map((review, index) => (
              <button
                id={`review-tab-${index}`}
                role="tab"
                aria-selected={active === index}
                aria-controls="client-story"
                className={active === index ? 'active' : ''}
                key={review.name}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                    event.preventDefault()
                    go(1)
                  }
                  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                    event.preventDefault()
                    go(-1)
                  }
                }}
              >
                <span>{review.name}</span>
                <small>{review.concern}</small>
                <ArrowUpLeft size={16} />
              </button>
            ))}
          </div>
        </div>
        <div className="client-photo-column">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.name}
              className="client-photo"
              initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Image
                src={imagePath(current.image)}
                alt={current.name}
                fill
                sizes="(max-width: 767px) 77vw, (min-width: 768px) and (max-width: 1100px) 33vw, 30vw"
                draggable={false}
              />
              {current.video && (
                <button
                  className="play-story"
                  onClick={() => onVideo(active)}
                  aria-label={`قصه ${current.name} را ببینید`}
                >
                  <Play size={19} fill="currentColor" />
                  <span>دیدن قصه</span>
                </button>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="story-controls">
            <span className="eyebrow">
              {num(active + 1)} <i>/ {testimonials.length}</i>
            </span>
            <div>
              <button onClick={() => go(-1)} aria-label="قصه قبلی">
                <ArrowRight size={20} strokeWidth={1.4} />
              </button>
              <button onClick={() => go(1)} aria-label="قصه بعدی">
                <ArrowLeft size={20} strokeWidth={1.4} />
              </button>
            </div>
          </div>
        </div>
        <div
          className="client-quote-wrap"
          id="client-story"
          role="tabpanel"
          aria-labelledby={`review-tab-${active}`}
          aria-live="polite"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.blockquote
              key={current.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <span className="quote-symbol">“</span>
              <h3>{current.quote}</h3>
              <p>{current.text}</p>
              <footer>
                <strong>{current.name}</strong>
                <span>{current.concern}</span>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
      </div>
      <p className="results-note">
        تجربه‌های شخصیِ نقل‌شده از مراجعان. نتیجه از فردی به فرد دیگر متفاوت
        است.
      </p>
    </section>
  )
}

function Availability() {
  const features = [
    {
      title: 'عوامل محلی',
      text: 'آب‌وهوا، محیط و سبک زندگی محلی شما بخشی از تصویر بزرگ‌تر هستند. مراقبت شما هم باید چنین باشد.',
    },
    {
      title: 'دسترسی به محصولات',
      text: 'توصیه‌هایی درباره محصولات و روش‌هایی که واقعاً در کشور شما در دسترس هستند.',
    },
    {
      title: 'زمان‌بندی منعطف',
      text: 'برنامه‌ای که با مناطق زمانی مختلف سازگار است و یافتن زمان مناسب را آسان می‌کند.',
    },
    {
      title: 'تطبیق روتین',
      text: 'راهنمایی برای تنظیم روتین پوستی وقتی آب‌وهوا، منطقه زمانی یا شرایط زندگی‌تان تغییر می‌کند.',
    },
  ]
  return (
    <section className="availability" id="availability">
      <div className="availability-top eyebrow">
        <span>مراقبت بدون مرز</span>
        <Globe2 size={20} strokeWidth={1} />
        <span>آنلاین. سراسر دنیا.</span>
      </div>
      <h2 className="availability-heading" data-word-reveal>
        <Words text="مشاوره شخصی‌سازی‌شده به زبان مادری شما، در هر نقطه از دنیا که باشید؛ با وضوح و آرامش در هر گفت‌وگو." />
      </h2>
      <div className="availability-features">
        {features.map((feature, index) => (
          <article key={feature.title} data-reveal>
            <span className="eyebrow">( {num(index + 1)} )</span>
            <h3>{feature.title}</h3>
            <p className="text-[--v2-ink]">{feature.text}</p>
          </article>
        ))}
      </div>
      <div className="map-panel">
        <Image
          className="map-image"
          src={imagePath('map.webp')}
          alt="نقشه جهان نشان‌دهنده مشاوره‌های آنلاین بین‌المللی"
          fill
          sizes="(max-width: 767px) 90vw, 98vw"
          draggable={false}
        />
        <span className="map-point point-europe">
          <i />
          <span>اروپا</span>
        </span>
        <span className="map-point point-america">
          <i />
          <span>آمریکای شمالی</span>
        </span>
        <span className="map-point point-asia">
          <i />
          <span>آسیا</span>
        </span>
        <span className="map-point point-australia">
          <i />
          <span>استرالیا</span>
        </span>
        <div className="map-caption">
          <span className="availability-status">
            <i />
            آماده مشاوره‌های آنلاین
          </span>
        </div>
      </div>
      <div className="global-copy">
        <h3 data-reveal>
          رویکردی جهانی به زیبایی،
          <br />
          متناسب با مکان زندگی
          <br />و سبک شما.
        </h3>
        <div>
          <p>
            مراجعانی از سراسر دنیا از تجربه من بهره می‌گیرند. من با بازار
            محصولات در قاره‌های مختلف — ژاپن، کره، اروپا و آمریکا — آشنا هستم و
            می‌دانم روش‌های موجود در هر منطقه متفاوت است و باید با نیازهای پوستی
            هر منطقه تطبیق یابد.
          </p>
          <a href="#form" className="text-link">
            رویکرد شخصی خود را بیابید <ArrowUpLeft size={19} />
          </a>
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="faq-section" id="faq">
      <div className="faq-heading">
        <h2 data-reveal data-line-reveal>
          خوب است بدانید
        </h2>
        <span className="eyebrow">پرسش‌ها و پاسخ‌ها</span>
      </div>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <article
            className={`faq-item ${open === index ? 'is-open' : ''}`}
            key={faq.question}
          >
            <button
              aria-expanded={open === index}
              aria-controls={`faq-answer-${index}`}
              onClick={() => setOpen(open === index ? null : index)}
            >
              <span className="faq-number eyebrow">( {num(index + 1)} )</span>
              <h3>{faq.question}</h3>
              <span className="faq-plus">
                <Plus size={25} strokeWidth={1.2} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open === index && (
                <motion.div
                  className="faq-answer"
                  id={`faq-answer-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  onAnimationComplete={refreshLayout}
                >
                  <p>{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        ))}
      </div>
      <div className="faq-bottom">
        <span>هنوز سوالی در ذهن دارید؟</span>
        <a className="text-link" href="#form">
          گفت‌وگو کنیم <ArrowUpLeft size={18} />
        </a>
      </div>
    </section>
  )
}

function Modal({
  children,
  onClose,
  label,
  video = false,
}: {
  children: ReactNode
  onClose: () => void
  label: string
  video?: boolean
}) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.dispatchEvent(new CustomEvent('scroll:lock', { detail: true }))
    panel.current?.querySelector<HTMLElement>('button')?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const elements = panel.current?.querySelectorAll<HTMLElement>(
          'button, a[href], input, [tabindex="0"]',
        )
        if (!elements?.length) return
        const first = elements[0]
        const last = elements[elements.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.dispatchEvent(new CustomEvent('scroll:lock', { detail: false }))
      document.removeEventListener('keydown', keydown)
      previousFocus?.focus({ preventScroll: true })
    }
  }, [onClose])
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`modal-panel ${video ? 'video-modal' : ''}`}
        data-lenis-prevent
        onClick={(event) => event.stopPropagation()}
        initial={{ y: 30, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.97 }}
        transition={{ duration: 0.3 }}
      >
        <button
          className="modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={23} strokeWidth={1.5} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  )
}

export function ShaninaSite() {
  const [selectedType, setSelectedType] = useState('general')
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [videoIndex, setVideoIndex] = useState<number | null>(null)
  const closePrivacy = useCallback(() => setPrivacyOpen(false), [])
  const closeVideo = useCallback(() => setVideoIndex(null), [])
  return (
    <ShaninaShell>
      <MotionSystem>
        <a className="skip-link" href="#main">
          پرش به محتوا
        </a>
        <Header />
        <main>
          <Hero />
          <About />
          <HolisticScene />
          <Services />
          <Process />
          {/* <Consultations onSelect={setSelectedType} /> */}
          <Specialties onSelect={setSelectedType} />
          <Clients onVideo={setVideoIndex} />
          <Availability />
          <FAQ />
          <section className="booking-section" id="form">
            <div className="booking-intro">
              <div className="booking-image" data-parallax>
                <Image
                  src={imagePath('form-img.webp')}
                  alt="دکتر شبنم فضلی شما را به مشاوره شخصی پوست خوش آمد می‌گوید"
                  fill
                  sizes="(max-width: 767px) 100vw, 45vw"
                  draggable={false}
                />
                <div className="booking-image-caption ">
                  <span className="eyebrow">پزشک متخصص</span>
                  <span>شبنم فضلی</span>
                  <Star />
                </div>
              </div>
              <div className="booking-title-wrap">
                <span className="eyebrow">
                  سفر به سالم‌ترین پوست خود را آغاز کنید
                </span>
                <h2 data-reveal data-line-reveal>
                  پوست سالم از
                  <br />
                  یک گفت‌وگو آغاز می‌شود.
                </h2>
                <p>
                  برای مشاوره ثبت‌نام کنید و در هرجای دنیا که هستید، مراقبت
                  حرفه‌ای و شخصی از پوست دریافت کنید.
                </p>
                <span className="booking-availability">
                  <span />
                  مشاوره‌های آنلاین فعال است
                </span>
              </div>
            </div>
            <div className="booking-content">
              <div className="booking-side-note">
                <span className="eyebrow">رزرو مشاوره</span>
                <p>
                  کمی درباره پوستتان.
                  <br />
                  نهایت مراقبت از من.
                </p>
                <ArrowDown size={32} strokeWidth={1} />
                <span className="booking-detail">
                  مکان زندگی، بودجه و اهداف شما.
                  <br />
                  هر جزئیات مهم است.
                </span>
              </div>
              <BookingForm
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                onPrivacy={() => setPrivacyOpen(true)}
              />
            </div>
          </section>
        </main>
        <footer className="site-footer">
          <div className="footer-top">
            <a href="#main" className="eyebrow" data-stagger-link>
              <span data-stagger-text>بازگشت به آغاز</span>{' '}
              <ArrowUpLeft size={17} />
            </a>
            <span>مراقبت تخصصی از پوست و زیبایی شما.</span>
            <a href="#form" className="eyebrow" data-stagger-link>
              <span data-stagger-text>شروع کنیم</span> <ArrowUpLeft size={17} />
            </a>
          </div>
          <a
            href="#main"
            className="footer-wordmark"
            aria-label="دکتر شبنم فضلی، بازگشت به بالا"
          >
            دکتر شبنم فضلی
          </a>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} دکتر شبنم فضلی</span>
            <span>با دقت ساخته شده. الهام‌گرفته از طبیعت.</span>
            <button type="button" onClick={() => setPrivacyOpen(true)}>
              توضیحات حریم خصوصی <ArrowUpLeft size={13} />
            </button>
          </div>
        </footer>
        <AnimatePresence>
          {privacyOpen && (
            <Modal label="توضیحات حریم خصوصی" onClose={closePrivacy}>
              <span className="eyebrow">
                اطلاعات شما، با دقت نگهداری می‌شود
              </span>
              <h2>توضیحات حریم خصوصی</h2>
              <p>
                این وب‌سایت نسخه‌ای نمایشی از تجربه دکتر شبنم فضلی است و به مطب
                اصلی متصل نیست.
              </p>
              <h3>چه چیزی ذخیره می‌شود</h3>
              <p>
                هنگام ارسال فرم، نام، ایمیل، شماره تماس اختیاری، مکان، نوع
                مشاوره و پیام شما فقط به‌عنوان درخواست مشاوره در این برنامه
                ذخیره می‌شود.
              </p>
              <h3>حق انتخاب شما</h3>
              <p>
                تنها نام، ایمیل، نوع مشاوره و رضایت شما الزامی است. لطفاً پرونده
                پزشکی، نتیجه آزمایش یا اطلاعات حساس سلامتی وارد نکنید. می‌توانید
                فرم را ارسال نکنید.
              </p>
              <h3>بدون نوبت‌دهی یا پرداخت خودکار</h3>
              <p>
                ارسال درخواست، نوبتی رزرو نمی‌کند، ایمیلی ارسال نمی‌کند و
                پرداختی انجام نمی‌دهد. داده‌های شما به دکتر فضلی یا وب‌سایت اصلی
                ارسال نمی‌شود.
              </p>
              <button className="outline-book" onClick={closePrivacy}>
                متوجه شدم <Check size={17} />
              </button>
            </Modal>
          )}
          {videoIndex !== null && testimonials[videoIndex].video && (
            <Modal
              label={`قصه ${testimonials[videoIndex].name}`}
              onClose={closeVideo}
              video
            >
              <iframe
                src={`${testimonials[videoIndex].video}&autoplay=1&dnt=1`}
                title={`قصه پوستی ${testimonials[videoIndex].name}`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
              <div className="video-caption">
                <span>
                  {testimonials[videoIndex].name} —{' '}
                  {testimonials[videoIndex].concern}
                </span>
                <a
                  href={testimonials[videoIndex].video}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  باز کردن ویدیو <ArrowUpLeft size={15} />
                </a>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </MotionSystem>
    </ShaninaShell>
  )
}
