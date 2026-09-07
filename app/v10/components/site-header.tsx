'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpLeft } from 'lucide-react'
import { useCart } from './cart-provider'
import { BagIcon, Flower, Wordmark } from './ui'
import { clinic } from '../lib/content'

/** هدر شناور — رنگ متن بر اساس بخش روشن/تاریک زیرش عوض می‌شود. */
export function SiteHeader() {
  const [menu, setMenu] = useState(false)
  const [light, setLight] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { items, setDialog } = useCart()
  const menuRef = useRef<HTMLDivElement>(null)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const root = document.getElementById('v10-site-content')
        const sections = Array.from(root?.querySelectorAll<HTMLElement>('[data-theme]') ?? [])
        const active = sections.find((section) => { const rect = section.getBoundingClientRect(); return rect.top <= 80 && rect.bottom > 80 })
        setLight(active?.dataset.theme === 'light')
        setScrolled(window.scrollY > 90)
      })
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); cancelAnimationFrame(frame) }
  }, [])

  useEffect(() => {
    if (!menu) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.dispatchEvent(new CustomEvent('v10:lock', { detail: true }))
    const timeout = window.setTimeout(() => menuRef.current?.querySelector<HTMLElement>('a')?.focus(), 150)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(false)
      if (event.key === 'Tab') {
        const focusable = Array.from(document.querySelectorAll<HTMLElement>('.v10 .mobile-menu a, .v10 .mobile-menu button, .v10 .menu-toggle'))
        const first = focusable[0], last = focusable.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timeout)
      document.body.style.overflow = overflow
      window.dispatchEvent(new CustomEvent('v10:lock', { detail: false }))
      document.removeEventListener('keydown', onKey)
    }
  }, [menu])

  function navigate(target: string) {
    setMenu(false)
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('v10:scroll', { detail: target })), 160)
  }
  function contact() {
    setMenu(false)
    window.setTimeout(() => setDialog('contact'), 100)
  }

  const navLinks = [
    { text: 'رزرو خدمات', target: '#shop' },
    { text: 'مسیر درمان', target: '#how-it-works' },
    { text: 'پرسش‌های شما', target: '#faq' },
  ]

  return (
    <>
      <header className={`site-header ${light || menu ? 'header-light' : ''} ${scrolled ? 'header-scrolled' : ''}`}>
        <a className="brand-link" href="#top" aria-label={clinic.name} onClick={(event) => { event.preventDefault(); navigate('#top') }}>
          <Wordmark />
        </a>
        <nav className="desktop-nav" aria-label="ناوبری اصلی">
          <a href="#shop">رزرو خدمات <ArrowUpLeft size={11} /></a>
          <button onClick={() => setDialog('contact')}>تماس با ما <ArrowUpLeft size={11} /></button>
        </nav>
        <div className="header-actions">
          <button
            className="bag-button icon-button"
            aria-label={`باز کردن سبد رزرو${count ? `، ${count} مورد` : ''}`}
            onClick={() => { if (menu) { setMenu(false); window.setTimeout(() => setDialog('cart'), 100) } else setDialog('cart') }}
          >
            <BagIcon />
            {count > 0 && <span className="bag-count">{count.toLocaleString('fa-IR')}</span>}
          </button>
          <button
            className={`menu-toggle ${menu ? 'is-open' : ''}`}
            aria-label={menu ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={menu}
            aria-controls="v10-mobile-menu"
            onClick={() => setMenu(!menu)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>
      <AnimatePresence>
        {menu && (
          <motion.div
            ref={menuRef}
            id="v10-mobile-menu"
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="منوی ناوبری"
            data-lenis-prevent
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav aria-label="ناوبری موبایل">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.target}
                  href={link.target}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                  onClick={(event) => { event.preventDefault(); navigate(link.target) }}
                >
                  <span>{link.text}</span>
                  <ArrowUpLeft size={28} strokeWidth={1} />
                </motion.a>
              ))}
              <button onClick={contact}>
                <span>گفت‌وگو با ما</span>
                <ArrowUpLeft size={28} strokeWidth={1} />
              </button>
            </nav>
            <div className="mobile-menu-bottom">
              <Flower />
              <p>مراقبتی دلسوزانه برای<br />هر مرحله از زندگی شما</p>
              <span className="mono">زنان و زایمان · تهران</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
