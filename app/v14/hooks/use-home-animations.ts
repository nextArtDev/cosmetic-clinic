'use client'

import { useEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger, EASE } from '../lib/gsap'
import type { PathController } from '../components/forest-path'
import { CONTENT_EM } from '../lib/assets'

type Q = (sel: string) => HTMLElement[]
type KF = [number, gsap.TweenVars]

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Webflow-style "keyframes on a scrubbed timeline": the first keyframe is the
 * held initial state, every following keyframe is a linear segment.
 */
function keyframer(tl: gsap.core.Timeline) {
  return (target: gsap.TweenTarget, frames: KF[]) => {
    if (!target || (Array.isArray(target) && target.length === 0)) return
    frames.forEach(([t, vars], i) => {
      if (i === 0) {
        tl.set(target, vars, 0)
      } else {
        const prev = frames[i - 1][0]
        tl.to(target, { ...vars, duration: Math.max(t - prev, 0.001), ease: 'none' }, prev)
      }
    })
  }
}

const COLORS = {
  green: '#233b2f',
  mainGreen: '#243d30',
  tan: '#ccb7a5',
  beach: '#faf0d0',
  yellow: '#ffcf87',
  burlywood: '#f1b47c',
  violet: '#a596e3',
  darkViolet: '#796cc4',
}

/* ------------------------------------------------------------------ */
/* Load sequence (Webflow a-10 desktop / a-25 mobile + split text)     */
/* ------------------------------------------------------------------ */
function runLoadSequence(q: Q, desktop: boolean) {
  const frontWrap = q('[data-hero-front-wrap]')
  const backWrap = q('[data-hero-back-wrap]')
  const front = q('[data-hero-front]')
  const h1Wrap = q('[data-h1-wrapper]')
  const courtain = q('[data-gradient-courtain]')
  const lines = q('[data-hero-line]')
  const iran = q('[data-poland]')
  const world = q('[data-world]')
  const rays = q('[data-rays]')
  const btnBg = q('[data-hero-btn-bg]')
  const imgWrap = q('[data-hero-img-wrapper]')
  const locTexts = q('[data-loc-text]')

  const wrapWidth = imgWrap[0] ? `${imgWrap[0].getBoundingClientRect().width}px` : 'auto'

  /* --- initial state --- */
  gsap.set(h1Wrap, { opacity: 0, xPercent: desktop ? -9 : -5 })
  gsap.set(locTexts, { opacity: 0 })
  gsap.set(courtain, { yPercent: 0 })
  gsap.set(lines, { height: '0%' })
  gsap.set([iran, world], { opacity: 0 })
  gsap.set(rays, { scale: 0 })
  gsap.set(btnBg, { xPercent: desktop ? -150 : -100 })
  gsap.set(imgWrap, { width: 0 })
  if (desktop) {
    gsap.set(frontWrap, { xPercent: -12 })
    gsap.set(backWrap, { xPercent: -6 })
  } else {
    gsap.set(front, { xPercent: -9 })
  }

  /* --- continuous rays rotation (a-9, loops forever) --- */
  rays.forEach((r, i) =>
    gsap.to(r, { rotation: i % 2 === 0 ? 360 : -360, duration: 8, ease: 'none', repeat: -1 }),
  )

  const tl = gsap.timeline()
  const lineOn = (el: HTMLElement, at: number, dur: number, ease: string) =>
    tl.to(el, { height: '100%', duration: dur, ease }, at)

  if (desktop) {
    // group 1 + 2
    tl.to(locTexts, { opacity: 1, duration: 0.1 }, 0)
    tl.to(h1Wrap, { opacity: 1, duration: 0.01 }, 0.5)
    // group 3 starts after group 2 (~0.61s); delays are relative to that
    const g = 0.61
    tl.to(backWrap, { xPercent: 0, duration: 4, ease: EASE.outQuart }, g + 0.5)
    tl.to(frontWrap, { xPercent: 0, duration: 4, ease: EASE.outQuart }, g + 0.5)
    tl.to(courtain, { yPercent: 100, duration: 8, ease: EASE.outQuart }, g + 0.5)
    tl.to(h1Wrap, { xPercent: 0, duration: 4, ease: EASE.outQuart }, g + 0.5)
    if (rays[0]) tl.to(rays[0], { scale: 1, duration: 1.5, ease: EASE.rays }, g + 0.5)
    tl.to(btnBg, { xPercent: 0, duration: 2, ease: EASE.outQuart }, g + 0.6)
    tl.to(
      imgWrap,
      { width: wrapWidth, duration: 1.5, ease: EASE.outQuart, clearProps: 'width' },
      g + 0.6,
    )
    if (lines[0]) lineOn(lines[0], g + 1.5, 1.5, EASE.outQuart)
    tl.to(iran, { opacity: 1, duration: 0.8 }, g + 1.7)
    if (rays[1]) tl.to(rays[1], { scale: 1, duration: 1.5, ease: EASE.rays }, g + 2)
    if (lines[1]) lineOn(lines[1], g + 2, 1.5, EASE.outQuart)
    tl.to(world, { opacity: 1, duration: 0.8 }, g + 3.4)
  } else {
    tl.to(h1Wrap, { xPercent: 0, duration: 3, ease: EASE.outQuart }, 0)
    tl.to(h1Wrap, { opacity: 1, duration: 0.01 }, 0)
    if (locTexts[0]) tl.to(locTexts[0], { opacity: 1, duration: 1 }, 0)
    tl.to(front, { xPercent: 0, duration: 3, ease: EASE.outQuart }, 0)
    tl.to(courtain, { yPercent: 100, duration: 8, ease: EASE.outQuart }, 0)
    tl.to(imgWrap, { width: '100%', duration: 2.5, ease: EASE.outExpo, clearProps: 'width' }, 0.1)
    if (rays[0]) tl.to(rays[0], { scale: 1, duration: 2, ease: EASE.outQuart }, 0.2)
    tl.to(btnBg, { xPercent: 0, duration: 3, ease: EASE.outExpo }, 0.5)
    if (lines[0]) lineOn(lines[0], 0.5, 1, EASE.inOutExpo)
    tl.to(iran, { opacity: 1, duration: 1.5 }, 0.7)
    if (locTexts[1]) tl.to(locTexts[1], { opacity: 1, duration: 1.5 }, 1)
    if (lines[1]) lineOn(lines[1], 1.5, 1, EASE.inOutExpo)
    if (rays[1]) tl.to(rays[1], { scale: 1, duration: 2, ease: EASE.outQuart }, 2)
    tl.to(world, { opacity: 1, duration: 1.5 }, 2.5)
    if (locTexts[2]) tl.to(locTexts[2], { opacity: 1, duration: 1 }, 2.9)
  }

  /* --- word animations (word-level for Persian; see split-text) --- */
  const letters = (sel: string, fromY: number, start: number, step: number, base: number) => {
    const els = q(sel)
    if (!els.length) return
    gsap.set(els, { y: fromY, opacity: 0 })
    gsap.to(els, {
      y: 0,
      opacity: 1,
      duration: 2,
      ease: EASE.outQuart,
      delay: start + base,
      stagger: step,
    })
  }
  letters('.fade-up .letter', 100, 0.2, 0.04, 0.4)
  letters('.fade-up2 .letter', 50, 0, 0.03, 0.4)
  letters('.fade-up3 .letter', 50, 0.8, 0.03, 0.4)
  letters('.fade-up4 .letter', -50, 2.2, 0.03, 0.4)

  // Virginia Satir quote words wait for #chapter2 to come into view
  gsap.set(q('.fade-up6 .tricksword'), { y: 100, opacity: 0 })
}

/* ------------------------------------------------------------------ */
/* Shared in-view players                                             */
/* ------------------------------------------------------------------ */
function makePlayers(q: Q) {
  const words = q('.fade-up6 .tricksword')
  const virginia = q('[data-virginia]')
  const gradient = q('[data-big-gradient]')
  const lines = [1, 2, 3, 4, 5].map((n) => q(`[data-ch3-line="${n}"]`)[0]).filter(Boolean)
  const lineFrom = [
    { xPercent: -15, yPercent: -100 },
    { xPercent: 15, yPercent: -100 },
    { xPercent: -15, yPercent: -100 },
    { xPercent: 15, yPercent: 100 },
    { xPercent: -15, yPercent: 100 },
  ]

  let quoteTl: gsap.core.Timeline | null = null
  let ch3Tl: gsap.core.Timeline | null = null

  return {
    playQuote() {
      quoteTl?.kill()
      quoteTl = gsap.timeline()
      quoteTl.fromTo(
        words,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 2, ease: EASE.outQuart, stagger: 0.06 },
        0.5,
      )
    },
    resetQuote() {
      quoteTl?.kill()
      gsap.set(words, { y: 100, opacity: 0 })
    },
    showVirginia() {
      gsap.to(virginia, { opacity: 1, duration: 1.5, ease: 'none', overwrite: true })
    },
    hideVirginia() {
      gsap.set(virginia, { opacity: 0, overwrite: true })
    },
    /** Webflow a-23: gradient sweeps away and the Tove Jansson lines slide in. */
    prepCh3() {
      gsap.set(gradient, { xPercent: 0, yPercent: 0 })
      lines.forEach((l, i) => gsap.set(l, lineFrom[i]))
    },
    playCh3() {
      ch3Tl?.kill()
      ch3Tl = gsap.timeline()
      ch3Tl.to(gradient, { xPercent: 100, duration: 4, ease: EASE.outQuart }, 0)
      lines.forEach((l, i) =>
        ch3Tl!.to(l, { xPercent: 0, yPercent: 0, duration: 3 + i * 0.2, ease: EASE.outExpo }, 0),
      )
    },
    resetCh3() {
      ch3Tl?.kill()
      gsap.set(gradient, { xPercent: 0, yPercent: 0 })
      lines.forEach((l, i) => gsap.set(l, lineFrom[i]))
    },
  }
}

/* ------------------------------------------------------------------ */
/* Desktop: the 1368vw horizontal scroll (Webflow a-78 / a-69 + views) */
/* ------------------------------------------------------------------ */
function desktopScroll(root: HTMLElement, q: Q, path: RefObject<PathController | null>) {
  const track = q('[data-track]')[0]
  const frame = q('[data-frame]')[0]
  if (!track || !frame) return () => {}

  const players = makePlayers(q)
  players.prepCh3()

  const navCtaBg = document.querySelectorAll<HTMLElement>('[data-nav-cta-bg]')
  const navCtaText = document.querySelectorAll<HTMLElement>('[data-nav-cta-text]')
  const scrollItem = document.querySelectorAll<HTMLElement>('[data-scroll-item]')

  // the two "Droga" paragraphs carry a static -10% offset in the original
  gsap.set([q('[data-droga-p1]'), q('[data-droga-p2]')], { yPercent: -10 })

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.4,
      invalidateOnRefresh: true,
    },
  })
  const kf = keyframer(tl)

  /* frame + progress bar.
     See CONTENT_EM. The frame's content is a fixed number of design units
     wide; the desktop source travels 1368 because its viewport happens to
     be 100 units (1368 + 100 = 1468). On a phone the viewport is far
     narrower in design-units, so travelling a flat 1368 would strand the
     final CTA/footer off-screen. Travel `content − viewport` instead;
     desktop evaluates to the original 1368 units. `.track` mirrors this. */
  const travelPx = () => {
    const unit = parseFloat(getComputedStyle(frame).fontSize) || 1
    return -(CONTENT_EM * unit - window.innerWidth)
  }
  kf(frame, [
    [0, { x: 0 }],
    [100, { x: () => travelPx() }],
  ])
  kf(scrollItem, [
    [0, { width: '0.5%' }],
    [100, { width: '100%' }],
  ])

  /* hero CTA → navbar CTA hand-off */
  kf(q('[data-hero-btn-bg]'), [
    [0, { scale: 1 }],
    [0.925, { scale: 0 }],
  ])
  kf(navCtaBg, [
    [0, { width: '0%', height: '0%' }],
    [0.925, { width: '200%', height: '150%' }],
    [98.5, { width: '200%', height: '150%' }],
    [99.5, { width: '0%', height: '0%' }],
  ])
  kf(navCtaText, [
    [98.5, { opacity: 1 }],
    [99.5, { opacity: 0 }],
  ])
  kf(q('[data-final-btn-bg]'), [
    [98.5, { width: '0%', height: '0%' }],
    [99.5, { width: '100%', height: '100%' }],
  ])
  kf(q('[data-final-btn-text]'), [
    [98.5, { opacity: 0 }],
    [99.5, { opacity: 1 }],
  ])

  /* hero parallax */
  kf(q('[data-hero-front]'), [
    [0, { xPercent: 0 }],
    [6.475, { xPercent: -20 }],
  ])
  kf(q('[data-main-h1]'), [
    [0, { xPercent: 0 }],
    [6.475, { xPercent: -10 }],
  ])

  /* forest text sequence */
  const op = (sel: string, frames: Array<[number, number]>) =>
    kf(q(sel), frames.map(([t, v]) => [t, { opacity: v }] as KF))
  const mv = (sel: string, frames: Array<[number, number]>) =>
    kf(q(sel), frames.map(([t, v]) => [t, { xPercent: v }] as KF))

  op('._1-proces-terapii', [[1.85, 0], [6.475, 1], [7.4, 1], [9.25, 0]])
  mv('._1-proces-terapii', [[1.85, 15], [9.25, -15]])
  op('._2-sie-w-siebie', [[2.775, 0], [7.4, 1], [8.325, 1], [10.175, 0]])
  op('._3-i-kluczenie', [[3.7, 0], [8.325, 1], [9.25, 1], [11.1, 0]])
  mv('._3-i-kluczenie', [[3.7, -10], [11.1, 10]])
  op('._4-jakbys-szukal', [[8.325, 0], [12.95, 1], [15.725, 1], [17.575, 0]])
  op('._5-przez-ciemny-las', [[9.25, 0], [13.875, 1], [16.65, 1], [18.5, 0]])
  mv('._5-przez-ciemny-las', [[9.25, -10], [16.65, 10]])
  op('._6-ale-w-koncu', [[16.65, 0], [21.275, 1], [23.125, 1], [24.975, 0]])
  op('._7-staje-sie', [[17.575, 0], [22.2, 1], [24.05, 1], [25.9, 0]])
  mv('._7-staje-sie', [[17.575, 15], [25.9, -15]])
  op('._8-i-mozesz', [[24.05, 0], [28.675, 1], [30.525, 1], [32.375, 0]])
  mv('._8-i-mozesz', [[24.05, -15], [32.375, 15]])
  op('._9-w-nim', [[24.975, 0], [29.6, 1], [31.45, 1], [33.3, 0]])

  /* forest path (replaces the Lottie scrub: same 2.775→38.85 window) */
  op('.path-lootie', [[2.775, 0], [4.625, 1], [33.7625, 1], [35.6125, 0]])
  const progress = { p: 0 }
  tl.set(progress, { p: 0 }, 0)
  tl.to(
    progress,
    {
      p: 1,
      duration: 38.85 - 2.775,
      onUpdate: () => path.current?.seek(progress.p),
    },
    2.775,
  )

  /* forest photo pinned while the text travels, then zooms and fades */
  kf(q('[data-forest-container]'), [
    [7.3075, { x: '0em' }],
    [43.031, { x: '489em' }],
  ])
  op('[data-forest-apla]', [[27.75, 0.81], [39.775, 0]])
  kf(q('[data-forest-img]'), [
    [35.15, { scale: 1 }],
    [39.775, { scale: 1.3 }],
  ])
  op('[data-section-forest]', [[37.925, 1], [41.625, 0]])

  /* newsletter + droga grid hold still while the forest dissolves */
  kf(q('[data-droga-grid]'), [
    [35.557, { x: '0em' }],
    [42.8645, { x: '100em' }],
  ])
  kf(q('[data-section-newsletter]'), [
    [35.557, { x: '-35em' }],
    [42.8645, { x: '65em' }],
  ])

  /* droga parallax */
  mv('.cutter.flex-center', [[41.625, -10], [60, 5]])
  mv('[data-droga-p1]', [[42.8645, 0], [51, -18]])
  mv('[data-droga-p2]', [[42.8645, 0], [51, 10]])
  mv('.droga-przez-wrap', [[42.8645, 0], [51, -30]])
  mv('.facture-img', [[42.8645, -10], [57, 12]])
  mv('.cutter.right-align-flex', [[50, 20], [59, -20]])
  mv('.las-sciezka-img', [[52, 15], [61, -15]])
  mv('.paragraph-standard.sa-rzeczy', [[55, -10], [70, 10]])
  op('.paragraph-standard.sa-rzeczy', [[59, 0], [61, 1]])

  /* chapter 2 */
  mv('.duzy-las-klif-img', [[60, -15], [76, 27]])
  mv('.two-cell-paragraph-wrapper', [[62, 0], [72, 15]])
  mv('.h3.sposob', [[63, 15], [76, -15]])
  kf(q('.wydma-img'), [
    [69, { scale: 1.6 }],
    [73, { scale: 1.15 }],
    [78, { scale: 1 }],
  ])
  op('.wydma-img', [[69, 0], [72, 1]])
  kf(q('.wydma-wrap'), [
    [69, { height: '36vh' }],
    [78, { height: '50.5vh' }],
  ])
  op('.wejscie-na-wydme-img', [[72, 0], [75, 1]])
  kf(q('.wejscie-na-wydme-img'), [
    [72, { scale: 1.5 }],
    [75, { scale: 1.15 }],
    [81, { scale: 1 }],
  ])
  kf(q('.wchodzenie-na-wyspe-wrap'), [
    [75, { height: '68vh' }],
    [81, { height: '79vh' }],
  ])
  mv('.paragraph-bigger.chce-ci', [[75, 20], [84, -10]])

  /* chapter 3 */
  const cutterEnd = [-18, 15, 13, -10, -5]
  cutterEnd.forEach((v, i) => mv(`[data-h2-cutter="${i + 1}"]`, [[78, 0], [92, v]]))
  mv('[data-ch3-headshot]', [[84, 40], [95, -40]])
  mv('.h3._3rd--chapter', [[88, 10], [97, -10]])
  mv('[data-ch3-p]', [[88, 10], [98, -10]])
  mv('[data-back-wrap]', [[95, -15], [100, -15]])
  kf(q('[data-back-wrap]'), [
    [96, { width: '12em', height: '18em' }],
    [98, { width: '18.5em', height: '28em' }],
    [100, { width: '21.5em', height: '32em' }],
  ])

  /* ---- horizontal "scroll into view" triggers ---- */
  const vw = () => window.innerWidth
  const watchers: Array<{
    el: HTMLElement | undefined
    offset: number
    on: () => void
    off: () => void
    state: boolean
  }> = [
    { el: q('[data-section-ch3-hero]')[0], offset: 0.2, on: players.playCh3, off: players.resetCh3, state: false },
    { el: q('[data-virginia]')[0], offset: 0.2, on: players.showVirginia, off: players.hideVirginia, state: false },
    { el: q('#chapter2')[0], offset: 0, on: players.playQuote, off: players.resetQuote, state: false },
  ]
  const check = () => {
    const w = vw()
    for (const wt of watchers) {
      if (!wt.el) continue
      const r = wt.el.getBoundingClientRect()
      const visible = r.left < w * (1 - wt.offset) && r.right > 0
      if (visible && !wt.state) {
        wt.state = true
        wt.on()
      } else if (!visible && wt.state) {
        wt.state = false
        wt.off()
      }
    }
    document.body.classList.toggle('v14-on-tan', tl.progress() > 0.565)
  }
  tl.eventCallback('onUpdate', check)
  const raf = requestAnimationFrame(check)

  return () => {
    cancelAnimationFrame(raf)
    tl.eventCallback('onUpdate', null)
    tl.scrollTrigger?.kill()
    tl.kill()
    document.body.classList.remove('v14-on-tan')
  }
}

/* ------------------------------------------------------------------ */
/* Tablet / mobile: vertical page with the Webflow "medium/small/tiny"  */
/* interactions (a-26/a-41, a-27, a-28, a-29, a-32, a-33, a-35, a-39…)  */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* hook                                                               */
/* ------------------------------------------------------------------ */
export function useHomeAnimations(
  root: RefObject<HTMLElement | null>,
  path: RefObject<PathController | null>,
) {
  useEffect(() => {
    const el = root.current
    if (!el) return

    // v14: the horizontal journey IS the mobile layout — the desktop
    // choreography runs at every viewport width, no vertical fallback.
    const q: Q = (sel) => gsap.utils.toArray<HTMLElement>(el.querySelectorAll(sel))

    runLoadSequence(q, true)
    const cleanup = desktopScroll(el, q, path)

    // make sure measurements are right once fonts/images settle
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const t = window.setTimeout(refresh, 800)

    return () => {
      window.removeEventListener('load', refresh)
      window.clearTimeout(t)
      cleanup()
    }
  }, [root, path])
}
