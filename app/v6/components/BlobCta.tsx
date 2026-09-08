'use client'

import { useEffect, useRef } from 'react'

/**
 * Port of the original wondr `.blob-cta` paper.js canvas — the magnetic
 * circle that lives behind every treatment/product card:
 *  - idle: a large grey ring (flattened/smoothed circle, #A4A7AA @40%)
 *  - cursor within 225px: ring switches to an ink→sky gradient fill and
 *    a small pink blob follows the cursor (both merged through the SVG
 *    `#v6-goo` gooey filter), and the custom cursor switches to its
 *    cta/arrow state ("more info")
 *  - original also navigated on click via barba — here the card's own
 *    anchor handles the click; the canvas only animates.
 *
 * The canvas talks to the custom cursor via the `v6-cursor-state` event
 * (bubbled CustomEvent) so no global state is shared with production.
 */
export default function BlobCta() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gooeyRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const THRESHOLD = 225
    let raf = 0
    let mouse = { x: -1000, y: -1000 }
    let active = false
    let blobX = 0
    let blobY = 0

    const setGooey = (on: boolean) => {
      if (gooeyRef.current === on) return
      gooeyRef.current = on
      canvas.classList.toggle('gooey', on)
      // tell the custom cursor to enter/leave its cta state
      canvas.dispatchEvent(
        new CustomEvent('v6-cursor-state', {
          bubbles: true,
          detail: { cta: on },
        }),
      )
    }

    const setup = () => {
      const w = canvas.clientWidth || 600
      const h = canvas.clientHeight || 700
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      blobX = w / 2
      blobY = h / 2
    }

    // The card wrapper listens on the whole card (matches original card hover)
    const card = (canvas.closest('[data-blob-cta-card]') ?? canvas) as HTMLElement
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const dist = Math.hypot(mouse.x - rect.width / 2, mouse.y - rect.height / 2)
      const now = dist < THRESHOLD
      if (now !== active) {
        active = now
        setGooey(now)
      }
    }
    const onLeave = () => {
      mouse = { x: -1000, y: -1000 }
      active = false
      setGooey(false)
    }

    card.addEventListener('mousemove', onMove as (e: Event) => void, { passive: true } as AddEventListenerOptions)
    card.addEventListener('mouseleave', onLeave as (e: Event) => void)

    const drawRing = (w: number, h: number, t: number) => {
      // ring: big morphing circle, grey idle / ink→sky gradient when gooey
      ctx.beginPath()
      const cx = w / 2
      const cy = h / 2
      const baseR = 160
      const pts = 40
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2
        // slow organic morph
        const r =
          baseR *
          (1 +
            Math.sin(a * 3 + t * 0.4) * 0.04 +
            Math.cos(a * 5 - t * 0.3) * 0.03)
        const x = cx + Math.cos(a) * r
        const y = cy + Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()

      if (gooeyRef.current) {
        const grad = ctx.createLinearGradient(200, 200, 500, 500)
        grad.addColorStop(0, '#231F20')
        grad.addColorStop(1, '#61CBEA')
        ctx.fillStyle = grad
        ctx.fill()
      } else {
        ctx.strokeStyle = '#A4A7AA'
        ctx.globalAlpha = 0.4
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }

    const drawBlob = (w: number, h: number, t: number) => {
      if (!gooeyRef.current) return
      // pink blob chasing the cursor (lerp for the gooey smear)
      blobX += (mouse.x - blobX) * 0.25
      blobY += (mouse.y - blobY) * 0.25
      ctx.beginPath()
      const baseR = 50
      const pts = 32
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2
        const r = baseR * (1 + Math.sin(a * 4 + t * 0.8) * 0.06)
        const x = blobX + Math.cos(a) * r
        const y = blobY + Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      const grad = ctx.createLinearGradient(
        w / 2 - 100,
        h / 2 - 100,
        w / 2 + 100,
        h / 2 + 100,
      )
      grad.addColorStop(0, '#FAF2F0')
      grad.addColorStop(1, '#EAA098')
      ctx.fillStyle = grad
      ctx.fill()
    }

    const draw = (t: number) => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawRing(w, h, t / 1000)
      drawBlob(w, h, t / 1000)
      raf = requestAnimationFrame(draw)
    }

    setup()
    raf = requestAnimationFrame(draw)

    const onResize = () => setup()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      card.removeEventListener('mousemove', onMove as (e: Event) => void)
      card.removeEventListener('mouseleave', onLeave as (e: Event) => void)
      setGooey(false)
    }
  }, [])

  return <canvas ref={canvasRef} className="blob-cta" aria-hidden="true" />
}
