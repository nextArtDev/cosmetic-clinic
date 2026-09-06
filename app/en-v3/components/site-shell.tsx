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
  const [intro, setIntro] = useState(true)
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
    const timer = window.setTimeout(() => setIntro(false), 350)
    const consentFrame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem('v3-studio-consent')
        if (saved) { setConsentSaved(true); setAnalytics(Boolean(JSON.parse(saved).analytics)) }
      } catch { /* Preferences are optional when storage is unavailable. */ }
    })
    return () => {
      html.removeAttribute('data-v3-active')
      lenis.destroy()
      window.clearTimeout(timer)
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
      <div className="v3" lang="fr">
        <a className="skip-link" href="#v3-main-content">Aller au contenu</a>
        <header className={`site-header ${lightHeader ? 'is-light' : ''} ${menuOpen ? 'is-obscured' : ''}`}>
          <Link href="/v3" className="site-logo" aria-label="L’AGENCE Design Studio — Accueil"><img src="/v3/images/logo.svg" alt="L’AGENCE Design Studio" width="200" height="34" /></Link>
          <button className="menu-toggle" onClick={() => { setCookieOpen(false); setMenuOpen(true) }} aria-expanded={menuOpen} aria-controls="v3-main-navigation"><span>Menu</span><span className="menu-toggle-line" /></button>
        </header>

        {children}

        <Link href="/v3/#recompenses" className="awards-ribbon" aria-label="Découvrir les récompenses du studio"><strong>w.</strong><span>Nominée</span></Link>
        <button className="consent-trigger" onClick={() => { setMenuOpen(false); setCookieOpen(true) }} aria-label="Gérer le consentement aux cookies"><span className={`consent-dot ${consentSaved ? 'is-saved' : ''}`} />Gérer le consentement</button>

        <AnimatePresence>
          {intro && <motion.div className="intro-curtain" initial={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: reduce ? 0.01 : 0.85, ease }} aria-hidden="true"><motion.img src="/v3/images/logo.svg" alt="" width="260" height="44" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} /></motion.div>}
        </AnimatePresence>

        <AnimatePresence>
          {menuOpen && (
            <motion.div id="v3-main-navigation" ref={menuRef} className="navigation-overlay" role="dialog" aria-modal="true" aria-label="Navigation principale" data-lenis-prevent initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: reduce ? 0.01 : 0.7, ease }}>
              <button className="menu-close" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu"><span /><span /></button>
              <div className="navigation-aside"><p className="eyebrow">Design indépendant.<br />Ambitions singulières.</p><a className="text-link" href="mailto:contact@lagencedesignstudio.com">contact@lagencedesignstudio.com</a><span>France · Partout avec vous</span></div>
              <nav aria-label="Navigation principale">
                {navItems.map((item, index) => (
                  <motion.div className="nav-item-wrap" key={item.href} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: reduce ? 0 : 0.18 + index * 0.07, ease }}>
                    <Link className={pathname === item.href ? 'is-current' : ''} href={item.href} onClick={() => setMenuOpen(false)}><span>{item.label}</span><ArrowIcon diagonal /></Link>
                  </motion.div>
                ))}
              </nav>
              <div className="navigation-bottom"><span>L’AGENCE DESIGN STUDIO</span><div><a href="https://www.instagram.com/lagence.designstudio/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://www.behance.net/lagencedesignstudio" target="_blank" rel="noreferrer">Behance ↗</a></div></div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {cookieOpen && <motion.div className="cookie-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(event) => { if (event.target === event.currentTarget) setCookieOpen(false) }}>
            <motion.div className="cookie-panel" ref={cookieRef} role="dialog" aria-modal="true" aria-labelledby="v3-cookie-title" data-lenis-prevent initial={{ y: 35 }} animate={{ y: 0 }} exit={{ y: 35 }} transition={{ duration: 0.35, ease }}>
              <div className="cookie-header"><img src="/v3/images/logo.svg" alt="L’AGENCE" width="110" height="19" /><h2 id="v3-cookie-title">Gérer le consentement</h2><button onClick={() => setCookieOpen(false)} aria-label="Fermer les préférences"><span aria-hidden="true">×</span></button></div>
              <p>Votre confidentialité compte. Cette version utilise uniquement les fonctionnalités nécessaires à la navigation et au traitement de votre demande. Aucun service de suivi publicitaire n’est chargé.</p>
              <AnimatePresence>{preferences && <motion.div className="cookie-preferences" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div><span>Fonctionnels <small>Toujours actifs</small></span><span className="cookie-check">✓</span></div>
                <label><span>Mesure d’audience <small>Préférence enregistrée, sans suivi activé</small></span><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /></label>
              </motion.div>}</AnimatePresence>
              <div className="cookie-actions"><button className="cookie-accept" onClick={() => saveConsent(true)}>Accepter</button><button onClick={() => saveConsent(false)}>Refuser</button>{preferences ? <button onClick={() => saveConsent(analytics)}>Enregistrer</button> : <button onClick={() => setPreferences(true)}>Préférences</button>}</div>
              <div className="cookie-legal"><Link href="/v3/mentions-legales" onClick={() => setCookieOpen(false)}>Mentions légales</Link><Link href="/v3/politique-de-confidentialite" onClick={() => setCookieOpen(false)}>Politique de confidentialité</Link></div>
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
        <div className="footer-brand"><Link href="/v3" aria-label="Retour à l’accueil"><img src="/v3/images/logo.svg" alt="L’AGENCE Design Studio" width="220" height="38" /></Link><p>Des identités singulières et des sites web pour les marques beauté, bien-être, food et lifestyle qui souhaitent affirmer leur valeur.</p><div className="footer-socials"><a href="https://www.instagram.com/lagence.designstudio/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://www.behance.net/lagencedesignstudio" target="_blank" rel="noreferrer">Behance ↗</a></div></div>
        <nav className="footer-nav" aria-label="Explorer le studio"><p className="eyebrow">Explorer</p><Link href="/v3/methode">Méthode</Link><Link href="/v3/offres">Offres</Link><Link href="/v3/expertises">Expertises</Link><Link href="/v3/solutions">Solutions</Link></nav>
        <nav className="footer-nav" aria-label="À propos du studio"><p className="eyebrow">Le studio</p><Link href="/v3/projets">Réalisations</Link><Link href="/v3/a-propos">À propos</Link><Link href="/v3/manifeste">Manifeste</Link><Link href="/v3/contact">Contact</Link></nav>
        <div className="footer-contact"><p className="eyebrow">Une belle idée commence ici</p><Link href="/v3/contact" className="footer-call">Réserver un appel <ArrowIcon /></Link><p>réponse sous 24h — sans engagement</p><a className="text-link" href="mailto:contact@lagencedesignstudio.com">contact@lagencedesignstudio.com</a><a className="text-link" href="tel:+33777703041">+33 (0)7 77 70 30 41</a></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} L’AGENCE Design Studio</span><div><Link href="/v3/mentions-legales">Mentions légales</Link><Link href="/v3/politique-de-confidentialite">Confidentialité</Link><Link href="/v3/cgv">CGV</Link></div><button onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Retour en haut <span aria-hidden="true">↑</span></button></div>
    </footer>
  )
}
