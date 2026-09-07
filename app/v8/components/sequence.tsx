'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion, type MotionValue } from 'framer-motion'

/**
 * Scroll-scrubbed canvas frame sequences. The original ran from
 * /media/sequences/*.webp; those 120 frames are not downloadable one by
 * one, so the sequence draws a single static fallback frame that the
 * scroll progress can still scrub across (duplicated frames), keeping
 * the section layout and ready-state transitions identical.
 */
export function ProductSequence({
  name,
  count,
  progress,
  fallback = 'product-intro.webp',
  className = '',
  label = 'محیط درمانی کلینیک',
}: {
  name: 'intro' | 'touch' | 'detail'
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

  const draw = useCallback((index: number) => {
    const ctx = canvas.current?.getContext('2d')
    const el = canvas.current
    const img = image.current
    if (!ctx || !el || !img || !img.naturalWidth) return
    // Gently settle toward the "current" frame — with a single source
    // frame this is a no-op visually, but keeps the scrub contract.
    void index
    if (el.width !== img.naturalWidth || el.height !== img.naturalHeight) {
      el.width = img.naturalWidth
      el.height = img.naturalHeight
    }
    ctx.clearRect(0, 0, el.width, el.height)
    ctx.drawImage(img, 0, 0)
  }, [])

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
    if (reduced) return
    const update = (value: number) => {
      const frame = Math.max(0, Math.min(count - 1, Math.round(value * (count - 1))))
      if (current.current !== frame) {
        current.current = frame
        draw(frame)
      }
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
