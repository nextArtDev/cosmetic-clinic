// tier-badge.tsx
'use client'
import { useRenderTier } from './render-tier'

export function TierBadge({ ready }: { ready?: boolean }) {
  const tier = useRenderTier()
  if (process.env.NODE_ENV === 'production') return null
  return (
    <span
      className="absolute bottom-4 end-4 z-10 rounded-full border border-[var(--cc-border)]
                     bg-[color-mix(in_oklch,var(--cc-bg)_75%,transparent)] px-2 py-1
                     text-[9px] tracking-[0.16em] text-[var(--cc-ink-muted)]"
    >
      {tier}
      {ready === undefined ? '' : ready ? ' · canvas' : ' · css'}
    </span>
  )
}
