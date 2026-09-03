'use client'

import Image from 'next/image'
import { motion, useAnimationFrame, useMotionValue, type MotionValue } from 'framer-motion'
import type { ComparisonItem } from './types'

export interface FallbackStageProps {
  item: ComparisonItem
  progress: MotionValue<number>
  preview: MotionValue<number | null>
}

/**
 * Plain layered-image compare, used when WebGL is unavailable. Reads the
 * same `progress`/`preview` motion values as the shader stage so behavior
 * (scroll-scrub, hold-to-reveal) is identical from the outside — only the
 * transition mechanic (a soft wipe instead of a shader) differs.
 */
export function FallbackStage({ item, progress, preview }: FallbackStageProps) {
  const clipPath = useMotionValue('inset(100% 0 0 0)')

  useAnimationFrame(() => {
    const overridden = preview.get()
    const value = Math.max(0, Math.min(1, overridden ?? progress.get()))
    clipPath.set(`inset(${100 - value * 100}% 0 0 0)`)
  })

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Image
        src={item.before?.src ?? item.after.src}
        alt={item.before?.alt ?? `${item.procedureLabel} — before`}
        fill
        draggable={false}
        sizes="(max-width: 640px) 84vw, 400px"
        style={{ WebkitTouchCallout: 'none' }}
        className="pointer-events-none object-cover grayscale-[0.35] contrast-[0.92]"
        priority={false}
      />
      <motion.div className="absolute inset-0" style={{ clipPath }}>
        <Image
          src={item.after.src}
          alt={item.after.alt}
          fill
          draggable={false}
          sizes="(max-width: 640px) 84vw, 400px"
          style={{ WebkitTouchCallout: 'none' }}
          className="pointer-events-none object-cover"
          priority={false}
        />
      </motion.div>
    </div>
  )
}
