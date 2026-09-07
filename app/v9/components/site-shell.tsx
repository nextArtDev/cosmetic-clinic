'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BookingProvider, useBooking } from './booking-provider'
import { Arrow } from './visuals'
import { clinicAddress, mapUrl, treatments, whatsappUrl } from '../lib/content'

const telHref = 'tel:+982122334455'
const telLabel = '۰۲۱ ۲۲ ۳۳ ۴۴ ۵۵'

function SmoothScrolling() {
  const pathname = usePathname()
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.7, anchors: { offset: -88 } })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    const modal = (event: Event) => {
      if ((event as CustomEvent<boolean>).detail) lenis.stop()
      else lenis.start()
    }
    window.addEventListener('v9:modal', modal)
    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('v9:modal', modal)
      lenis.destroy()
    }
  }, [pathname])
  return null
}

function Navigation() {
  const { openBooking } = useBooking()
  const pathname = usePathname()
  const [megaOpen, setMegaOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileTreatments, setMobileTreatments] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    let last = window.scrollY
    const scroll = () => {
      const next = window.scrollY
      setScrolled(next > 20)
      if (Math.abs(next - last) > 5) {
        setHidden(next > last && next > 180)
        last = next
      }
      if (next < 160) setHidden(false)
    }
    window.addEventListener('scroll', scroll, { passive: true })
    return () => window.removeEventListener('scroll', scroll)
  }, [])
  // Reset menus when the route changes (React docs: "adjusting state on
  // prop change" pattern — render-time reset, no cascading effect).
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setMegaOpen(false)
    setMobileOpen(false)
    setMobileTreatments(false)
    setHidden(false)
  }
  useEffect(() => {
    if (!megaOpen) return
    const close = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMegaOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [megaOpen])
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 992px)')
    const update = () => {
      if (desktop.matches) setMobileOpen(false)
    }
    desktop.addEventListener('change', update)
    return () => desktop.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.documentElement.style.overflow
    const background = Array.from(
      document.querySelectorAll<HTMLElement>('#main-content, .site-footer, .floating-contact'),
    )
    const previousInert = background.map((element) => element.inert)
    background.forEach((element) => {
      element.inert = true
    })
    document.documentElement.style.overflow = 'hidden'
    window.dispatchEvent(new CustomEvent('v9:modal', { detail: true }))
    return () => {
      document.documentElement.style.overflow = previous
      background.forEach((element, index) => {
        element.inert = previousInert[index]
      })
      window.dispatchEvent(new CustomEvent('v9:modal', { detail: false }))
    }
  }, [mobileOpen])
  const closeMenu = () => {
    setMegaOpen(false)
    setMobileOpen(false)
  }
  return (
    <motion.header
      ref={headerRef}
      className={`site-header ${scrolled ? 'is-scrolled' : ''}`}
      initial={false}
      animate={{ y: hidden && !megaOpen && !mobileOpen ? '-110%' : '0%' }}
      transition={{ duration: hidden ? 0.45 : 0.65, ease: [0.22, 1, 0.36, 1] }}
      onMouseLeave={() => setMegaOpen(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          const selector = mobileOpen ? '.mobile-toggle' : '.treatments-toggle'
          closeMenu()
          headerRef.current?.querySelector<HTMLButtonElement>(selector)?.focus()
        }
        if (event.key === 'Tab' && mobileOpen) {
          const focusable = Array.from(
            headerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
          ).filter((element) => element.offsetParent !== null)
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last?.focus()
          }
          if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first?.focus()
          }
        }
      }}
    >
      <a className="skip-link" href="#main-content" onClick={closeMenu}>
        پرش به محتوا
      </a>
      <div className="nav-inner">
        <Link className="brand" href="/v9" onClick={closeMenu} aria-label="کلینیک دکتر سپیده نادری — صفحه اصلی">
          <span className="brand-name">دکتر سپیده نادری</span>
          <span className="brand-sub">کلینیک دندانپزشکی</span>
        </Link>
        <nav className="desktop-nav" aria-label="ناوبری اصلی">
          <button
            type="button"
            className={`nav-link treatments-toggle ${megaOpen ? 'active' : ''}`}
            aria-expanded={megaOpen}
            aria-controls="treatments-menu"
            onMouseEnter={() => setMegaOpen(true)}
            onClick={() => setMegaOpen(!megaOpen)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setMegaOpen(true)
                window.setTimeout(
                  () => document.querySelector<HTMLAnchorElement>('#treatments-menu a')?.focus(),
                  50,
                )
              }
            }}
          >
            خدمات{' '}
            <svg
              width="10"
              height="7"
              viewBox="0 0 10 7"
              fill="none"
              className={megaOpen ? 'chevron open' : 'chevron'}
              aria-hidden="true"
            >
              <path d="m1 1 4 4 4-4" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
          <Link className="nav-link" href="/v9/clinic" onMouseEnter={() => setMegaOpen(false)} onClick={closeMenu}>
            کلینیک
          </Link>
          <Link
            className="nav-link"
            href="/v9/clinic#doctor"
            onMouseEnter={() => setMegaOpen(false)}
            onClick={closeMenu}
          >
            دکتر سپیده نادری
          </Link>
        </nav>
        <button
          className="nav-cta"
          type="button"
          onClick={() => {
            closeMenu()
            openBooking()
          }}
        >
          نوبت خود را رزرو کنید
        </button>
        <button
          className={`mobile-toggle ${mobileOpen ? 'is-open' : ''}`}
          type="button"
          aria-label={mobileOpen ? 'بستن منو' : 'باز کردن منو'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <AnimatePresence>
        {megaOpen && (
          <motion.div
            id="treatments-menu"
            className="mega-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 246, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mega-inner">
              <div className="mega-links">
                {treatments.map((item, index) => (
                  <Link
                    key={item.slug}
                    href={`/v9/treatments/${item.slug}`}
                    className={index === active ? 'is-active' : ''}
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={closeMenu}
                  >
                    {item.shortTitle}
                    <Arrow diagonal />
                  </Link>
                ))}
              </div>
              <div className="mega-preview">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    className="mega-preview-content"
                    key={active}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={treatments[active].image} alt="" />
                    <p>{treatments[active].preview}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mega-glow" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-menu"
            className="mobile-menu"
            data-lenis-prevent
            aria-label="ناوبری موبایل"
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mobile-menu-links">
              <button
                type="button"
                className="mobile-main-link"
                aria-expanded={mobileTreatments}
                onClick={() => setMobileTreatments(!mobileTreatments)}
              >
                خدمات <span>{mobileTreatments ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {mobileTreatments && (
                  <motion.div
                    className="mobile-treatment-links"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {treatments.map((item) => (
                      <Link key={item.slug} href={`/v9/treatments/${item.slug}`} onClick={closeMenu}>
                        {item.shortTitle}
                        <Arrow diagonal />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <Link className="mobile-main-link" href="/v9/clinic" onClick={closeMenu}>
                کلینیک <Arrow diagonal />
              </Link>
              <Link className="mobile-main-link" href="/v9/clinic#doctor" onClick={closeMenu}>
                دکتر سپیده نادری <Arrow diagonal />
              </Link>
            </div>
            <div className="mobile-menu-bottom">
              <p>
                مراقبتی که زیبایی یکتای
                <br /> شما را برجسته می‌کند.
              </p>
              <button
                type="button"
                className="solid-button"
                onClick={() => {
                  closeMenu()
                  window.setTimeout(() => openBooking(), 50)
                }}
              >
                نوبت خود را رزرو کنید <Arrow diagonal />
              </button>
              <span>تهران، خیابان ولیعصر</span>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link href="/v9" className="footer-brand" aria-label="کلینیک دکتر سپیده نادری — صفحه اصلی">
          <span className="brand-name">دکتر سپیده نادری</span>
          <span className="brand-sub">کلینیک دندانپزشکی</span>
        </Link>
        <div className="footer-columns">
          <div className="footer-links">
            <h3>دندانپزشکی</h3>
            {treatments.slice(0, 3).map((item) => (
              <Link key={item.slug} href={`/v9/treatments/${item.slug}`}>
                {item.shortTitle}
              </Link>
            ))}
            <h3>پیشگیری</h3>
            <Link href="/v9/treatments/tandorosti-dehan#scaling">جرم‌گیری</Link>
            <Link href="/v9/treatments/tandorosti-dehan#checkup">معاینه دوره‌ای</Link>
          </div>
          <div className="footer-links">
            <h3>تخصصی</h3>
            <Link href="/v9/treatments/dandan#root-canal">درمان ریشه</Link>
            <Link href="/v9/treatments/dandan#implant">ایمپلنت</Link>
            <Link href="/v9/treatments/dandan#gum">درمان لثه</Link>
            <Link href="/v9/treatments/fanavari-ha">فناوری‌ها</Link>
          </div>
          <div className="footer-medical">
            <h3>دکتر سپیده نادری</h3>
            <p>نظام پزشکی ۱۴۲۸۲۰ · پروانه مطب ۴۲۰۹۳</p>
            <h3>مسئول کلینیک</h3>
            <p>
              سپیده نادری
              <br />
              دندانپزشک — نظام پزشکی ۱۴۲۸۲۰
            </p>
          </div>
          <div className="footer-location">
            <h3>کلینیک</h3>
            <a href={mapUrl} target="_blank" rel="noreferrer">
              خیابان ولیعصر، پلاک ۲۹۱
              <br />
              واحدهای ۴۰۱ تا ۴۰۴
              <br />
              برج پزشکان ونک — طبقه ۴
              <br />
              میدان ونک · تهران <Arrow diagonal />
            </a>
            <a className="footer-phone" href={telHref}>
              {telLabel}
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} کلینیک دندانپزشکی دکتر سپیده نادری</p>
          <Link href="/v9/privacy">حریم خصوصی</Link>
          <a className="back-top" href="#top">
            بازگشت به بالا ↑
          </a>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="اینستاگرام">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v9/images/instagram.svg" alt="" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="یوتیوب">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v9/images/youtube.svg" alt="" />
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="واتس‌اپ">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v9/images/whatsapp.svg" alt="" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FloatingContact() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const scroll = () => setVisible(window.scrollY > window.innerHeight * 0.85)
    window.addEventListener('scroll', scroll, { passive: true })
    scroll()
    return () => window.removeEventListener('scroll', scroll)
  }, [])
  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="floating-contact"
          aria-label="گفت‌وگو با کلینیک در واتس‌اپ"
          initial={{ x: -90, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -90, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v9/images/whatsapp.svg" alt="" width="24" height="24" />
          <span>گفتگو</span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <BookingProvider>
        <SmoothScrolling />
        <div id="top">
          <Navigation />
          {children}
          <Footer />
          <FloatingContact />
        </div>
      </BookingProvider>
    </MotionConfig>
  )
}

export { clinicAddress }
