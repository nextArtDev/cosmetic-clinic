'use client'

import { cn } from '@/lib/utils'

interface MarqueeProps {
  children: React.ReactNode
  className?: string
  reverse?: boolean
}

/**
 * CSS marquee used across the kosar landing (insurers strip, brand logos).
 * Respects prefers-reduced-motion via the `.v1-marquee` utility.
 */
export default function Marquee({
  children,
  className,
  reverse = false,
}: MarqueeProps) {
  return (
    <div className={cn('relative flex w-full overflow-hidden py-2', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center gap-12 whitespace-nowrap pr-12',
          reverse ? 'v1-marquee-reverse' : 'v1-marquee',
        )}
      >
        {children}
        {children}
      </div>
    </div>
  )
}
