'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/* ── the corridor ────────────────────────────────────────────────
 * Two rails of cards ride from far behind the screen toward the
 * viewer. Perspective alone does the work that looks like two
 * animations: as a card's z grows it gets bigger *and* its screen x
 * sweeps outward from the vanishing point, because the projection
 * scales position and size by the same factor.
 *
 * Three things shape it, and each one fixes a specific artefact:
 *
 * 1. Depth is authored as *apparent size*, geometrically — each card
 *    is a constant ratio bigger than the one behind it, all the way
 *    out. Spacing a straight z-range evenly instead makes the near
 *    cards tear apart from each other as the projection blows up.
 * 2. The rails open hard in the first stretch and then hold
 *    (`fan` > 1). That opening cancels the — still slow — growth back
 *    there, so the ribbon leaves the centre as a flat band, bends
 *    once, and only then runs out on the diagonal. Parallel rails
 *    project to a straight cone with no bend at all.
 * 3. Neither end of the loop is ever on screen. A card dies with its
 *    inner edge past 50cqw, clear of the container's edge. And it is
 *    born *across* the axis — `railBirth` is negative, so the newest
 *    card starts on the far side and sweeps back through the centre.
 *    That plugs the throat: the axis stays covered at every instant,
 *    and a newborn lands behind cards that already cover it, so it
 *    needs no fade in. Birthing on its own side instead leaves a hole
 *    at dead centre that blinks open once every cycle.
 *
 * Every length is in `cqw` — a percentage of the container's width —
 * so the whole corridor keeps its proportions at any size. The
 * defaults were fitted numerically against a reference recording's
 * card-height and edge-position profile, not eyeballed.
 * ─────────────────────────────────────────────────────────────── */

export type CorridorPath = {
  perspective?: number
  cardWidth?: number
  cardHeight?: number
  cardRadius?: number
  birthHeight?: number
  exitHeight?: number
  railBirth?: number
  railExit?: number
  fan?: number
  turnBirth?: number
  turnExit?: number
  stops?: number
}

const PATH: Required<CorridorPath> = {
  perspective: 30,
  cardWidth: 18,
  cardHeight: 25,
  cardRadius: 0.4,
  birthHeight: 2.6,
  exitHeight: 46,
  railBirth: -11,
  railExit: 44,
  fan: 3.3,
  turnBirth: 6,
  turnExit: 28,
  stops: 24,
}

function keyframes(dir: 1 | -1, name: string, p: Required<CorridorPath>) {
  const steps: string[] = []
  for (let s = 0; s <= p.stops; s++) {
    const u = s / p.stops
    const scale =
      (p.birthHeight / p.cardHeight) * Math.pow(p.exitHeight / p.birthHeight, u)
    const z = p.perspective * (1 - 1 / scale)
    const rail =
      p.railExit - (p.railExit - p.railBirth) * Math.pow(1 - u, p.fan)
    const turn = p.turnBirth + (p.turnExit - p.turnBirth) * u
    steps.push(
      `${(u * 100).toFixed(2)}%{transform:translate3d(${(dir * rail).toFixed(
        2,
      )}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)}`,
    )
  }
  return `@keyframes ${name}{${steps.join('')}}`
}

export type StreamImage = {
  src: string
  alt?: string
  /** e.g. "Rhinoplasty", "Facelift", "Breast Augmentation" */
  procedure?: string
  /** e.g. "3 Months Post-Op", "Before", "1 Year Post-Op" */
  stage?: string
}

export type ImageStreamHeroProps = {
  images: StreamImage[]
  cards?: number
  speed?: number
  axis?: number
  path?: CorridorPath
  children?: React.ReactNode
  className?: string
}

export function ImageStreamHero({
  images,
  cards = 9,
  speed = 18,
  axis = 55,
  path,
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & ImageStreamHeroProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '')
  const right = `ish-r-${id}`
  const left = `ish-l-${id}`
  const card = `ish-c-${id}`

  const p = React.useMemo(() => ({ ...PATH, ...path }), [path])

  const css = React.useMemo(
    () =>
      `${keyframes(1, right, p)}${keyframes(-1, left, p)}` +
      `@media(prefers-reduced-motion:reduce){.${card}{animation-play-state:paused}}`,
    [right, left, card, p],
  )

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      {...props}
      style={{ containerType: 'inline-size', ...props.style }}
    >
      <style>{css}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          perspective: `${p.perspective}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {[right, left].map((name) =>
            Array.from({ length: cards }, (_, i) => {
              const img = images[i % Math.max(images.length, 1)]
              return (
                <div
                  key={`${name}-${i}`}
                  className={cn(card, 'absolute overflow-hidden')}
                  style={{
                    left: '50%',
                    top: `${axis}%`,
                    width: `${p.cardWidth}cqw`,
                    height: `${p.cardHeight}cqw`,
                    marginLeft: `${-p.cardWidth / 2}cqw`,
                    marginTop: `${-p.cardHeight / 2}cqw`,
                    borderRadius: `${p.cardRadius}cqw`,
                    animation: `${name} ${speed}s linear infinite`,
                    animationDelay: `${-(i * speed) / cards}s`,
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {img ? (
                    <div
                      className="relative h-full w-full overflow-hidden bg-white"
                      style={{
                        borderRadius: `${p.cardRadius}cqw`,
                        // Multi-layer shadow for a premium physical print effect
                        boxShadow:
                          '0 15px 35px -10px rgba(0,0,0,0.15), 0 5px 15px -5px rgba(0,0,0,0.05)',
                      }}
                    >
                      {/* Top Luxury Gold Accent Line */}
                      <div className="absolute top-0 left-0 right-0 h-[0.3cqw] bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 z-10" />

                      <div className="h-full w-full flex flex-col">
                        {/* Image Area */}
                        <div className="relative flex-1 overflow-hidden bg-neutral-100">
                          <img
                            src={img.src}
                            alt={img.alt ?? ''}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                            draggable={false}
                          />
                          {/* Subtle inner border for depth */}
                          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
                        </div>

                        {/* Footer / Metadata Area */}
                        <div className="px-[1.5cqw] py-[1cqw] bg-white border-t border-black/5">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="pr-1 text-[1.5cqw]    tracking-wide  truncate">
                                {/* {img.procedure || 'Aesthetic Excellence'} */}
                                {img.alt}
                              </p>
                              {/* <p className="text-[0.85cqw] font-medium uppercase tracking-widest text-neutral-500 mt-[0.2cqw] truncate">
                                {img.stage || 'Before & After'}
                              </p> */}
                            </div>

                            {/* Clinical/Luxury Badge */}
                            <div className="flex items-center gap-[0.6cqw] ml-[1cqw] flex-shrink-0">
                              <div className="w-[0.2cqw] h-[2.5cqw] bg-gradient-to-b from-amber-300 to-amber-500 rounded-full" />
                              <span className="text-[0.8cqw] font-bold uppercase tracking-[0.2em] text-amber-600/90">
                                MD
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            }),
          )}
        </div>
      </div>

      {children}
    </div>
  )
}

export default ImageStreamHero
