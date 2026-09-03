'use client'

import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Canvas } from '@react-three/fiber'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion'
import type { StaticImageData } from 'next/image'
import { CompareHandle } from './compare-handle'
import { EffectMesh } from './effect-mesh'
import { FallbackStage } from './fallback-stage'
import { useHoldPreview } from './hooks'
import type { ComparatorCopy, ComparisonItem } from './types'

const toSrc = (src: string | StaticImageData) =>
  typeof src === 'string' ? src : src.src

/**
 * Catches runtime WebGL failures (context creation, shader compile, texture
 * upload) that only surface after the canvas mounts — e.g. on old devices
 * that pass the feature check but fail on the real scene. Swaps to the CSS
 * fallback instead of leaving a blank stage.
 */
class WebGLErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    if (typeof console !== 'undefined') {
      console.warn(
        '[CosmeticComparator] WebGL stage failed, using CSS fallback.',
        error,
      )
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

export interface ComparisonStageProps {
  item: ComparisonItem
  index: number
  copy: ComparatorCopy
  webglSupported: boolean | null
  reduceAmbientMotion: boolean
  formatIndex: (index: number) => string
  stackIndex?: number
}

export function ComparisonStage({
  item,
  index,
  copy,
  webglSupported,
  reduceAmbientMotion,
  formatIndex,
  stackIndex = 0,
}: ComparisonStageProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Every mounted <Canvas> is its own WebGL2 context (browsers cap active
  // contexts, oldest gets dropped first) and runs its own rAF loop forever.
  // With one stage per item that means N contexts + N rAF loops for art the
  // reader can't see. So mount the GPU stage only while this section is
  // within ~one viewport of being seen; outside that window the CSS
  // FallbackStage stands in. Both read the same motion values and the swap
  // happens off-screen, so it's visually seamless — and drei's texture cache
  // makes a re-mount cheap.
  const [glActive, setGlActive] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setGlActive(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setGlActive(entry.isIntersecting),
      { rootMargin: '100% 0px 100% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const { preview, isHolding, start, end } = useHoldPreview(scrollYProgress)

  const beforeChipOpacity = useTransform(scrollYProgress, [0.28, 0.48], [1, 0])
  const afterChipOpacity = useTransform(scrollYProgress, [0.52, 0.74], [0, 1])
  const railScale = useTransform(scrollYProgress, (value) =>
    isHolding ? 0 : Math.max(0, value),
  )

  const [percent, setPercent] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (!isHolding)
      setPercent(Math.round(Math.max(0, Math.min(1, value)) * 100))
  })

  const afterSrc = toSrc(item.after.src)
  const beforeSrc = item.before ? toSrc(item.before.src) : afterSrc
  const displayedPercent = isHolding ? 0 : percent

  return (
    <div
      ref={sectionRef}
      id={`stage-${item.id}`}
      className="relative h-[240vh]"
      style={{ zIndex: stackIndex + 1 }}
    >
      {/* Never place overflow-hidden on an ancestor of this sticky node. */}
      <div
        className="sticky flex h-dvh flex-col items-center justify-center gap-5 px-4 py-6"
        style={{ top: `${stackIndex * 28}px` }}
      >
        {/* <header className="flex items-baseline gap-3">
          <span className="font-[var(--cc-font-body)] text-[11px] font-semibold tabular-nums text-[var(--cc-accent)]">
            {formatIndex(index + 1)}
          </span>
          <h3 className="font-[var(--cc-font-display)] text-lg font-semibold text-[var(--cc-ink)] sm:text-xl">
            {item.effectLabel}
          </h3>
          <span className="hidden text-xs text-[var(--cc-ink-muted)] sm:block">
            {item.procedureLabel}
          </span>
        </header> */}

        <div className="relative flex w-full items-center justify-center">
          {/* progress rail with a traveling marker, echoes scroll position */}
          <div className="absolute -inset-y-0 -start-7 hidden w-px overflow-hidden bg-[var(--cc-border)] sm:block">
            <motion.div
              style={{ scaleY: railScale }}
              className="h-full w-full origin-top bg-gradient-to-b from-[var(--cc-accent-soft)] to-[var(--cc-accent-deep)]"
            />
          </div>

          {/* jeweler's-case frame: hairline bevel, then the vitrine itself */}
          <div className="rounded-[22px] bg-[linear-gradient(150deg,var(--cc-accent-soft)_0%,var(--cc-accent)_30%,var(--cc-accent-deep)_52%,var(--cc-accent)_74%,var(--cc-accent-soft)_100%)] p-[1.5px] shadow-[0_36px_100px_-32px_rgba(0,0,0,0.55)] overflow-hidden">
            <div
              role="group"
              aria-label={`${item.procedureLabel} — ${copy.progressLabel(displayedPercent)}`}
              onContextMenu={(event) => event.preventDefault()}
              style={{ touchAction: 'pan-y', WebkitTouchCallout: 'none' }}
              className="relative aspect-[4/5] h-[min(70dvh,calc((100vw-2rem)*1.25))] w-auto max-w-full overflow-hidden rounded-[20.5px] bg-[var(--cc-surface)] select-none"
            >
              {/* <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[var(--cc-surface)] via-black/20 to-[var(--cc-surface)]" /> */}

              {webglSupported === true && glActive ? (
                <WebGLErrorBoundary
                  fallback={
                    <FallbackStage
                      item={item}
                      progress={scrollYProgress}
                      preview={preview}
                    />
                  }
                >
                  <Canvas
                    dpr={[1, 2]}
                    gl={{
                      antialias: true,
                      alpha: true,
                      powerPreference: 'high-performance',
                    }}
                    className="absolute inset-0"
                  >
                    <Suspense fallback={null}>
                      <EffectMesh
                        effect={item.effect}
                        beforeSrc={beforeSrc}
                        afterSrc={afterSrc}
                        hasRealBefore={Boolean(item.before)}
                        seed={item.seed ?? 7.3}
                        centerY={item.focusY ?? 0.5}
                        progress={scrollYProgress}
                        preview={preview}
                        reduceAmbientMotion={reduceAmbientMotion}
                      />
                    </Suspense>
                  </Canvas>
                </WebGLErrorBoundary>
              ) : (
                <FallbackStage
                  item={item}
                  progress={scrollYProgress}
                  preview={preview}
                />
              )}

              <motion.div
                style={{ opacity: isHolding ? 1 : beforeChipOpacity }}
                className="pointer-events-none absolute start-4 top-4 z-10 flex items-center gap-2 rounded-full border border-[var(--cc-border)] bg-black/40 px-3.5 py-1.5 text-[12px] font-medium text-[var(--cc-ink)] shadow-lg backdrop-blur-md"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--cc-gem)]" />
                {copy.beforeLabel(item.procedureLabel)}
              </motion.div>

              <motion.div
                style={{ opacity: isHolding ? 0 : afterChipOpacity }}
                className="pointer-events-none absolute end-4 top-4 z-10 flex items-center gap-2 rounded-full border border-[var(--cc-border)] bg-black/40 px-3.5 py-1.5 text-[12px] font-medium text-[var(--cc-ink)] shadow-lg backdrop-blur-md"
              >
                {copy.afterLabel(item.procedureLabel)}
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--cc-accent)]" />
              </motion.div>

              {/* <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex flex-col items-center gap-2">
                <span
                  aria-live="polite"
                  className="rounded-full border border-[var(--cc-border)] bg-black/45 px-3 py-1 text-[11px] font-medium tabular-nums text-[var(--cc-accent-soft)] backdrop-blur-md"
                >
                  {copy.progressLabel(displayedPercent)}
                </span>
                <CompareHandle
                  label={copy.holdHint}
                  isHolding={isHolding}
                  onStart={start}
                  onEnd={end}
                />
              </div> */}
            </div>
          </div>
        </div>

        {/* <div className="flex flex-col items-center gap-1 text-[11px] text-[var(--cc-ink-muted)]">
          <span>{copy.scrollHint}</span>
          <motion.span
            aria-hidden
            animate={
              reduceAmbientMotion
                ? undefined
                : { y: [0, 5, 0], opacity: [0.4, 1, 0.4] }
            }
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[var(--cc-accent)]"
          >
            ⌄
          </motion.span>
        </div> */}
      </div>
    </div>
  )
}
