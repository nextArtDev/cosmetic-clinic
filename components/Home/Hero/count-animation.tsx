'use client'

import { cn } from '@/lib/utils'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

export default function CountAnimation({
  number,
  className,
  duration,
}: {
  number: number
  className?: string
  duration?: number
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)

  useEffect(() => {
    const animation = animate(count, number, { duration: duration || 2 })

    return animation.stop
  }, [])

  return <motion.h1 className={cn(className)}>{rounded}</motion.h1>
}
