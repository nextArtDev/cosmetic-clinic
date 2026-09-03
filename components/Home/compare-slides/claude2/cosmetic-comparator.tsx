'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ComparisonStage } from './comparison-stage'
import type { DeviceTier } from './device-tier'
import {
  useDeviceTier,
  usePrefersReducedMotion,
  useWebglSupported,
} from './hooks'

import type { CosmeticComparatorProps } from './types'
import { DEFAULT_COPY, FA_COPY, mergeCopy, mergeTheme, themeToCssVars } from './theme'

const toOrdinal = (index: number) => String(index).padStart(2, '0')

/**
 * A reusable, scroll-scrubbed before/after gallery for cosmetic-procedure
 * photography. Fully data-driven — supply `items`, optionally a `theme`,
 * `copy`, and fonts. Adapts to device capability in three tiers rather than
 * a single on/off switch: 'high' runs the full shader, 'mid' runs the same
 * shader with cheaper noise (see shaders.ts `uOctaves`) and a capped pixel
 * ratio, and 'low' (or no WebGL at all) renders `FallbackStage`, a CSS
 * clip-path comparator. Tier is measured by actually timing one of the
 * app's own shaders on the visitor's GPU — see `device-tier.ts` — not
 * guessed from device or browser identity. Freezes ambient shader motion
 * for `prefers-reduced-motion`, and lazy-mounts each stage's WebGL canvas
 * only near the viewport (`useLazyMount`) so a long gallery never holds
 * more concurrent GPU contexts than are actually on screen.
 *
 * @example
 * <CosmeticComparator
 *   items={[
 *     {
 *       id: 'rhinoplasty-01',
 *       effect: 'tear',
 *       after: { src: afterPhoto, alt: 'Patient result, front profile' },
 *       before: { src: beforePhoto, alt: 'Patient before photo, front profile' },
 *       procedureLabel: 'Rhinoplasty',
 *       effectLabel: 'Torn Paper',
 *     },
 *   ]}
 *   // optional: send the resolved tier to analytics to see the real
 *   // distribution of device capability across your visitors
 *   onDeviceTierResolved={(result) => analytics.track('cc_device_tier', result)}
 * />
 */
export function CosmeticComparator({
  items,
  direction = 'ltr',
  theme,
  copy,
  displayFontFamily,
  bodyFontFamily,
  showQuickNav = true,
  showHero = true,
  className,
  qualityOverride,
  onDeviceTierResolved,
}: CosmeticComparatorProps) {
  const resolvedTheme = mergeTheme(theme)
  const resolvedCopy = mergeCopy(direction === 'rtl' ? FA_COPY : DEFAULT_COPY, copy)
  const reduceAmbientMotion = usePrefersReducedMotion()
  const webglSupported = useWebglSupported()
  const { tier, detail } = useDeviceTier(qualityOverride)

  useEffect(() => {
    if (detail) onDeviceTierResolved?.(detail)
  }, [detail, onDeviceTierResolved])

  // WebGL missing outranks the benchmark tier outright — no context, no
  // shader, regardless of how capable the rest of the device looks.
  const effectiveTier: DeviceTier = webglSupported === false ? 'low' : tier

  if (items.length === 0) return null

  return (
    <main
      dir={direction}
      style={themeToCssVars(resolvedTheme, {
        display: displayFontFamily,
        body: bodyFontFamily,
      })}
      className={cn(
        'relative w-full overflow-x-clip bg-[var(--cc-bg)] font-[var(--cc-font-body)] text-[var(--cc-ink)]',
        className,
      )}
    >
      {showQuickNav && (
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-[var(--cc-border)] bg-[var(--cc-bg)]/75 backdrop-blur-md ">
          <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-2.5 sm:justify-center">
            {items.map((item, navIndex) => (
              <a
                key={item.id}
                href={`#stage-${item.id}`}
                className="whitespace-nowrap rounded-full border border-[var(--cc-border)] bg-white/[0.03] px-3 py-1 text-xs text-[var(--cc-ink-muted)] transition-colors hover:border-[var(--cc-accent)]/50 hover:text-[var(--cc-accent-soft)]"
              >
                {toOrdinal(navIndex + 1)} {item.effectLabel}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute -top-52 left-1/2 h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-[var(--cc-accent)]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 end-0 h-96 w-96 rounded-full bg-[var(--cc-accent-deep)]/10 blur-3xl "
      />

      {showHero && (
        <header className="relative flex min-h-[72vh] flex-col items-center justify-center gap-6 px-6 pt-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs font-semibold tracking-[0.35em] text-[var(--cc-accent)]"
          >
            {resolvedCopy.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.9,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-2xl font-[var(--cc-font-display)] text-3xl font-semibold leading-tight text-balance sm:text-5xl sm:leading-[1.1]"
          >
            {resolvedCopy.heading}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scaleX: 0.4 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--cc-accent)]" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[var(--cc-accent)]" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--cc-accent)]" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-md text-sm leading-relaxed text-pretty text-[var(--cc-ink-muted)] sm:text-base"
          >
            {resolvedCopy.subheading}
          </motion.p>
        </header>
      )}

      {/* Single-column stack (phones) / pinned column (md–lg) below lg; at lg+
          the stages lay out in a responsive grid driven by the same GRID_QUERY
          breakpoint ComparisonStage uses, so the two layouts never disagree. */}
      <div className="relative grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-x-8 2xl:grid-cols-3">
        {items.map((item, index) => (
          <ComparisonStage
            key={item.id}
            item={item}
            index={index}
            copy={resolvedCopy}
            tier={effectiveTier}
            reduceAmbientMotion={reduceAmbientMotion}
            formatIndex={toOrdinal}
          />
        ))}
      </div>
    </main>
  )
}
