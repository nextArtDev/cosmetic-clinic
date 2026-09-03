'use client'

import { useEffect, useMemo, useRef } from 'react'
import './double-helix-glass-pentagons.css'

// ✅ Items are now images. Strings (URLs) still work for convenience.
export type HelixImageItem = {
  src: string
  alt?: string
  label?: string // optional caption overlay (remove if you don't want it)
}

type DoubleHelixGlassPentagonsProps = {
  items?: (string | HelixImageItem)[]
  className?: string
}

type CardRecord = {
  el: HTMLDivElement
  base: number
  phase: number
}

type Viewport = {
  span: number
  radius: number
}

const config = {
  scene: {
    strands: 2,
    perStrand: 20,
    turns: 2,
    speed: 0.25,
    spanFactor: 1.5,
  },
  appearance: {
    brightnessFloor: 0.16,
    maxBlur: 5,
  },
  breakpoints: [
    {
      minWidth: 1440,
      radius: 560,
      perspective: 1400,
      cardWidth: 240,
      cardHeight: 230,
    },
    {
      minWidth: 1024,
      radius: 420,
      perspective: 1200,
      cardWidth: 210,
      cardHeight: 200,
    },
    {
      minWidth: 640,
      radius: 310,
      perspective: 1000,
      cardWidth: 165,
      cardHeight: 155,
    },
    {
      minWidth: 0,
      radius: 220,
      perspective: 850,
      cardWidth: 126,
      cardHeight: 118,
    },
  ],
  interaction: {
    friction: 0.94,
    minMomentum: 0.0005,
  },
} as const

const wrap = (value: number, length: number) =>
  ((value % length) + length) % length

const helixAngle = (progress: number, phase: number) =>
  progress * config.scene.turns * 2 * Math.PI + phase

const depthOf = (angle: number) => (Math.cos(angle) + 1) / 2

const helixTransform = (angle: number, y: number, radius: number) =>
  `translate(-50%, -50%) rotateY(${angle.toFixed(4)}rad) translateZ(${radius}px) translateY(${y.toFixed(1)}px)`

const depthFilter = (depth: number) => {
  const brightness =
    config.appearance.brightnessFloor +
    (1 - config.appearance.brightnessFloor) * depth * depth
  const blur = (1 - depth) * (1 - depth) * config.appearance.maxBlur
  return `brightness(${brightness.toFixed(3)}) blur(${blur.toFixed(2)}px)`
}

const pickBreakpoint = () =>
  config.breakpoints.find((bp) => window.innerWidth >= bp.minWidth) ??
  config.breakpoints[config.breakpoints.length - 1]

// ✅ Normalize: allow plain URL strings or { src, alt, label } objects
const normalizeItem = (item: string | HelixImageItem): HelixImageItem =>
  typeof item === 'string' ? { src: item } : item

export default function DoubleHelixGlassPentagons({
  items = [],
  className = '',
}: DoubleHelixGlassPentagonsProps) {
  const sceneRef = useRef<HTMLDivElement | null>(null)
  const worldRef = useRef<HTMLDivElement | null>(null)

  // ✅ Fallback now generates demo images so the scene still works with no props
  const fallbackItems = useMemo<HelixImageItem[]>(
    () =>
      Array.from(
        { length: config.scene.strands * config.scene.perStrand },
        (_, i) => ({
          src: `https://picsum.photos/seed/dhelix-${i}/480/480`,
          alt: `Demo image ${i + 1}`,
        }),
      ),
    [],
  )

  // ✅ Memoized so the effect doesn't rebuild the DOM on every render
  const allItems = useMemo(
    () => (items.length > 0 ? items.map(normalizeItem) : fallbackItems),
    [items, fallbackItems],
  )

  useEffect(() => {
    const scene = sceneRef.current
    const world = worldRef.current
    if (!scene || !world) return

    let frameId = 0
    let destroyed = false

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const view: Viewport = { span: 0, radius: 0 }

    const applyViewport = () => {
      const bp = pickBreakpoint()
      view.span = window.innerHeight * config.scene.spanFactor
      view.radius = bp.radius

      scene.style.setProperty('--card-width', `${bp.cardWidth}px`)
      scene.style.setProperty('--card-height', `${bp.cardHeight}px`)
      scene.style.setProperty('--perspective', `${bp.perspective}px`)
    }

    applyViewport()
    window.addEventListener('resize', applyViewport)

    world.innerHTML = ''

    const cards: CardRecord[] = []

    for (let strand = 0; strand < config.scene.strands; strand++) {
      for (let index = 0; index < config.scene.perStrand; index++) {
        const itemIndex =
          (strand * config.scene.perStrand + index) % allItems.length
        const item = allItems[itemIndex] // ✅ already normalized

        const card = document.createElement('div')
        card.className = 'dhg-pentagon'

        const shape = document.createElement('div')
        shape.className = 'dhg-pentagon-shape'

        // ✅ Image instead of text
        const img = document.createElement('img')
        img.className = 'dhg-pentagon-image'
        img.src = item.src
        img.alt = item.alt ?? ''
        img.loading = 'lazy'
        img.decoding = 'async'
        img.draggable = false // don't let native image drag fight the helix drag
        img.addEventListener('error', () =>
          img.classList.add('dhg-pentagon-image--error'),
        )

        const glow = document.createElement('div')
        glow.className = 'dhg-pentagon-glow'

        shape.appendChild(img)
        shape.appendChild(glow) // glow stays on top for the glass highlight

        // ✅ Optional caption — delete this block if you never want text
        if (item.label) {
          const label = document.createElement('div')
          label.className = 'dhg-pentagon-label'
          label.textContent = item.label
          shape.appendChild(label)
        }

        card.appendChild(shape)
        world.appendChild(card)

        cards.push({
          el: card,
          base: index,
          phase: (strand / config.scene.strands) * 1.5 * Math.PI,
        })
      }
    }

    const sensitivityFor = (radius: number) =>
      (1 / radius) *
      (config.scene.perStrand / (config.scene.turns * 1.5 * Math.PI))

    const drag = {
      travel: 0,
      velocity: 0,
      dragging: false,
      lastX: 0,
      lastMoveTime: 0,
    }

    const onPointerDown = (e: PointerEvent) => {
      drag.dragging = true
      drag.velocity = 0
      drag.lastX = e.clientX
      drag.lastMoveTime = e.timeStamp
      scene.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.dragging) return

      const dx = e.clientX - drag.lastX
      const dt = (e.timeStamp - drag.lastMoveTime) / 1000

      drag.lastX = e.clientX
      drag.lastMoveTime = e.timeStamp

      const dTravel = dx * sensitivityFor(view.radius)
      drag.travel += dTravel

      if (dt > 0) drag.velocity = dTravel / dt
    }

    const onPointerUp = () => {
      drag.dragging = false
    }

    scene.addEventListener('pointerdown', onPointerDown)
    scene.addEventListener('pointermove', onPointerMove)
    scene.addEventListener('pointerup', onPointerUp)
    scene.addEventListener('pointercancel', onPointerUp)
    scene.addEventListener('pointerleave', onPointerUp)

    const start = performance.now()
    let lastFrame = start

    const animate = (now: number) => {
      if (destroyed) return

      const elapsed = reducedMotion.matches ? 0 : (now - start) / 1000
      const dt = Math.min((now - lastFrame) / 1000, 0.1)
      lastFrame = now

      if (!drag.dragging && drag.velocity !== 0) {
        drag.travel += drag.velocity * dt
        drag.velocity *= Math.pow(config.interaction.friction, dt * 60)
        if (Math.abs(drag.velocity) < config.interaction.minMomentum) {
          drag.velocity = 0
        }
      }

      for (const card of cards) {
        const progress =
          wrap(
            card.base + elapsed * config.scene.speed + drag.travel,
            config.scene.perStrand,
          ) / config.scene.perStrand

        const angle = helixAngle(progress, card.phase)
        const y = (progress - 0.5) * view.span

        card.el.style.transform = helixTransform(angle, y, view.radius)
        card.el.style.filter = depthFilter(depthOf(angle))
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => {
      destroyed = true
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', applyViewport)
      scene.removeEventListener('pointerdown', onPointerDown)
      scene.removeEventListener('pointermove', onPointerMove)
      scene.removeEventListener('pointerup', onPointerUp)
      scene.removeEventListener('pointercancel', onPointerUp)
      scene.removeEventListener('pointerleave', onPointerUp)
    }
  }, [allItems])

  return (
    <div
      ref={sceneRef}
      className={`dhg-scene relative h-screen overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none ${className}`}
    >
      <div ref={worldRef} className="dhg-world absolute inset-0" />
      <div className="dhg-vignette pointer-events-none absolute inset-0" />
    </div>
  )
}
