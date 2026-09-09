'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { PATH_D, PATH_STROKE, PATH_STROKE_WIDTH, PATH_VIEWBOX } from '../lib/svg-path'

export type PathController = {
  /** progress 0..1 */
  seek: (progress: number) => void
}

/**
 * The hand-drawn "path through the forest" line. The original is a Lottie
 * animation scrubbed by the page scroll (frame 0 → last between 2.8% and
 * 38.9% of the journey). Reproduced as an SVG stroke with dasharray/offset
 * scrubbing — same geometry and look, no runtime dependency. Exposes the
 * same seek(progress) controller the animation hook drives, via the
 * sanctioned useImperativeHandle channel.
 */
const ForestPath = forwardRef<PathController, { className?: string }>(
  function ForestPath({ className = '' }, ref) {
    const pathRef = useRef<SVGPathElement | null>(null)

    useEffect(() => {
      const path = pathRef.current
      if (!path) return
      const total = path.getTotalLength()
      path.style.strokeDasharray = `${total}`
      path.style.strokeDashoffset = `${total}`
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        seek: (p) => {
          const path = pathRef.current
          if (!path) return
          const total = path.getTotalLength()
          path.style.strokeDashoffset = `${total * (1 - Math.max(0, Math.min(1, p)))}`
        },
      }),
      [],
    )

    return (
      <div className={`path-lootie ${className}`} aria-hidden="true">
        <svg
          viewBox={PATH_VIEWBOX}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            ref={pathRef}
            d={PATH_D}
            stroke={PATH_STROKE}
            strokeWidth={PATH_STROKE_WIDTH}
            strokeLinecap="round"
            strokeMiterlimit="10"
          />
        </svg>
      </div>
    )
  },
)

export default ForestPath
