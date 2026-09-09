'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, EASE } from '../lib/gsap'
import { Logo } from './icons'
import { LINKS, NAV_ITEMS } from '../lib/assets'
import { useTransitionNavigate } from './page-transition'
import { useGradientHover } from './use-gradient-hover'

function NavLinkItem({ href, label }: { href: string; label: string }) {
  const hover = useGradientHover<HTMLAnchorElement>()
  const navigate = useTransitionNavigate()
  return (
    <Link
      href={href}
      className="navlink"
      data-nav-item
      onMouseEnter={hover.onMouseEnter}
      onMouseLeave={hover.onMouseLeave}
      onFocus={hover.onFocus}
      onBlur={hover.onBlur}
      onClick={(e) => navigate(e, href)}
    >
      <div className="text-standard nav">{label}</div>
      <div className="gradient-nav right-side" />
      <div className="gradient-nav left-side" />
    </Link>
  )
}

export default function Navbar() {
  const navRef = useRef<HTMLElement | null>(null)
  const logoHover = useGradientHover<HTMLAnchorElement>()
  const ctaHover = useGradientHover<HTMLAnchorElement>()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuTl = useRef<gsap.core.Timeline | null>(null)

  /* Load sequence (Webflow action list a-11) */
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const ctx = gsap.context(() => {
      const logo = nav.querySelector('.logo-wrapper')
      const bg = nav.querySelector('.nav-background')
      const links = nav.querySelectorAll('[data-nav-item]')
      const cta = nav.querySelector('.top-right-cta')
      const burgerText = nav.querySelector('.hamburgen-menu-text')

      gsap.set([logo, bg, links, cta], { opacity: 0 })
      gsap.set(burgerText, { yPercent: -140 })

      const tl = gsap.timeline({ defaults: { duration: 2, ease: 'none' } })
      tl.to([logo, bg], { opacity: 1 }, 0)
      links.forEach((l, i) => tl.to(l, { opacity: 1 }, 0.1 * (i + 1)))
      tl.to(cta, { opacity: 1 }, 0.5)
      tl.to(burgerText, { yPercent: 0, ease: EASE.outExpo }, 0.5)
    }, nav)
    return () => ctx.revert()
  }, [])

  /* Mobile menu open / close (Webflow action lists a-37 / a-38) */
  const toggleMenu = useCallback(() => {
    const menu = menuRef.current
    const nav = navRef.current
    if (!menu || !nav) return
    const next = !menuOpen
    setMenuOpen(next)
    document.body.classList.toggle('v13-menu-open', next)

    menuTl.current?.kill()
    const wrapper = menu.querySelector('.hamburger-content-wrapper')
    const texts = menu.querySelectorAll('.hambrger-menu-item-text')
    const lines = menu.querySelectorAll('.hamburger-item-line')
    const elipse = menu.querySelector('.hamburger-menu-elipse')
    const xWrap = nav.querySelector('.x-wrap')
    const burgerText = nav.querySelector('.hamburgen-menu-text')
    const brightness = nav.querySelector('.navbar-brightness-background')

    const tl = gsap.timeline()
    menuTl.current = tl

    if (next) {
      menu.classList.add('is-open')
      gsap.set(menu, { opacity: 0 })
      gsap.set(wrapper, { scaleY: 0, transformOrigin: '50% 0%' })
      gsap.set(texts, { yPercent: -100 })
      gsap.set(lines, { scaleX: 0, opacity: 0 })
      gsap.set(elipse, { opacity: 0 })

      tl.to(menu, { opacity: 1, duration: 0.5 }, 0)
        .to(brightness, { opacity: 1, duration: 1 }, 0)
        .to(xWrap, { xPercent: -100, duration: 1, ease: EASE.inOutExpo }, 0)
        .to(burgerText, { xPercent: -100, duration: 0.7, ease: EASE.inOutExpo }, 0)
        .to(wrapper, { scaleY: 1, duration: 1, ease: EASE.outQuart }, 0)
      texts.forEach((t, i) => tl.to(t, { yPercent: 0, duration: 1, ease: EASE.outQuart }, 0.1 * i))
      lines.forEach((l, i) =>
        tl.to(l, { scaleX: 1, opacity: 1, duration: 0.5, ease: EASE.outQuart }, 0.1 * (i + 1)),
      )
      tl.to(elipse, { opacity: 1, duration: 1 }, 0.4)
    } else {
      tl.to(texts, { yPercent: -100, duration: 0.6, ease: EASE.inOutExpo, stagger: 0.05 }, 0)
        .to(lines, { scaleX: 0, opacity: 0, duration: 0.4 }, 0)
        .to(elipse, { opacity: 0, duration: 0.4 }, 0)
        .to(wrapper, { scaleY: 0, duration: 0.8, ease: EASE.inOutExpo }, 0.15)
        .to(menu, { opacity: 0, duration: 0.4 }, 0.5)
        .to(xWrap, { xPercent: 0, duration: 1, ease: EASE.inOutExpo }, 0)
        .to(burgerText, { xPercent: 0, duration: 0.7, ease: EASE.inOutExpo }, 0.1)
        .to(brightness, { opacity: 0.2, duration: 0.8 }, 0)
        .add(() => menu.classList.remove('is-open'))
    }
  }, [menuOpen])

  useEffect(() => {
    return () => document.body.classList.remove('v13-menu-open')
  }, [])

  const navigate = useTransitionNavigate()

  return (
    <nav className="navbar-wrapper" ref={navRef} aria-label="ناوبری اصلی">
      <Link
        href="/v13"
        aria-current="page"
        className="logo-wrapper"
        onMouseEnter={logoHover.onMouseEnter}
        onMouseLeave={logoHover.onMouseLeave}
        onClick={(e) => navigate(e, '/v13')}
      >
        <div className="nav-logo" data-nav-logo>
          <Logo />
        </div>
        <div className="gradient-nav right-side" />
        <div className="gradient-nav left-side" />
      </Link>

      <button
        type="button"
        className="hamburger-icon-wrapper"
        onClick={toggleMenu}
        aria-expanded={menuOpen}
        aria-controls="v13-mobile-menu"
        aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}
      >
        <div className="hamburger-menu-cutter">
          <div className="hamburgen-menu-text">منو</div>
          <div className="x-wrap">
            <div className="menu-close-line" />
            <div className="menu-close-line rotate-180" />
          </div>
        </div>
      </button>

      {NAV_ITEMS.map((item) => (
        <NavLinkItem key={item.href} href={item.href} label={item.label} />
      ))}

      <a
        href={LINKS.booking}
        className="top-right-cta"
        onMouseEnter={ctaHover.onMouseEnter}
        onMouseLeave={ctaHover.onMouseLeave}
        onClick={(e) => navigate(e, LINKS.booking)}
      >
        <div className="text-standard nav-cta text-color-o-mnie-main" data-nav-cta-text>
          رزرو جلسه
        </div>
        <div className="nav-cta-background" data-nav-cta-bg />
        <div className="gradient-nav right-side cta-navbar" />
        <div className="gradient-nav left-side cta-navbar" />
      </a>

      <div className="nav-background" data-nav-bg />
      <div className="navbar-brightness-background" data-nav-brightness />

      <div className="hamburger-menu-content" id="v13-mobile-menu" ref={menuRef}>
        <div className="hamburger-content-wrapper">
          {[
            { label: 'درمان', href: '/v13/darman', cls: '' },
            { label: 'درباره من', href: '/v13/darbare-man', cls: 'right' },
            { label: 'تماس', href: '/v13/tamas', cls: '' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-menu-item-cutter ${item.cls}`}
              onClick={(e) => navigate(e, item.href)}
            >
              <div className="hambrger-menu-item-text">{item.label}</div>
              <div className="menu-item-spacer" />
              <div className="hamburger-item-line" />
            </Link>
          ))}
          <a
            href={LINKS.booking}
            className="mobile-menu-item-cutter middle"
            onClick={(e) => navigate(e, LINKS.booking)}
          >
            <div className="hambrger-menu-item-text">جلسه</div>
            <div className="hamburger-menu-elipse" />
          </a>
        </div>
      </div>
    </nav>
  )
}
