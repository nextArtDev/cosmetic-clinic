'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'

/**
 * Pointer-drag horizontal rail with release inertia — port of the sibling
 * route's implementation (`app/v6/components/DragScroller.tsx`), used here
 * for the services rail.
 *
 * Two things had to change for /v10, both found by measuring in a real
 * browser rather than by reading the original:
 *
 * 1. **RTL scroll direction.** In a `dir="rtl"` scroller Chrome's
 *    `scrollLeft` is 0 at the *start* (rightmost) edge and grows *negative*
 *    toward the end. The LTR formula `scrollLeft = start - dx` therefore
 *    only ever clamps back to 0 — the rail looked completely inert. The
 *    delta is now flipped when the rail computes as RTL, so dragging either
 *    way moves the content the way a finger would.
 *
 * 2. **Pointer capture must not happen on `pointerdown`.** Capturing
 *    immediately retargets the follow-up `click` to the rail, so a click on
 *    a card's «جزئیات» toggle never reached the button. Capture is deferred
 *    until the drag threshold is actually crossed.
 *
 * Native touch scrolling is untouched: touch pointers are ignored entirely
 * and `touch-action` is left to the CSS.
 */
export function DragScroller({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const state = useRef({
    startX: 0,
    startScroll: 0,
    down: false,
    dragging: false,
    rtl: false,
    pointerId: -1,
  })
  const inertia = useRef({ velocity: 0, raf: 0 })
  const lastScroll = useRef(0)

  const stopInertia = useCallback(() => cancelAnimationFrame(inertia.current.raf), [])

  const runInertia = useCallback(() => {
    const el = ref.current
    if (!el) return
    stopInertia()
    const step = () => {
      el.scrollLeft += inertia.current.velocity
      inertia.current.velocity *= 0.9
      if (Math.abs(inertia.current.velocity) > 0.5) {
        inertia.current.raf = requestAnimationFrame(step)
      }
    }
    inertia.current.raf = requestAnimationFrame(step)
  }, [stopInertia])

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      const el = ref.current
      if (!el || event.pointerType === 'touch' || event.button !== 0) return
      stopInertia()
      state.current.down = true
      state.current.dragging = false
      state.current.startX = event.clientX
      state.current.startScroll = el.scrollLeft
      state.current.rtl = getComputedStyle(el).direction === 'rtl'
      state.current.pointerId = event.pointerId
      lastScroll.current = el.scrollLeft
    },
    [stopInertia],
  )

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    const el = ref.current
    const s = state.current
    if (!el || !s.down) return
    const dx = event.clientX - s.startX
    if (!s.dragging) {
      if (Math.abs(dx) <= 6) return
      s.dragging = true
      setDragging(true)
      // Capture only once a real drag is under way, so plain clicks on the
      // cards inside the rail still land on the card.
      el.setPointerCapture?.(event.pointerId)
    }
    const next = s.startScroll + (s.rtl ? dx : -dx)
    el.scrollLeft = next
    inertia.current.velocity = el.scrollLeft - lastScroll.current
    lastScroll.current = el.scrollLeft
  }, [])

  const endDrag = useCallback(() => {
    const s = state.current
    if (!s.down) return
    s.down = false
    if (s.dragging && Math.abs(inertia.current.velocity) > 0.5) runInertia()
    s.dragging = false
    setDragging(false)
  }, [runInertia])

  return (
    <div
      ref={ref}
      data-cursor="drag"
      className={`drag-rail ${dragging ? 'is-dragging' : ''} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
    >
      {children}
    </div>
  )
}
