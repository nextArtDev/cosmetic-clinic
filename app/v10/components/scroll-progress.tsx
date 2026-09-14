'use client'

import { useEffect, useRef } from 'react'

/**
 * Hairline scroll-progress bar pinned to the top of the viewport.
 *
 * Reads `window.scrollY` inside a rAF loop rather than listening to scroll
 * events, because Lenis drives the page from its own ticker and the native
 * scroll event can arrive a frame late — the bar would visibly lag the
 * page. Scaling a single element (transform only) keeps it off the layout
 * and paint paths.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let last = -1

    const loop = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0
      if (Math.abs(progress - last) > 0.0005) {
        last = progress
        el.style.transform = `scaleX(${progress})`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="v10-progress" aria-hidden="true">
      <div ref={ref} className="v10-progress-fill" />
    </div>
  )
}
