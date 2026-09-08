'use client'

import { useEffect, useRef } from 'react'

/** Custom pink cursor — mounted only inside /v11, restores the system
 * cursor on unmount so production pages are untouched. The container is
 * hidden via inline style and revealed by the effect (no state needed).
 */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const rootEl = root.current
    if (!rootEl) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    rootEl.style.display = 'block'

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let scale = 1
    let targetScale = 1
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (dot.current) {
        dot.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`
      }
      const el = e.target as HTMLElement | null
      const interactive = el?.closest("a, button, input, [data-cursor='hover']")
      targetScale = interactive ? 2.6 : 1
    }

    const loop = () => {
      ringX += (mouseX - ringX) * 0.14
      ringY += (mouseY - ringY) * 0.14
      scale += (targetScale - scale) * 0.14
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${scale})`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(loop)
    document.documentElement.style.cursor = 'none'

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      rootEl.style.display = 'none'
      document.documentElement.style.cursor = ''
    }
  }, [])

  return (
    <div
      ref={root}
      className="scmd:pointer-events-none scmd:fixed scmd:inset-0 scmd:z-[999]"
      style={{ display: 'none' }}
      aria-hidden
    >
      <div
        ref={ring}
        className="scmd:absolute scmd:left-0 scmd:top-0 scmd:rounded-full scmd:border scmd:transition-opacity scmd:duration-500"
        style={{
          width: '2.2em',
          height: '2.2em',
          borderColor: 'rgba(207,1,143,0.55)',
          borderWidth: '1px',
        }}
      />
      <div
        ref={dot}
        className="scmd:absolute scmd:left-0 scmd:top-0 scmd:rounded-full"
        style={{
          width: '0.4em',
          height: '0.4em',
          backgroundColor: 'var(--pink)',
        }}
      />
    </div>
  )
}
