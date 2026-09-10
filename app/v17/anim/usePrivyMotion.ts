'use client'

import { useEffect, type RefObject } from 'react'
import Lenis from 'lenis'

/* ------------------------------------------------------------------ */
/* Smooth scroll (Locomotive equivalent)                               */
/* ------------------------------------------------------------------ */

let lenis: Lenis | null = null

/** Pauses/resumes the smooth-scroll engine (used while modal dialogs are open). */
export function setLenisPaused(paused: boolean) {
  if (!lenis) return
  if (paused) lenis.stop()
  else lenis.start()
}

/** Anchor navigation that stays in sync with the smooth-scroll engine. */
export function scrollToTarget(id: string, reduced?: boolean) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis && !reduced) {
    lenis.scrollTo(el, { offset: -70, duration: 1.35 })
  } else {
    el.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
  }
}

function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const instance = new Lenis({ duration: 1.15, lerp: 0.1, smoothWheel: true })
    lenis = instance
    let raf = 0
    const loop = (time: number) => {
      instance.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      instance.destroy()
      if (lenis === instance) lenis = null
    }
  }, [enabled])
}

/* ------------------------------------------------------------------ */
/* Scroll reveal (Webflow `reveal` plugin equivalent)                  */
/* ------------------------------------------------------------------ */

const REVEAL_TOKENS = new Set([
  'fade-in',
  'slide-in-bottom',
  'slide-in-top',
  'zoom-in',
  'title',
  'subtitle',
  'text',
])

/** Splits a heading's `<br>`-separated lines into mask/inner spans so each
 *  line can slide up from behind a clipping edge (the masked-title reveal). */
function splitTitleLines(el: HTMLElement) {
  if (el.hasAttribute('data-pv-split')) return
  const children = Array.from(el.childNodes)
  if (!children.some((n) => n.nodeName === 'BR')) return

  const lines: ChildNode[][] = [[]]
  for (const node of children) {
    if (node.nodeName === 'BR') lines.push([])
    else lines[lines.length - 1].push(node)
  }

  el.textContent = ''
  lines.forEach((nodes, index) => {
    const mask = document.createElement('span')
    mask.setAttribute('data-pv-line', '')
    const inner = document.createElement('span')
    inner.setAttribute('data-pv-inner', '')
    inner.style.transitionDelay = `${index * 90}ms`
    nodes.forEach((n) => inner.appendChild(n))
    mask.appendChild(inner)
    el.appendChild(mask)
  })
  el.setAttribute('data-pv-split', '')
}

function useReveal(root: RefObject<HTMLElement | null>, reduced: boolean) {
  useEffect(() => {
    const host = root.current
    if (!host) return

    if (reduced) {
      host.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => el.setAttribute('data-pv-in', ''))
      return
    }

    host.setAttribute('data-pv-armed', '')
    const observed = new WeakSet<Element>()

    const prepare = (el: HTMLElement) => {
      const tokens = (el.getAttribute('data-reveal') || '').split(/\s+/)
      if (tokens.includes('title')) splitTitleLines(el)
      const delay = el.getAttribute('data-reveal-delay')
      if (delay) el.style.transitionDelay = `${delay}ms`
    }

    const reveal = (el: HTMLElement) => {
      el.setAttribute('data-pv-in', '')
      observer.unobserve(el)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          reveal(entry.target as HTMLElement)
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )

    const scan = () => {
      host.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        if (observed.has(el)) return
        observed.add(el)
        prepare(el)
        const tokens = (el.getAttribute('data-reveal') || '').split(/\s+/)
        if (tokens.some((t) => REVEAL_TOKENS.has(t))) observer.observe(el)
        else el.setAttribute('data-pv-in', '')
      })
    }

    scan()
    // catch dialog/menu content mounted after first paint
    const mo = new MutationObserver(() => scan())
    mo.observe(host, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      observer.disconnect()
      host.removeAttribute('data-pv-armed')
    }
  }, [root, reduced])
}

/* ------------------------------------------------------------------ */
/* Parallax (Webflow `parallax` patterns equivalent)                   */
/* ------------------------------------------------------------------ */

type Pattern = (p: number) => string

const PATTERNS: Record<string, Pattern> = {
  // full-bleed background drifts against the scroll and stays oversized
  backgroundMove: (p) => `translate3d(0, ${((0.5 - p) * 16).toFixed(3)}%, 0) scale(1.18)`,
  // in-flow image counter-moves for depth
  imageMove: (p) => `translate3d(0, ${((0.5 - p) * 12).toFixed(3)}%, 0) scale(1.14)`,
  // image settles into place as it enters
  imageScale: (p) => `scale(${(1.16 - p * 0.16).toFixed(4)})`,
  // section content drifts up as it exits (sticky "sectionOut")
  sectionOut: (p) => `translate3d(0, ${((0.5 - p) * 10).toFixed(3)}svh, 0)`,
  title: (p) => `translate3d(0, ${((0.5 - p) * 7).toFixed(3)}%, 0)`,
}

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))

function useParallax(root: RefObject<HTMLElement | null>, reduced: boolean) {
  useEffect(() => {
    const host = root.current
    if (!host || reduced) return

    type Item = { el: HTMLElement; apply: Pattern }
    const items: Item[] = []

    const collect = () => {
      host.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        const name = (el.getAttribute('data-parallax') || '').trim()
        const apply = PATTERNS[name]
        if (apply && !items.some((i) => i.el === el)) items.push({ el, apply })
      })
    }
    collect()

    let raf = 0
    const render = () => {
      raf = 0
      const vh = window.innerHeight
      for (const { el, apply } of items) {
        const r = el.getBoundingClientRect()
        if (r.bottom < -160 || r.top > vh + 160) continue
        const p = clamp((vh - r.top) / (vh + r.height))
        el.style.transform = apply(p)
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(render)
    }

    render()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    const mo = new MutationObserver(collect)
    mo.observe(host, { childList: true, subtree: true })

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      mo.disconnect()
    }
  }, [root, reduced])
}

/* ------------------------------------------------------------------ */
/* Themed transitions (Webflow `themed` plugin equivalent)             */
/* ------------------------------------------------------------------ */

function useThemed(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current
    if (!host) return
    const themed = Array.from(host.querySelectorAll<HTMLElement>('[data-theme-section]'))
    if (!themed.length) return

    const update = () => {
      const line = 52 // header midline
      let theme = 'dark'
      for (const section of themed) {
        const r = section.getBoundingClientRect()
        if (r.top <= line && r.bottom >= line) {
          theme = section.getAttribute('data-theme-section') || 'dark'
          break
        }
      }
      host.setAttribute('data-pv-theme', theme)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [root])
}

/* ------------------------------------------------------------------ */
/* Hide-on-scroll header (Webflow `hideHeader` equivalent)             */
/* ------------------------------------------------------------------ */

function useHeaderHide(root: RefObject<HTMLElement | null>, reduced: boolean) {
  useEffect(() => {
    const host = root.current
    if (!host || reduced) return
    const header = host.querySelector<HTMLElement>('[data-header]')
    if (!header) return

    let last = window.scrollY
    let ticking = false
    const update = () => {
      ticking = false
      const y = window.scrollY
      const goingDown = y > last + 4
      const goingUp = y < last - 4
      if (goingDown && y > 160) header.setAttribute('data-pv-hidden', '')
      else if (goingUp || y < 120) header.removeAttribute('data-pv-hidden')
      last = y
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [root, reduced])
}

/* ------------------------------------------------------------------ */
/* Magnetic hover (Webflow button micro-interaction equivalent)        */
/* ------------------------------------------------------------------ */

function useMagnetic(root: RefObject<HTMLElement | null>, reduced: boolean) {
  useEffect(() => {
    const host = root.current
    if (!host || reduced) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    type Target = { el: HTMLElement; strength: number; move: (e: MouseEvent) => void; leave: () => void }
    const targets: Target[] = []

    const collect = () => {
      host.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
        if (targets.some((t) => t.el === el)) return
        const strength = Number(el.getAttribute('data-magnetic')) || 0.28
        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect()
          const x = (e.clientX - (r.left + r.width / 2)) * strength
          const y = (e.clientY - (r.top + r.height / 2)) * strength
          el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
        }
        const leave = () => {
          el.style.transform = ''
        }
        el.style.transition = 'transform .45s cubic-bezier(.22,1,.36,1)'
        el.addEventListener('mousemove', move)
        el.addEventListener('mouseleave', leave)
        targets.push({ el, strength, move, leave })
      })
    }
    collect()
    const mo = new MutationObserver(collect)
    mo.observe(host, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      targets.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move)
        el.removeEventListener('mouseleave', leave)
        el.style.transform = ''
        el.style.transition = ''
      })
    }
  }, [root, reduced])
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

export function usePrivyMotion(root: RefObject<HTMLElement | null>, reduced: boolean) {
  useSmoothScroll(!reduced)
  useReveal(root, reduced)
  useParallax(root, reduced)
  useThemed(root)
  useHeaderHide(root, reduced)
  useMagnetic(root, reduced)
}
