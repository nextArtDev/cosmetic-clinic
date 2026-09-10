'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, type MouseEvent } from 'react'
import { gsap, EASE } from '../lib/gsap'

const EXIT_MS = 650

let curtainEl: HTMLDivElement | null = null
let wrapperEl: HTMLDivElement | null = null

/**
 * Port of the original page transition: on internal link click the teal
 * curtain grows from the left edge to full width (650ms, expo.out; the
 * origin is flipped for RTL so it still sweeps from the "start" side) and
 * only then the navigation happens. Scoped to /v14 links only — the hook
 * is only used by v14 components.
 */
export function useTransitionNavigate() {
  const router = useRouter()
  return useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      if (!curtainEl || !wrapperEl) return
      e.preventDefault()
      document.body.classList.add('v14-no-scroll-transition')
      wrapperEl.classList.add('is-visible')
      gsap.fromTo(
        curtainEl,
        { width: '0%' },
        {
          width: '100%',
          duration: EXIT_MS / 1000,
          ease: EASE.outExpo,
          overwrite: true,
          onComplete: () => {
            router.push(href)
          },
        },
      )
    },
    [router],
  )
}

export default function PageTransition() {
  const wrapper = useRef<HTMLDivElement | null>(null)
  const curtain = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    wrapperEl = wrapper.current
    curtainEl = curtain.current

    // Entry: if we arrived through a transition, sweep the curtain away.
    const w = wrapper.current
    const c = curtain.current
    if (w && c && document.body.classList.contains('v14-no-scroll-transition')) {
      w.classList.add('is-visible')
      gsap.fromTo(
        c,
        { width: '100%' },
        {
          width: '0%',
          duration: EXIT_MS / 1000,
          ease: EASE.outExpo,
          onComplete: () => {
            w.classList.remove('is-visible')
            document.body.classList.remove('v14-no-scroll-transition')
          },
        },
      )
    }

    const onPageShow = (ev: PageTransitionEvent) => {
      if (ev.persisted) window.location.reload()
    }
    window.addEventListener('pageshow', onPageShow)
    return () => {
      window.removeEventListener('pageshow', onPageShow)
      wrapperEl = null
      curtainEl = null
    }
  }, [])

  return (
    <div className="transition" ref={wrapper} aria-hidden="true">
      <div className="page-courtain" ref={curtain} />
    </div>
  )
}
