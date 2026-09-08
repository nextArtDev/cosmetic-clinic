'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { navItems } from '../lib/content'
import { ArrowIcon, ease } from './motion-primitives'

/**
 * Marks <html> with data-v3-active while any /v3 page is mounted. The
 * attribute gates every html/body-level rule in v3/globals.css, so those
 * styles exist only while a /v3 route is on screen and are gone the moment
 * the user navigates away. Same isolation pattern as /v2 (ShaninaShell).
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cookieOpen, setCookieOpen] = useState(false)
  const [preferences, setPreferences] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [lightHeader, setLightHeader] = useState(pathname === '/v3')
  const [consentSaved, setConsentSaved] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const cookieRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v3-active', '')
    const lenis = new Lenis({ autoRaf: true, lerp: 0.085, smoothWheel: true, anchors: { offset: -80 }, allowNestedScroll: true })
    lenisRef.current = lenis
    const consentFrame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem('v3-studio-consent')
        if (saved) { setConsentSaved(true); setAnalytics(Boolean(JSON.parse(saved).analytics)) }
      } catch { /* Preferences are optional when storage is unavailable. */ }
    })
    return () => {
      html.removeAttribute('data-v3-active')
      lenis.destroy()
      cancelAnimationFrame(consentFrame)
      window.scrollTo(0, 0)
    }
  }, [])

  useEffect(() => {
    const update = () => {
      const sections = document.querySelectorAll('[data-header-theme="light"]')
      setLightHeader(Array.from(sections).some((section) => {
        const rect = section.getBoundingClientRect()
        return rect.top <= 35 && rect.bottom > 35
      }))
    }
    const frame = requestAnimationFrame(() => {
      setMenuOpen(false)
      setLightHeader(pathname === '/v3')
      update()
    })
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
    }
  }, [pathname])

  useEffect(() => {
    if (!menuOpen && !cookieOpen) return
    const focused = document.activeElement as HTMLElement | null
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    lenisRef.current?.stop()
    const panel = menuOpen ? menuRef.current : cookieRef.current
    const frame = requestAnimationFrame(() => panel?.querySelector<HTMLElement>('button, a, input')?.focus())
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); setCookieOpen(false) }
      if (event.key !== 'Tab' || !panel) return
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]')).filter(el => el.getClientRects().length > 0)
      const first = focusables[0]; const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = oldOverflow
      lenisRef.current?.start()
      document.removeEventListener('keydown', keydown)
      focused?.focus({ preventScroll: true })
    }
  }, [menuOpen, cookieOpen])

  function saveConsent(allow: boolean) {
    try { localStorage.setItem('v3-studio-consent', JSON.stringify({ necessary: true, analytics: allow, savedAt: new Date().toISOString() })) } catch { /* Keep the current-session preference. */ }
    setAnalytics(allow); setConsentSaved(true); setCookieOpen(false)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="v3" lang="fa" dir="rtl">
        <a className="skip-link" href="#v3-main-content">پرش به محتوا</a>
        <header className={`site-header ${lightHeader ? 'is-light' : ''} ${menuOpen ? 'is-obscured' : ''}`}>
          <Link href="/v3" className="site-logo" aria-label="کلینیک دکتر شبنم فضلی — صفحه اصلی"><span className="wordmark">دکتر شبنم فضلی</span></Link>
          <button className="menu-toggle" onClick={() => { setCookieOpen(false); setMenuOpen(true) }} aria-expanded={menuOpen} aria-controls="v3-main-navigation"><span>منو</span><span className="menu-toggle-line" /></button>
        </header>

        {children}

        <Link href="/v3/#nazarat" className="awards-ribbon" aria-label="دیدن نظرات مراجعان"><strong>۵</strong><span>رضایت مراجعان</span></Link>
        <button className="consent-trigger" onClick={() => { setMenuOpen(false); setCookieOpen(true) }} aria-label="مدیریت رضایت و کوکی‌ها"><span className={`consent-dot ${consentSaved ? 'is-saved' : ''}`} />مدیریت رضایت</button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div id="v3-main-navigation" ref={menuRef} className="navigation-overlay" role="dialog" aria-modal="true" aria-label="ناوبری اصلی" data-lenis-prevent initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: reduce ? 0.01 : 0.7, ease }}>
              <button className="menu-close" onClick={() => setMenuOpen(false)} aria-label="بستن منو"><span /><span /></button>
              <div className="navigation-aside"><p className="eyebrow">کلینیک تخصصی جراحی پلاستیک،<br />زیبایی و ترمیمی</p><a className="text-link" href="mailto:clinic@drshabnamfazli.com">clinic@drshabnamfazli.com</a><span>تهران · شنبه تا پنجشنبه</span></div>
              <nav aria-label="ناوبری اصلی">
                {navItems.map((item, index) => (
                  <motion.div className="nav-item-wrap" key={item.href} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: reduce ? 0 : 0.18 + index * 0.07, ease }}>
                    <Link className={pathname === item.href ? 'is-current' : ''} href={item.href} onClick={() => setMenuOpen(false)}><span>{item.label}</span><ArrowIcon diagonal /></Link>
                  </motion.div>
                ))}
              </nav>
              <div className="navigation-bottom"><span>دکتر شبنم فضلی</span><div><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">اینستاگرام ↗</a><a href="tel:02128424567">۰۲۱ ۲۸۴۲ ۴۵۶۷</a></div></div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {cookieOpen && <motion.div className="cookie-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(event) => { if (event.target === event.currentTarget) setCookieOpen(false) }}>
            <motion.div className="cookie-panel" ref={cookieRef} role="dialog" aria-modal="true" aria-labelledby="v3-cookie-title" data-lenis-prevent initial={{ y: 35 }} animate={{ y: 0 }} exit={{ y: 35 }} transition={{ duration: 0.35, ease }}>
              <div className="cookie-header"><span className="wordmark">دکتر شبنم فضلی</span><h2 id="v3-cookie-title">مدیریت رضایت</h2><button onClick={() => setCookieOpen(false)} aria-label="بستن تنظیمات"><span aria-hidden="true">×</span></button></div>
              <p>حریم خصوصی شما مهم است. این نسخه فقط از امکانات لازم برای ناوبری و پاسخ به درخواست شما استفاده می‌کند و هیچ سرویس ردیابی تبلیغاتی بارگذاری نمی‌شود.</p>
              <AnimatePresence>{preferences && <motion.div className="cookie-preferences" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div><span>کارکردی <small>همیشه فعال</small></span><span className="cookie-check">✓</span></div>
                <label><span>سنجش بازدید <small>ترجیح ذخیره می‌شود، بدون ردیابی فعال</small></span><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /></label>
              </motion.div>}</AnimatePresence>
              <div className="cookie-actions"><button className="cookie-accept" onClick={() => saveConsent(true)}>می‌پذیرم</button><button onClick={() => saveConsent(false)}>نمی‌پذیرم</button>{preferences ? <button onClick={() => saveConsent(analytics)}>ذخیره</button> : <button onClick={() => setPreferences(true)}>تنظیمات</button>}</div>
              <div className="cookie-legal"><Link href="/v3/mogharrarat" onClick={() => setCookieOpen(false)}>مقررات قانونی</Link><Link href="/v3/mahramiat" onClick={() => setCookieOpen(false)}>حریم خصوصی</Link></div>
            </motion.div>
          </motion.div>}
        </AnimatePresence>

        <Footer />
      </div>
    </MotionConfig>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand"><Link href="/v3" aria-label="بازگشت به صفحه اصلی"><span className="wordmark">دکتر شبنم فضلی</span></Link><p>کلینیک تخصصی جراحی پلاستیک، زیبایی و ترمیمی؛ جراحی بینی، فیس‌لیفت، لیپوساکشن و پروتز با رویکردی طبیعی و امن.</p><div className="footer-socials"><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">اینستاگرام ↗</a><a href="https://t.me/" target="_blank" rel="noreferrer">تلگرام ↗</a></div></div>
        <nav className="footer-nav" aria-label="خدمات کلینیک"><p className="eyebrow">خدمات</p><Link href="/v3/ravesh">روند درمان</Link><Link href="/v3/khadamat">خدمات ما</Link><Link href="/v3/takhasosha">تخصص‌ها</Link><Link href="/v3/navahi">نواحی درمان</Link></nav>
        <nav className="footer-nav" aria-label="درباره کلینیک"><p className="eyebrow">کلینیک</p><Link href="/v3/nemune-karha">نمونه‌کارها</Link><Link href="/v3/darbare-ma">درباره دکتر</Link><Link href="/v3/bayan">فلسفه ما</Link><Link href="/v3/tamas">تماس با ما</Link></nav>
        <div className="footer-contact"><p className="eyebrow">نوبت‌دهی آنلاین</p><Link href="/v3/tamas" className="footer-call">رزرو نوبت <ArrowIcon /></Link><p>پاسخ‌گویی کمتر از ۲۴ ساعت — بدون تعهد</p><a className="text-link" href="mailto:clinic@drshabnamfazli.com">clinic@drshabnamfazli.com</a><a className="text-link" href="tel:02128424567">۰۲۱ ۲۸۴۲ ۴۵۶۷</a></div>
      </div>
      <div className="footer-bottom"><span>© ۱۴۰۴ کلینیک دکتر شبنم فضلی</span><div><Link href="/v3/mogharrarat">مقررات قانونی</Link><Link href="/v3/mahramiat">حریم خصوصی</Link><Link href="/v3/sharaet">شرایط استفاده</Link></div><button onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>بازگشت به بالا <span aria-hidden="true">↑</span></button></div>
    </footer>
  )
}
