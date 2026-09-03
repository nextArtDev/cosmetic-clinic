'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ComparisonStage } from './comparison-stage'
import { usePrefersReducedMotion } from './hooks'
import { useRenderTier } from './render-tier'
import { DEFAULT_COPY, mergeCopy, mergeTheme, themeToCssVars } from './theme'
import type { CosmeticComparatorProps } from './types'

const toOrdinal = (index: number) => String(index).padStart(2, '0')

/**
 * A reusable, scroll-scrubbed before/after gallery for cosmetic-procedure
 * photography. Fully data-driven: supply `items`, optionally a `theme`, `copy`
 * and fonts. Must be rendered inside a `<RenderTierProvider>` — use
 * `<AdaptiveCosmeticComparator>` unless you're supplying your own provider.
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
 * />
 */
export function CosmeticComparator({
  items,
  direction = 'ltr',
  theme,
  copy,
  displayFontFamily,
  bodyFontFamily,
  showQuickNav = false,
  showHero = false,
  className,
}: CosmeticComparatorProps) {
  const resolvedTheme = mergeTheme(theme)
  const resolvedCopy = mergeCopy(DEFAULT_COPY, copy)
  const reduceAmbientMotion = usePrefersReducedMotion()
  const tier = useRenderTier()

  if (items.length === 0) return null

  const heavyDecoration = tier === 'shader-high'

  return (
    <main
      dir={direction}
      style={themeToCssVars(resolvedTheme, {
        display: displayFontFamily,
        body: bodyFontFamily,
      })}
      className={cn(
        // `overflow-x-clip`, never `overflow-x-hidden`: `hidden` on one axis
        // forces `auto` on the other, which creates a scroll container and
        // silently kills every `position: sticky` inside it.
        'relative w-full overflow-x-clip bg-[var(--cc-bg)] font-[var(--cc-font-body)] text-[var(--cc-ink)]',
        className,
      )}
    >
      {showQuickNav && (
        <nav
          className="fixed inset-x-0 top-0 z-50 border-b border-[var(--cc-border)]
                     bg-[var(--cc-bg)]
                     supports-[backdrop-filter]:lg:bg-[color-mix(in_oklch,var(--cc-bg)_78%,transparent)]
                     supports-[backdrop-filter]:lg:backdrop-blur-md"
        >
          {/* A fixed backdrop-filter over a repainting canvas re-blurs the
              whole viewport every frame. Glass is desktop-only here. */}
          <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-2.5 sm:justify-center">
            {items.map((item, navIndex) => (
              <a
                key={item.id}
                href={`#stage-${item.id}`}
                className="whitespace-nowrap rounded-full border border-[var(--cc-border)]
                           bg-[color-mix(in_oklch,var(--cc-ink)_3%,transparent)] px-3 py-1
                           text-[10px] text-[var(--cc-ink-muted)] transition-colors
                           hover:border-[color-mix(in_oklch,var(--cc-accent)_50%,transparent)]
                           hover:text-[var(--cc-accent-soft)]"
              >
                {toOrdinal(navIndex + 1)} {item.effectLabel}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* Ambient glow as a radial gradient. `filter: blur(64px)` on a 52rem box
          allocates a huge offscreen buffer and recomposites it whenever
          anything beneath it paints. A gradient is free. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-52 left-1/2 h-[28rem] w-[52rem] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklch, var(--cc-accent) 15%, transparent), transparent)',
        }}
      />
      {heavyDecoration && (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 end-0 h-96 w-96"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in oklch, var(--cc-accent-deep) 20%, transparent), transparent)',
          }}
        />
      )}

      {showHero && (
        <header className="relative flex min-h-[72svh] flex-col items-center justify-center gap-6 px-6 pt-16 text-center">
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
            className="max-w-2xl font-[var(--cc-font-display)] text-3xl font-semibold leading-[1.35] sm:text-5xl sm:leading-[1.3]"
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
            className="max-w-md text-sm leading-7 text-[var(--cc-ink-muted)] sm:text-base"
          >
            {resolvedCopy.subheading}
          </motion.p>
        </header>
      )}

      <div className="flex flex-col xl:flex-row xl:flex-wrap xl:justify-center">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="w-full xl:w-1/2 xl:px-4"
            style={{
              zIndex: index + 1,
              marginBottom: index < items.length - 1 ? '-40svh' : 0,
            }}
          >
            <ComparisonStage
              item={item}
              index={index}
              copy={resolvedCopy}
              reduceAmbientMotion={reduceAmbientMotion}
              formatIndex={toOrdinal}
            />
          </div>
        ))}
      </div>
    </main>
  )
}
