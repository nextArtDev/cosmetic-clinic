'use client'

import { useEffect, useRef, useState } from 'react'

const LABELS: Record<string, { label: string; mode: 'menu' | 'discover' | 'cta' | 'hover' }> = {
  menu: { label: 'منو', mode: 'menu' },
  discover: { label: 'کاوش', mode: 'discover' },
  view: { label: 'مشاهده', mode: 'discover' },
  cta: { label: 'بیشتر بدانید', mode: 'cta' },
  book: { label: 'رزرو نوبت', mode: 'cta' },
  drag: { label: 'بکشید', mode: 'cta' },
}

/**
 * Port of the original wondr cursor — a trailing 6.4rem ring that follows
 * the mouse via rAF (no springs: raw translate each frame, CSS transition
 * smooths it), with states:
 *   .is-hover    — generic link: ring shrinks to a pink dot
 *   .is-menu     — menu button: ring morphs to a white blob ×2 with label
 *   .is-discover — discover zones: white blob ×1.5 with label
 *   .is-cta      — magnetic zones (goo canvases): ring fills white, label
 *                  slides to the side with an arrow (mirrored RTL)
 * Listens to `v6-cursor-state` events from BlobCta canvases so the gooey
 * card canvases drive the cta state, exactly like the original's
 * $(".cursor").addClass("cta arrow white") calls.
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    const enable = () => setEnabled(true)
    enable()
    document.documentElement.classList.add('cursor-hidden')

    const cursor = cursorRef.current
    let x = -100
    let y = -100
    let ctaForced = false

    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      if (!cursor) return
      const target = (e.target as HTMLElement | null)?.closest?.('[data-cursor]')
      if (target) {
        const key = target.getAttribute('data-cursor') ?? ''
        const entry = LABELS[key] ?? { label: key, mode: 'hover' as const }
        cursor.className = `cursor is-${entry.mode}`
        const label = cursor.querySelector('.cursor__label')
        if (label) label.textContent = entry.label
      } else if (!ctaForced) {
        cursor.className = 'cursor'
      }
    }
    const onLeave = () => {
      if (cursor) cursor.className = 'cursor'
    }

    // Magnetic goo canvases force the cta state while the pointer hovers
    const onGoo = (e: Event) => {
      const detail = (e as CustomEvent<{ cta?: boolean }>).detail
      ctaForced = Boolean(detail?.cta)
      if (!cursor) return
      if (ctaForced) {
        cursor.className = 'cursor is-cta'
        const label = cursor.querySelector('.cursor__label')
        if (label) label.textContent = 'بیشتر بدانید'
      } else if (cursor.classList.contains('is-cta')) {
        cursor.className = 'cursor'
      }
    }
    document.addEventListener('v6-cursor-state', onGoo)

    const loop = () => {
      if (cursor) cursor.style.transform = `translate(${x}px, ${y}px)`
      requestAnimationFrame(loop)
    }
    const raf = requestAnimationFrame(loop)

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('v6-cursor-state', onGoo)
      document.documentElement.classList.remove('cursor-hidden')
    }
  }, [])

  if (!enabled) return null

  return (
    <div ref={cursorRef} className="cursor" aria-hidden="true">
      <span className="cursor__label">کاوش</span>
      <svg className="cursor__arrow" width="26" height="14" viewBox="0 0 26 14" fill="none">
        <g>
          <path
            d="M1 6.8999H25"
            stroke="#231F20"
            strokeWidth="2"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.1001 1L25.0001 6.9L19.1001 12.8"
            stroke="#231F20"
            strokeWidth="2"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  )
}
