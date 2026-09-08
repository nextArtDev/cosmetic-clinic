'use client'

import { useRef, type ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'

/**
 * Magnetic hover wrapper — the element gently follows the cursor and
 * springs back on leave, like the reference site's CTA buttons.
 * Disabled for touch pointers and reduced-motion users.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 160, damping: 14, mass: 0.2 })
  const sy = useSpring(y, { stiffness: 160, damping: 14, mass: 0.2 })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || window.matchMedia('(pointer: coarse)').matches) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left - rect.width / 2) * strength)
    y.set((e.clientY - rect.top - rect.height / 2) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, display: 'inline-flex' }}
    >
      {children}
    </motion.div>
  )
}
