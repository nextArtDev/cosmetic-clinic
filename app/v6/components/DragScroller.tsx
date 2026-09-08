'use client'

import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export default function DragScroller({
  children,
  className = '',
  padClass = '',
}: {
  children: ReactNode
  className?: string
  padClass?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const state = useRef({ startX: 0, startScroll: 0, moved: 0, down: false })
  // inertia — port of the original's velocity decay (s *= 0.9 each frame)
  const inertia = useRef({ velocity: 0, raf: 0 })
  // RTL scrollLeft is negative-growing in some browsers; normalize via delta
  const lastScroll = useRef(0)

  const stopInertia = useCallback(() => {
    cancelAnimationFrame(inertia.current.raf)
  }, [])

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
    (e: React.PointerEvent) => {
      const el = ref.current
      if (!el) return
      stopInertia()
      state.current.down = true
      state.current.startX = e.clientX
      state.current.startScroll = el.scrollLeft
      state.current.moved = 0
      lastScroll.current = el.scrollLeft
      el.setPointerCapture?.(e.pointerId)
    },
    [stopInertia],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const el = ref.current
      if (!el || !state.current.down) return
      const dx = e.clientX - state.current.startX
      if (!dragging && Math.abs(dx) > 6) setDragging(true)
      state.current.moved = Math.abs(dx)
      el.scrollLeft = state.current.startScroll - dx
      // track velocity (px per frame) for release inertia
      inertia.current.velocity = el.scrollLeft - lastScroll.current
      lastScroll.current = el.scrollLeft
    },
    [dragging],
  )

  const endDrag = useCallback(() => {
    if (!state.current.down) return
    state.current.down = false
    if (Math.abs(inertia.current.velocity) > 0.5) runInertia()
    setTimeout(() => setDragging(false), 0)
  }, [runInertia])

  return (
    <div
      ref={ref}
      data-cursor="drag"
      className={`drag-track ${dragging ? 'dragging' : ''} ${padClass} ${className}`}
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
