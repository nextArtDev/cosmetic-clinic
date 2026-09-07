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

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    state.current.down = true
    state.current.startX = e.clientX
    state.current.startScroll = el.scrollLeft
    state.current.moved = 0
    el.setPointerCapture?.(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const el = ref.current
      if (!el || !state.current.down) return
      const dx = e.clientX - state.current.startX
      if (!dragging && Math.abs(dx) > 6) setDragging(true)
      state.current.moved = Math.abs(dx)
      el.scrollLeft = state.current.startScroll - dx
    },
    [dragging],
  )

  const endDrag = useCallback(() => {
    if (!state.current.down) return
    state.current.down = false
    setTimeout(() => setDragging(false), 0)
  }, [])

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
