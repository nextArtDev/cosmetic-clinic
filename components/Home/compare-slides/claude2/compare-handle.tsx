'use client'

import { motion } from 'framer-motion'
import type { KeyboardEvent, PointerEvent } from 'react'

export interface CompareHandleProps {
  label: string
  isHolding: boolean
  onStart: () => void
  onEnd: () => void
}

/**
 * The interactive surface for "hold to reveal before" lives here, and only
 * here — deliberately not on the full photo frame.
 *
 * On touch, `pointerdown` fires the instant a finger lands, before the
 * browser can tell a tap-and-hold apart from the first frame of a scroll
 * drag. Binding the hold gesture to the whole image (and disabling
 * `touch-action` there to make it work) is what made scrolling past the
 * component reset it on every pass. This button is the only element that
 * captures the pointer, so the photo frame itself stays fully scrollable —
 * pan-y all the way through — on every device.
 */
export function CompareHandle({ label, isHolding, onStart, onEnd }: CompareHandleProps) {
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onStart()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.repeat) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onStart()
    }
  }

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') onEnd()
  }

  return (
    <motion.button
      type="button"
      aria-pressed={isHolding}
      aria-label={label}
      whileTap={{ scale: 0.94 }}
      onPointerDown={handlePointerDown}
      onPointerUp={onEnd}
      onPointerLeave={onEnd}
      onPointerCancel={onEnd}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={onEnd}
      style={{ WebkitTouchCallout: 'none' }}
      className="pointer-events-auto flex touch-none select-none items-center gap-1.5 rounded-full border border-[var(--cc-border)] bg-black/45 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-[var(--cc-accent-soft)] backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--cc-accent)] active:bg-black/60"
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="h-3 w-3 shrink-0 text-[var(--cc-accent)]"
        fill="none"
      >
        <path
          d="M6 4 2 8l4 4M10 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </motion.button>
  )
}
