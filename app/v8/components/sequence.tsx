'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion, type MotionValue } from 'framer-motion'

type SequenceKind = 'intro' | 'touch' | 'detail'
type Pose = { rotate: number; scale: number; y: number }

/**
 * The reference site scrubs 54–66 pre-rendered color+mask frames per
 * section through a canvas as you scroll (product unfolds, tilts and
 * rotates — sequence plugin in landing.js: progress → frame → contain-fit
 * canvas render). Those frame files are not publicly downloadable, so
 * this port synthesizes the same scroll-scrubbed motion from the single
 * product photo: every scroll position maps to a pose (rotation, scale,
 * vertical drift) re-drawn to the canvas. This preserves the original's
 * scrub feel, is-ready cross-fade, mid-frame reduced-motion fallback and
 * contain-fit rendering, without any frame assets.
 */
const choreography: Record<SequenceKind, (progress: number) => Pose> = {
  // 2.description: the product rises and unfolds as you scroll.
  intro: progress => ({
    rotate: -6 + progress * 12,
    scale: 0.88 + 0.12 * (1 - Math.abs(progress - 0.45) * 2),
    y: (0.5 - progress) * 0.07,
  }),
  // 8.two-touch: a gentle tilt-settle as the straps secure the dryer.
  touch: progress => ({
    rotate: -5 + progress * 10,
    scale: 0.92 + progress * 0.08,
    y: (1 - progress) * 0.04,
  }),
  // 10.specification: a slow inspection turn across the sticky section.
  detail: progress => ({
    rotate: -14 + progress * 28,
    scale: 0.85 + progress * 0.1,
    y: 0,
  }),
}

export function ProductSequence({
  name,
  count,
  progress,
  fallback = 'product-intro.webp',
  className = '',
  label = 'محیط درمانی کلینیک',
}: {
  name: SequenceKind
  count: number
  progress: MotionValue<number>
  fallback?: string
  className?: string
  label?: string
}) {
  const container = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const image = useRef<HTMLImageElement | null>(null)
  const current = useRef(0)
  const [ready, setReady] = useState(false)
  const reduced = useReducedMotion()
  const inView = useInView(container, { margin: '600px 0px', once: true })

  const draw = useCallback(
    (index: number) => {
      const el = canvas.current
      const img = image.current
      const ctx = el?.getContext('2d')
      if (!ctx || !el || !img || !img.naturalWidth) return
      if (el.width !== img.naturalWidth || el.height !== img.naturalHeight) {
        el.width = img.naturalWidth
        el.height = img.naturalHeight
      }
      const w = el.width
      const h = el.height
      const t = count > 1 ? index / (count - 1) : 0
      // Reduced motion keeps the original's "single mid frame" behavior.
      const pose: Pose = reduced ? { rotate: 0, scale: 1, y: 0 } : choreography[name](t)
      // Shrink while rotating so the product's corners never clip the
      // canvas (the photos are cutouts with transparent padding, so this
      // only trims empty space).
      const fit = (Math.abs(pose.rotate) > 0.5 ? 0.8 : 1) * pose.scale
      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.translate(w / 2, h / 2 + pose.y * h)
      ctx.rotate((pose.rotate * Math.PI) / 180)
      ctx.drawImage(img, (-fit * w) / 2, (-fit * h) / 2, fit * w, fit * h)
      ctx.restore()
    },
    [count, name, reduced],
  )

  useEffect(() => {
    if (!inView) return
    let cancelled = false
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (!cancelled) {
        image.current = img
        draw(current.current)
        setReady(true)
      }
    }
    img.src = `/v8/media/${fallback}`
    return () => {
      cancelled = true
    }
  }, [inView, name, count, fallback, draw])

  useEffect(() => {
    if (reduced) {
      draw(Math.floor(count * 0.55))
      return
    }
    const update = (value: number) => {
      const frame = Math.max(0, Math.min(count - 1, Math.round(value * (count - 1))))
      current.current = frame
      draw(frame)
    }
    update(progress.get())
    return progress.on('change', update)
  }, [progress, count, draw, reduced])

  return (
    <div ref={container} className={`product-sequence ${className}`}>
      <img
        className={`sequence-fallback ${ready ? 'is-ready' : ''}`}
        src={`/v8/media/${fallback}`}
        alt=""
        loading="lazy"
      />
      <canvas
        ref={canvas}
        className={ready ? 'is-ready' : ''}
        role="img"
        aria-label={label}
        width={1200}
        height={674}
      />
    </div>
  )
}
