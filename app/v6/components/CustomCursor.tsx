'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const LABELS: Record<string, string> = {
  cta: 'بیشتر بدانید',
  menu: 'منو',
  discover: 'کاوش',
  drag: 'بکشید',
  book: 'رزرو نوبت',
  view: 'مشاهده',
}

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [label, setLabel] = useState<string | null>(null)
  const [hovering, setHovering] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 900, damping: 60, mass: 0.35 })
  const sy = useSpring(y, { stiffness: 900, damping: 60, mass: 0.35 })

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    const enable = () => setEnabled(true)
    enable()
    document.documentElement.classList.add('cursor-hidden')

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const target = (e.target as HTMLElement | null)?.closest?.('[data-cursor]')
      if (target) {
        const key = target.getAttribute('data-cursor') ?? ''
        setLabel(LABELS[key] ?? key)
        setHovering(true)
      } else {
        setHovering(false)
      }
    }
    const onLeave = () => setHovering(false)

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.documentElement.classList.remove('cursor-hidden')
    }
  }, [x, y])

  if (!enabled) return null

  return (
    <motion.div className="cursor-dot" style={{ x: sx, y: sy }} aria-hidden="true">
      <motion.div
        className="relative -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={{
          width: hovering ? 96 : 14,
          height: hovering ? 96 : 14,
          backgroundColor: hovering ? 'rgba(234,160,152,1)' : 'rgba(35,31,32,1)',
        }}
        transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.span
          className="absolute left-1/2 top-1/2 w-[10rem] -translate-x-1/2 -translate-y-1/2 text-center text-[1.2rem] font-bold leading-[1.6rem] text-ink"
          animate={{ opacity: hovering ? 1 : 0, x: hovering ? 0 : -20 }}
          transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        >
          {label}
        </motion.span>
      </motion.div>
    </motion.div>
  )
}
