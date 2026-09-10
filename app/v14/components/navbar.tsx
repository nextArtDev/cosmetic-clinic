'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
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

/**
 * v14: the desktop navbar is the only navbar — it renders at every
 * viewport width (the horizontal journey is the mobile layout too), so
 * the original's hamburger/overlay menu and its open/close timelines
 * are dropped. The full-height inline links stay tappable on phones
 * (min-width raised in globals.css).
 */
export default function Navbar() {
  const navRef = useRef<HTMLElement | null>(null)
  const logoHover = useGradientHover<HTMLAnchorElement>()
  const ctaHover = useGradientHover<HTMLAnchorElement>()

  /* Load sequence (Webflow action list a-11) */
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const ctx = gsap.context(() => {
      const logo = nav.querySelector('.logo-wrapper')
      const bg = nav.querySelector('.nav-background')
      const links = nav.querySelectorAll('[data-nav-item]')
      const cta = nav.querySelector('.top-right-cta')

      gsap.set([logo, bg, links, cta], { opacity: 0 })

      const tl = gsap.timeline({ defaults: { duration: 2, ease: 'none' } })
      tl.to([logo, bg], { opacity: 1 }, 0)
      links.forEach((l, i) => tl.to(l, { opacity: 1 }, 0.1 * (i + 1)))
      tl.to(cta, { opacity: 1 }, 0.5)
    }, nav)
    return () => ctx.revert()
  }, [])

  const navigate = useTransitionNavigate()

  return (
    <nav className="navbar-wrapper" ref={navRef} aria-label="ناوبری اصلی">
      <Link
        href="/v14"
        aria-current="page"
        className="logo-wrapper"
        onMouseEnter={logoHover.onMouseEnter}
        onMouseLeave={logoHover.onMouseLeave}
        onClick={(e) => navigate(e, '/v14')}
      >
        <div className="nav-logo" data-nav-logo>
          <Logo />
        </div>
        <div className="gradient-nav right-side" />
        <div className="gradient-nav left-side" />
      </Link>

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
    </nav>
  )
}
