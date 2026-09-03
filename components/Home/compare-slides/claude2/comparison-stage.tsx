'use client'

import { Suspense, useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion'
import Image from 'next/image'
import type { StaticImageData } from 'next/image'
import { CompareHandle } from './compare-handle'
import type { DeviceTier } from './device-tier'
import { EffectMesh } from './effect-mesh'
import { FallbackStage } from './fallback-stage'
import { useHoldPreview, useLazyMount, useMediaQuery } from './hooks'
import type { ComparatorCopy, ComparisonItem } from './types'
import { Loader } from 'lucide-react'

const toSrc = (src: string | StaticImageData) =>
  typeof src === 'string' ? src : src.src

/** WebGL settings per resolved tier. 'high' keeps the original full-fidelity
 *  settings; 'mid' halves fbm cost (see shaders.ts uOctaves), caps device
 *  pixel ratio at 1×, and drops MSAA — the shader is still the shader, just
 *  cheaper, so mid-tier phones get the real effect rather than a fallback. */
const QUALITY_BY_TIER = {
  high: { octaves: 4, dpr: [1, 2] as [number, number], antialias: true },
  mid: { octaves: 2, dpr: [1, 1] as [number, number], antialias: false },
} satisfies Record<
  'high' | 'mid',
  { octaves: number; dpr: [number, number]; antialias: boolean }
>

/** md–lg keeps the pinned 250vh scroll-scrub; phones and the lg+ grid cells
 *  get a normal block whose reveal scrubs while the card travels through the
 *  viewport instead — the long "stuck" pin is what reads as a delay on touch
 *  devices, and a pin makes no sense inside a grid row. */
const PINNED_QUERY = '(min-width: 768px)'
/** lg+ switches from the single-column stack to the multi-column grid laid
 *  out by the stages wrapper in cosmetic-comparator.tsx — the two must agree,
 *  so both are driven by the same breakpoint. */
const GRID_QUERY = '(min-width: 1024px)'

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/** Shown while a stage's WebGL canvas compiles and uploads its textures —
 *  a quiet "something is loading" affordance instead of a blank frame. */
function StageSkeleton({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden bg-[var(--cc-surface)]">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-black/15 via-transparent to-black/15" />
      {!reduceMotion && (
        <motion.div
          aria-hidden
          initial={{ x: '-130%' }}
          animate={{ x: '270%' }}
          transition={{
            duration: 1.3,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 0.35,
          }}
          className="absolute inset-y-0 w-2/5 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader
          size={18}
          aria-hidden
          className="animate-spin text-[var(--cc-accent-soft)]"
        />
      </div>
    </div>
  )
}

export interface ComparisonStageProps {
  item: ComparisonItem
  index: number
  copy: ComparatorCopy
  /** Resolved device capability — 'low' (or no WebGL) renders `FallbackStage`
   *  instead of a shader; see `useDeviceTier` and `cosmetic-comparator.tsx`. */
  tier: DeviceTier
  reduceAmbientMotion: boolean
  formatIndex: (index: number) => string
}

export function ComparisonStage({
  item,
  index,
  copy,
  tier,
  reduceAmbientMotion,
  formatIndex,
}: ComparisonStageProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  const isDesktop = useMediaQuery(PINNED_QUERY)
  const grid = useMediaQuery(GRID_QUERY)
  const pinned = isDesktop && !grid

  // md–lg pins each stage and scrubs 1:1 with scroll. Phones and grid cells
  // don't pin — the reveal scrubs while the card travels through the
  // viewport, compressed so the full before→after transition completes just
  // past center and the reader lands on the finished result.
  const { scrollYProgress: pinnedProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const { scrollYProgress: passProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  // On non-pinned layouts the reveal holds at 0 (full "before") until the
  // card is mostly inside the viewport (pass ≈ 0.32) — starting on first
  // entry meant the before photo was already dissolving while only its top
  // edge had cleared the fold, so the "before" state was never actually seen.
  const scrollYProgress = useTransform<number, number>(
    [pinnedProgress, passProgress],
    ([pinnedValue, passValue]) =>
      pinned ? pinnedValue : clamp01((passValue - 0.32) / 0.34),
  )

  const { preview, isHolding, start, end } = useHoldPreview(scrollYProgress)

  // Mounts the WebGL <Canvas> only once this stage is near the viewport, and
  // unmounts it again once it's well past — see useLazyMount in hooks.ts for
  // why this matters more than per-device quality for perceived "lag".
  const isNearViewport = useLazyMount(sectionRef)

  const beforeChipOpacity = useTransform(scrollYProgress, [0.28, 0.48], [1, 0])
  const afterChipOpacity = useTransform(scrollYProgress, [0.52, 0.74], [0, 1])
  const railScale = useTransform(scrollYProgress, (value) =>
    isHolding ? 0 : value,
  )

  const [percent, setPercent] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (!isHolding) setPercent(Math.round(value * 100))
  })

  const afterSrc = toSrc(item.after.src)
  const beforeSrc = item.before ? toSrc(item.before.src) : afterSrc
  const displayedPercent = isHolding ? 0 : percent

  const useFallback = tier === 'low'
  const quality = QUALITY_BY_TIER[tier === 'low' ? 'mid' : tier]
  const canvasIsLive = !useFallback && isNearViewport

  // Shimmer until the canvas has actually rendered a frame with its
  // textures; reset when the canvas unmounts so a re-mount shimmer covers
  // its reload too.
  const [shaderReady, setShaderReady] = useState(false)
  const handleShaderReady = useCallback(() => setShaderReady(true), [])
  // Derived instead of synced: only the ready callback sets it true, and it
  // only counts while the canvas is actually live.
  const effectiveShaderReady = shaderReady && canvasIsLive

  return (
    <div
      ref={sectionRef}
      id={`stage-${item.id}`}
      // Lets the browser skip layout/paint for stages far from the
      // viewport instead of maintaining full render state for all 16 at
      // once — the other half of the fix, alongside canvas lazy-mounting,
      // for a long pinned gallery feeling heavy while scrolling. No-op in
      // browsers that don't support content-visibility.
      style={{
        contentVisibility: 'auto',
        // Fallback size tracks the mode: 250vh pinned section, a ~single
        // viewport block on phones, or a short grid cell on lg+ — a wrong
        // guess makes scroll lurch when a far-off stage finally renders.
        containIntrinsicSize: pinned
          ? '100% 2400px'
          : grid
            ? '100% 640px'
            : '100% 900px',
      }}
      className={`relative ${pinned ? 'h-[250vh]' : ''} bg-[oklch(13%_0.014_46)] bg-[radial-gradient(90%_70%_at_50%_28%,oklch(21%_0.03_50)_0%,oklch(12%_0.012_44)_70%)]`}
    >
      {/* Never place overflow-hidden on an ancestor of the sticky node (md+). */}
      <div
        className={[
          pinned ? 'sticky top-0 h-screen' : 'relative',
          grid ? 'py-10' : 'min-h-svh py-6',
          'flex flex-col items-center justify-center gap-5 px-4',
        ].join(' ')}
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

        {/* In the lg+ grid the card fills its column (up to 400px) instead of
            a fixed width, so 2–3 columns never force the card to overflow. */}
        <div className="relative w-[min(84vw,400px)] lg:w-full lg:max-w-[400px]">
          {/* progress rail with a traveling marker, echoes scroll position */}
          <div className="absolute -inset-y-0 -start-7 hidden w-px overflow-hidden bg-[var(--cc-border)] sm:block  overflow-hidden ">
            <motion.div
              style={{ scaleY: railScale }}
              className="h-full w-full origin-top bg-gradient-to-b from-[var(--cc-accent-soft)] to-[var(--cc-accent-deep)] "
            />
          </div>

        {/* jeweler's-case frame: hairline bevel, then the vitrine itself */}
          <div className="rounded-[22px] bg-[linear-gradient(150deg,var(--cc-accent-soft)_0%,var(--cc-accent)_30%,var(--cc-accent-deep)_52%,var(--cc-accent)_74%,var(--cc-accent-soft)_100%)] p-[1.5px] shadow-[0_36px_100px_-32px_rgba(0,0,0,0.55)]">
            {/* Firefox ignores border-radius clipping from overflow:hidden for
                composited descendants (the WebGL canvas) — the corners and the
                inner glow bleed out. clip-path rounds are honored for the whole
                subtree, so they are enforced here as well as overflow-hidden. */}
            <div
              role="group"
              aria-label={`${item.procedureLabel} — ${copy.progressLabel(displayedPercent)}`}
              onContextMenu={(event) => event.preventDefault()}
              style={{ touchAction: 'pan-y', WebkitTouchCallout: 'none' }}
              className="relative aspect-[4/5] overflow-hidden rounded-[20.5px] bg-[var(--cc-surface)] select-none [clip-path:inset(0_round_20.5px)]"
            >
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[var(--cc-surface)] via-black/20 to-[var(--cc-surface)]  " />

              {useFallback ? (
                <FallbackStage
                  item={item}
                  progress={scrollYProgress}
                  preview={preview}
                />
              ) : canvasIsLive ? (
                <>
                  <Canvas
                    dpr={quality.dpr}
                    gl={{
                      antialias: quality.antialias,
                      alpha: true,
                      powerPreference: 'high-performance',
                    }}
                    className="absolute inset-0  overflow-hidden "
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
                        octaves={quality.octaves}
                        onReady={handleShaderReady}
                      />
                    </Suspense>
                  </Canvas>
                  {!effectiveShaderReady && (
                    <StageSkeleton reduceMotion={reduceAmbientMotion} />
                  )}
                </>
              ) : (
                // Not near the viewport yet — no live Canvas, no render loop,
                // no GPU context held. Just the after photo, at rest.
                <Image
                  src={item.after.src}
                  alt={item.after.alt}
                  fill
                  draggable={false}
                  sizes="(max-width: 640px) 84vw, 400px"
                  className="pointer-events-none object-cover"
                  priority={false}
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

        {/* Per-card scroll hint only makes sense in the vertical, one-at-a-time
            layouts — in the grid every card would repeat it. */}
        <div
          className={`flex flex-col items-center gap-1 text-xs text-[var(--cc-ink-muted)] ${grid ? 'hidden' : ''}`}
        >
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
        </div>
      </div>
    </div>
  )
}
