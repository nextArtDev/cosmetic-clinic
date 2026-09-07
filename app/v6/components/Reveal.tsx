'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

const EASE = [0.76, 0, 0.24, 1] as const

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  x?: number
  skew?: number
  duration?: number
  as?: 'div' | 'span' | 'li' | 'section'
  once?: boolean
}

export default function Reveal({
  children,
  className = '',
  delay = 0,
  y = 60,
  x = -40,
  skew = 5,
  duration = 0.8,
  as = 'div',
  once = true,
}: RevealProps) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as]

  if (reduced) {
    const Tag = as
    return (
      <Tag className={className}>
        {children}
      </Tag>
    )
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, x, y, skewY: skew }}
      whileInView={{ opacity: 1, x: 0, y: 0, skewY: 0 }}
      viewport={{ once, margin: '0px 0px -12% 0px' }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  )
}

export function RevealItem({
  children,
  className = '',
  index = 0,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  index?: number
  as?: 'div' | 'span' | 'li' | 'section'
}) {
  return (
    <Reveal as={as} className={className} delay={index * 0.09} y={40} x={-24} skew={4}>
      {children}
    </Reveal>
  )
}
