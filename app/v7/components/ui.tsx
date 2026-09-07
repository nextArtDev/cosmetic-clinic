'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'

export function Logo({ className = '' }: { className?: string }) {
  return <span className={`wordmark ${className}`}>گریگوری</span>
}

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reducedMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Dialog({
  children,
  kind,
  title,
  onClose,
}: {
  children: ReactNode
  kind: string
  title: string
  onClose: () => void
}) {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    const originalPadding = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
    // Inert only the page content, NOT the shell that hosts the dialogs
    // themselves (inert on an ancestor of the dialog would make the
    // dialog itself unclickable).
    const root = document.getElementById('v7-content')
    root?.setAttribute('inert', '')
    const timer = window.setTimeout(() => ref.current?.focus(), 30)

    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !ref.current) return
      const focusable = Array.from(
        ref.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
        ),
      ).filter((el) => el.getClientRects().length > 0)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first) {
        event.preventDefault()
        return
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === ref.current)
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === ref.current)
      ) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', keydown)
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPadding
      root?.removeAttribute('inert')
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [onClose])

  return (
    <motion.div
      className={`modal-backdrop modal-backdrop--${kind}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.section
        ref={ref}
        className={`dialog dialog--${kind}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        initial={reducedMotion ? false : { opacity: 0, y: kind === 'menu' ? -20 : 35 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          className="dialog-close"
          type="button"
          onClick={onClose}
          aria-label={`بستن ${kind === 'menu' ? 'منو' : 'پنجره'}`}
        >
          <span>{kind === 'menu' ? 'بستن' : ''}</span>
          <X size={23} strokeWidth={1.2} />
        </button>
        {children}
      </motion.section>
    </motion.div>
  )
}
