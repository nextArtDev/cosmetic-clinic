'use client'

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Reveal primitives — faithful port of the grind Reveal.tsx. Persian is
 * cursive: LineReveal's masked slide stays word/line-safe because the
 * unit is the whole line, and WordReveal splits on spaces (never
 * letters), so joining never breaks.
 */

/* Slide-up reveal for lines of display text (masked with overflow hidden) */
export function LineReveal({
  children,
  delay = 0,
  className,
  once = true,
}: {
  children: ReactNode
  delay?: number
  className?: string
  once?: boolean
}) {
  return (
    <span className={`tg:block tg:overflow-hidden ${className ?? ''}`}>
      <motion.span
        className="tg:block tg:will-change-transform"
        initial={{ y: '110%', rotate: 3 }}
        whileInView={{ y: '0%', rotate: 0 }}
        viewport={{ once, margin: '-10% 0px' }}
        transition={{
          duration: 0.9,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/* Fade + rise for blocks */
export function FadeUp({
  children,
  delay = 0,
  className,
  y = 40,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* Word-by-word stagger reveal */
const wordContainer: Variants = {
  hidden: {},
  visible: (stagger: number = 0.04) => ({
    transition: { staggerChildren: stagger },
  }),
}

const wordChild: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

export function WordReveal({
  text,
  className,
  stagger = 0.04,
}: {
  text: string
  className?: string
  stagger?: number
}) {
  const words = text.split(' ')
  return (
    <motion.span
      className={className}
      variants={wordContainer}
      custom={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-15% 0px' }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordChild}
          className="tg:inline-block tg:will-change-transform"
          aria-hidden
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.span>
  )
}
