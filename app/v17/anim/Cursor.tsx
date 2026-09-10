'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import s from '../privy.module.css'

/**
 * Bespoke pointer follower (the original's `cursor` plugin): a lagging gold
 * ring plus a precise dot that swells over interactive elements. Desktop
 * fine-pointer only. The elements always mount (SSR-stable) and stay
 * invisible until the effect arms them, so reduced-motion and touch users
 * never see a stray cursor.
 */
export default function Cursor() {
  const reduced = useReducedMotion()
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const hoverClass = s.cursorIsHover

  useEffect(() => {
    if (reduced) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const ring = ringRef.current
    const dot = dotRef.current
    if (!ring || !dot) return

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let rx = x
    let ry = y
    let raf = 0
    let armed = false

    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      if (!armed) {
        armed = true
        ring.style.opacity = '1'
        dot.style.opacity = '1'
      }
    }
    const loop = () => {
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    const over = (e: Event) => {
      const target = (e.target as Element | null)?.closest('a, button, [data-cursor]')
      ring.classList.toggle(hoverClass, !!target)
    }
    const leave = () => ring.classList.remove(hoverClass)

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.removeEventListener('pointerleave', leave)
    }
  }, [reduced, hoverClass])

  return (
    <>
      <div className={s.cursor} ref={ringRef} style={{ opacity: 0 }} aria-hidden="true" />
      <div className={s.cursorDot} ref={dotRef} style={{ opacity: 0 }} aria-hidden="true" />
    </>
  )
}
