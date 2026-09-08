'use client'

import { useEffect, useRef } from 'react'

/**
 * Port of the original wondr paper.js `.blob` canvas — the mouse-reactive
 * morphing ring that orbits the hero image. Faithful to the theme JS:
 *
 *  - a circle flattened to ~1.5px-per-unit segments and smoothed, rotated
 *    randomly, fit to a rect that is the canvas minus 2×10% margins
 *  - every frame: group rotates -0.6deg; each segment gets
 *      momentum += sin/cos(time + 2*i) * offset   (breathing wobble)
 *      cursor near (< threshold) → segment pushed AWAY from the pointer
 *      momentum damped ×0.6, segment drifts back to its control point
 *  - stroke color pink on light pages, drawn at 1px
 *
 * Implemented directly on 2D canvas so no paper.js dependency is added.
 * Sits inside the hero image wrapper; sized by CSS (1100×1100 desktop,
 * 580 mobile like the original).
 */
export default function BlobCanvas({
  color = '#EAA098',
  strokeWidth = 1,
  className = '',
}: {
  color?: string
  strokeWidth?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let mouse = { x: -1000, y: -1000 }
    let settings: { dx: number; dy: number; mx: number; my: number }[] = []
    let control: { x: number; y: number }[] = []
    let points: { x: number; y: number }[] = []
    let cx = 0
    let cy = 0
    let threshold = 0
    let rotation = 0

    const SEGMENTS = 68

    const setup = () => {
      const w = canvas.clientWidth || 1100
      const h = canvas.clientHeight || 1100
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cx = w / 2
      cy = h / 2
      const r = Math.min(w, h) / 2 * 0.7
      threshold = 1.4 * r

      points = []
      control = []
      settings = []
      const randomRot = Math.random() * Math.PI
      for (let i = 0; i < SEGMENTS; i++) {
        const a = randomRot + (i / SEGMENTS) * Math.PI * 2
        const wob = 1 + Math.sin(i * 2.399) * 0.02 // golden-angle jitter ≈ flatten+smooth irregularity
        const x = cx + Math.cos(a) * r * wob
        const y = cy + Math.sin(a) * r * wob
        points.push({ x, y })
        control.push({ x, y })
        settings.push({ dx: r / 200, dy: r / 200, mx: 0, my: 0 })
      }
      canvas.classList.add('is-anim')
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => {
      mouse = { x: -1000, y: -1000 }
    }

    const parent = canvas.parentElement
    parent?.addEventListener('mousemove', onMove, { passive: true })
    parent?.addEventListener('mouseleave', onLeave)

    const draw = (time: number) => {
      rotation -= 0.6 * (Math.PI / 180)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = strokeWidth

      const px: number[] = []
      const py: number[] = []
      for (let i = 0; i < SEGMENTS; i++) {
        const s = settings[i]
        const c = control[i]

        // cursor dent: push away from pointer when inside threshold
        const vx = mouse.x - c.x
        const vy = mouse.y - c.y
        const dist = Math.hypot(vx, vy)
        let pushX = 0
        let pushY = 0
        if (dist < threshold && dist > 0) {
          const h = 0.1 * (dist - threshold)
          pushX = (vx / dist) * h
          pushY = (vy / dist) * h
        }

        // breathing wobble — original: sin/cos(time + 2*segmentIndex)
        const f = Math.sin(time + 2 * i)
        const C = Math.cos(time + 2 * i)
        s.mx += C * -s.dx + -pushX * 0.5
        s.my += f * -s.dy + -pushY * 0.5

        // spring back to control point (divide by 6), damp ×0.6
        const backX = (points[i].x - c.x) / 6
        const backY = (points[i].y - c.y) / 6
        s.mx = (s.mx - backX) * 0.6
        s.my = (s.my - backY) * 0.6

        // apply within the rotating frame
        const a = rotation
        const cos = Math.cos(a)
        const sin = Math.sin(a)
        const lx = c.x + s.mx - cx
        const ly = c.y + s.my - cy
        px.push(cx + lx * cos - ly * sin)
        py.push(cy + lx * sin + ly * cos)
      }

      // smooth closed curve through the points
      ctx.moveTo((px[0] + px[SEGMENTS - 1]) / 2, (py[0] + py[SEGMENTS - 1]) / 2)
      for (let i = 0; i < SEGMENTS; i++) {
        const next = (i + 1) % SEGMENTS
        const midX = (px[i] + px[next]) / 2
        const midY = (py[i] + py[next]) / 2
        ctx.quadraticCurveTo(px[i], py[i], midX, midY)
      }
      ctx.closePath()
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }

    setup()
    raf = requestAnimationFrame(draw)

    const onResize = () => setup()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      parent?.removeEventListener('mousemove', onMove)
      parent?.removeEventListener('mouseleave', onLeave)
      canvas.classList.remove('is-anim')
    }
  }, [color, strokeWidth])

  return <canvas ref={canvasRef} className={`hero-blob-canvas ${className}`} aria-hidden="true" />
}
