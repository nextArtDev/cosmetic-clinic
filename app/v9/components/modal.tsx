'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'

export function Modal({
  children,
  onClose,
  titleId,
  className = '',
}: {
  children: ReactNode
  onClose: () => void
  titleId: string
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    window.dispatchEvent(new CustomEvent('v9:modal', { detail: true }))
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      dialog?.close()
      document.documentElement.style.overflow = previousOverflow
      window.dispatchEvent(new CustomEvent('v9:modal', { detail: false }))
    }
  }, [])
  return (
    <motion.dialog
      ref={ref}
      className={`site-dialog ${className}`}
      aria-labelledby={titleId}
      data-lenis-prevent
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose()
      }}
    >
      <button type="button" className="dialog-close" onClick={onClose} aria-label="بستن پنجره">
        <span />
        <span />
      </button>
      {children}
    </motion.dialog>
  )
}
