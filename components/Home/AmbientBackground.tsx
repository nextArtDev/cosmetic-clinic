'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AmbientBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional custom base background color.
   * @default "bg-[oklch(13%_0.014_46)]"
   */
  baseColor?: string

  /**
   * Optional custom radial gradient.
   * @default "bg-[radial-gradient(90%_70%_at_50%_28%,oklch(21%_0.03_50)_0%,oklch(12%_0.012_44)_70%)]"
   */
  gradient?: string

  /**
   * Disable blob animations (useful for performance or reduced-motion preferences).
   * @default false
   */
  disableAnimation?: boolean
}

// Default blob configurations using complementary OKLCH colors for a cohesive dark-warm theme
const defaultBlobs = [
  {
    className:
      'absolute -left-[10%] -top-[10%] h-[55%] w-[55%] rounded-full bg-[oklch(28%_0.04_50)]/40 blur-[120px]',
    animate: { x: ['0%', '5%', '0%'], y: ['0%', '4%', '0%'] },
    transition: { duration: 26, repeat: Infinity, ease: 'easeInOut' as const },
  },
  {
    className:
      'absolute -bottom-[12%] -right-[10%] h-[60%] w-[60%] rounded-full bg-[oklch(22%_0.035_45)]/50 blur-[130px]',
    animate: { x: ['0%', '-5%', '0%'], y: ['0%', '-4%', '0%'] },
    transition: { duration: 32, repeat: Infinity, ease: 'easeInOut' as const },
  },
  {
    className:
      'absolute left-[35%] top-[35%] h-[45%] w-[45%] rounded-full bg-[oklch(32%_0.02_60)]/30 blur-[110px]',
    animate: { x: ['0%', '6%', '0%'], y: ['0%', '-5%', '0%'] },
    transition: { duration: 22, repeat: Infinity, ease: 'easeInOut' as const },
  },
]

export function AmbientBackground({
  className,
  baseColor,
  gradient,
  disableAnimation = false,
  ...props
}: AmbientBackgroundProps) {
  const resolvedBaseColor = baseColor ?? 'bg-[oklch(13%_0.014_46)]'
  const resolvedGradient =
    gradient ??
    'bg-[radial-gradient(90%_70%_at_50%_28%,oklch(21%_0.03_50)_0%,oklch(12%_0.012_44)_70%)]'

  return (
    <div
      className={cn(
        'absolute inset-0 -z-20 overflow-hidden',
        resolvedBaseColor,
        className,
      )}
      {...props}
    >
      {/* Warm gradient wash */}
      <div className={cn('absolute inset-0', resolvedGradient)} />

      {/* Slow drifting soft-focus blobs */}
      {defaultBlobs.map((blob, index) => (
        <motion.div
          key={index}
          className={blob.className}
          animate={disableAnimation ? undefined : blob.animate}
          transition={blob.transition}
        />
      ))}
    </div>
  )
}
