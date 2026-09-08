'use client'

import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'
import { Hero } from './hero'
import { About, Benefits, WithYou, Beauty } from './story'
import { HowToUse, TwoTouches, FilmSection, Specifications } from './product-sections'
import { UseCases, Shopping, Reviews, Kit, PartnerAndFooter } from './lower-sections'
import { SiteOverlay, type Overlay } from './overlays'

/**
 * /v8 site shell — Clingr port orchestrator (navbar logic, floating CTA,
 * cookie notice, overlay state, Lenis smooth scroll). Everything renders
 * inside the .v8 subtree carried by V8Shell, so no shared production
 * chrome is involved. Lenis instance is created per mount and destroyed
 * on unmount, exactly like the source site.
 */
export default function ClinicSite() {
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const [cookieNotice, setCookieNotice] = useState(false)
  const [floatingBuy, setFloatingBuy] = useState(false)
  const [reviewRefresh, setReviewRefresh] = useState(0)
  const lenis = useRef<Lenis | null>(null)
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()

  useEffect(() => {
    if (reduced) return
    const scroller = new Lenis({
      autoRaf: true,
      duration: 1.15,
      smoothWheel: true,
      syncTouch: false,
      anchors: { offset: 24 },
      prevent: node => node.tagName === 'DIALOG',
    })
    lenis.current = scroller
    return () => {
      scroller.destroy()
      lenis.current = null
    }
  }, [reduced])

  useEffect(() => {
    if (overlay) lenis.current?.stop()
    else lenis.current?.start()
  }, [overlay, reduced])

  useEffect(() => {
    // Deferred like the v5 CookieConsent port: reading localStorage inside
    // the timeout keeps the first paint static and avoids a sync setState
    // cascade flagged by react-hooks/set-state-in-effect.
    const timer = window.setTimeout(() => {
      try {
        setCookieNotice(localStorage.getItem('v8-cookie-notice') !== 'dismissed')
      } catch {
        setCookieNotice(true)
      }
    }, 100)
    return () => window.clearTimeout(timer)
  }, [])

  useMotionValueEvent(scrollY, 'change', value =>
    setFloatingBuy(value > window.innerHeight * 0.85),
  )

  function navigate(id: string) {
    setOverlay(null)
    window.setTimeout(() => {
      const target = document.getElementById(id)
      if (!target) return
      if (lenis.current) lenis.current.scrollTo(target, { duration: 1.25, offset: 0 })
      else target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
      window.history.replaceState(null, '', `#${id}`)
    }, 380)
  }

  function dismissCookie() {
    setCookieNotice(false)
    try {
      localStorage.setItem('v8-cookie-notice', 'dismissed')
    } catch {
      /* Storage is optional. */
    }
  }

  const openShop = () => setOverlay('shop')
  const openVideo = () => setOverlay('video')

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#about">
        پرش به محتوا
      </a>
      <main lang="fa-IR" className="v8-site">
        <Hero onMenu={() => setOverlay('menu')} onBuy={openShop} onVideo={openVideo} />
        <About />
        <Benefits />
        <WithYou />
        <Beauty onVideo={openVideo} />
        <HowToUse />
        <TwoTouches />
        <FilmSection onVideo={openVideo} />
        <Specifications />
        <UseCases />
        <Shopping onShop={openShop} onProduct={mini => setOverlay(mini ? 'product-mini' : 'product-original')} />
        <Reviews onReview={() => setOverlay('review')} refresh={reviewRefresh} />
        <Kit />
        <PartnerAndFooter
          onPartner={() => setOverlay('partner')}
          onPrivacy={() => setOverlay('privacy')}
          onShop={openShop}
        />
      </main>
      <AnimatePresence>
        {floatingBuy && !overlay && (
          <motion.button
            className="floating-buy"
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            onClick={openShop}
            aria-label="دریافت نوبت در کلینیک قلب مهر"
          >
            <ShoppingBag size={21} strokeWidth={1.1} />
            <span>نوبت</span>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {cookieNotice && !overlay && (
          <motion.aside
            className="cookie-notice"
            aria-label="اطلاعیه کوکی"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span>
              این وب‌سایت از کوکی‌های{' '}
              <button onClick={() => setOverlay('privacy')}>محلی</button> استفاده می‌کند.
            </span>
            <button
              className="cookie-dismiss"
              aria-label="بستن اطلاعیه"
              onClick={dismissCookie}
            >
              <X size={12} strokeWidth={1.3} />
            </button>
          </motion.aside>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {overlay && (
          <SiteOverlay
            key={overlay}
            kind={overlay}
            onClose={() => setOverlay(null)}
            onNavigate={navigate}
            onShop={openShop}
            onReviewSaved={() => setReviewRefresh(value => value + 1)}
          />
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
