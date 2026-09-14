'use client'

import { useEffect, useRef } from 'react'

/**
 * Trailing custom cursor — port of the sibling route's implementation
 * (`app/v6/components/CustomCursor.tsx`), re-labelled for the /v10 UI.
 *
 * A 64px ring follows the pointer on a raw rAF translate (CSS transition
 * does the smoothing) and morphs by state, driven purely by the
 * `data-cursor="…"` attribute on whatever sits under the pointer:
 *
 *   data-cursor="view"     → ring shrinks to a dot            (links, cards)
 *   data-cursor="drag"     → "بکشید" pill                     (drag rails)
 *   data-cursor="book"     → filled pill with the CTA label   (primary CTAs)
 *   data-cursor="discover" → mid-size ring with a label       (image zones)
 *
 * Desktop pointers only: touch and `prefers-reduced-motion` keep the native
 * cursor, and the element stays `display:none` until the effect activates it
 * — so nothing is rendered that a mouse-less visitor could ever see.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    const cursor = ref.current
    if (!cursor) return

    cursor.classList.add('is-active')
    document.documentElement.classList.add('v10-cursor-hidden')

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let visible = false

    const apply = (state: string, label: string) => {
      cursor.className = `v10-cursor is-active is-${state}`
      const el = cursor.querySelector('.v10-cursor-label')
      if (el) el.textContent = label
    }

    const onMove = (event: MouseEvent) => {
      x = event.clientX
      y = event.clientY
      if (!visible) {
        visible = true
        cursor.classList.add('is-visible')
      }
      const target = (event.target as HTMLElement | null)?.closest?.('[data-cursor]')
      if (target) {
        const key = target.getAttribute('data-cursor') ?? 'view'
        apply(key, LABELS[key] ?? LABELS.view)
      } else {
        apply('default', '')
      }
    }

    const onLeave = () => {
      visible = false
      cursor.classList.remove('is-visible')
    }

    let raf = 0
    const loop = () => {
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.documentElement.classList.remove('v10-cursor-hidden')
    }
  }, [])

  return (
    <div ref={ref} className="v10-cursor" aria-hidden="true">
      <span className="v10-cursor-label" />
      <svg className="v10-cursor-arrow" width="22" height="12" viewBox="0 0 22 12" fill="none">
        <path
          d="M21 6H1M6.2 1L1.2 6l5 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

const LABELS: Record<string, string> = {
  view: 'مشاهده',
  drag: 'بکشید',
  book: 'رزرو نوبت',
  discover: 'کاوش',
}
