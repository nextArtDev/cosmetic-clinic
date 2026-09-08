'use client'

import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { X, ArrowDown, ArrowUpRight, ArrowRight, ArrowLeft } from 'lucide-react'

export const ease = [0.22, 1, 0.36, 1] as const

export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg className={`brand-logo ${className}`} viewBox="0 0 69 30" role="img" aria-label="کلینیک قلب مهر">
      <use href="/v8/media/icons.svg#clingr-logo" />
    </svg>
  )
}

export function BrandIcon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <svg className={`brand-icon ${className}`} aria-hidden="true">
      <use href={`/v8/media/icons.svg#${name}`} />
    </svg>
  )
}

export function Arrow({
  direction = 'right',
  size = 22,
}: {
  direction?: 'right' | 'left' | 'down' | 'diagonal'
  size?: number
}) {
  const Component =
    direction === 'down'
      ? ArrowDown
      : direction === 'left'
        ? ArrowLeft
        : direction === 'diagonal'
          ? ArrowUpRight
          : ArrowRight
  // Mirror the arrow glyph in RTL so it points the way the text flows.
  const flip = direction === 'right' || direction === 'diagonal'
  return (
    <span
      style={flip ? { display: 'inline-flex', transform: 'scaleX(-1)' } : { display: 'inline-flex' }}
    >
      <Component size={size} strokeWidth={1.2} aria-hidden="true" />
    </span>
  )
}

export function OvalButton({
  children,
  className = '',
  arrow = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { arrow?: boolean }) {
  return (
    <button {...props} className={`oval-button ${className}`}>
      <span className="oval-content">
        {children}
        {arrow && <Arrow direction="diagonal" />}
      </span>
    </button>
  )
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
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.85, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

export function FlowLines({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`flow-lines ${className}`}
      viewBox="0 0 1440 1000"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          d={`M ${-400 + i * 110} -200 C ${1100 - i * 28} ${260 + i * 28}, ${500 + i * 28} ${650 - i * 25}, ${-80 + i * 155} 1250`}
          stroke="currentColor"
          strokeWidth="0.65"
        />
      ))}
    </svg>
  )
}

export function Dialog({
  children,
  onClose,
  title,
  variant = 'paper',
  className = '',
}: {
  children: ReactNode
  onClose: () => void
  title: string
  variant?: 'paper' | 'menu' | 'video'
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement as HTMLElement | null
    const oldOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = oldOverflow
      previous?.focus({ preventScroll: true })
    }
  }, [])
  return (
    <motion.dialog
      ref={ref}
      aria-label={title}
      className={`site-dialog dialog-${variant} ${className}`}
      data-lenis-prevent
      initial={{ opacity: 0, y: reduced || variant === 'menu' ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced || variant === 'menu' ? 0 : 16 }}
      transition={{ duration: 0.32, ease }}
      onKeyDown={event => {
        if (event.key !== 'Tab' || !ref.current) return
        const items = Array.from(
          ref.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter(
          element =>
            element.getClientRects().length > 0 && element.getAttribute('aria-hidden') !== 'true',
        )
        const first = items[0]
        const last = items[items.length - 1]
        if (!first || !last) {
          event.preventDefault()
          return
        }
        if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
          event.preventDefault()
          last.focus({ preventScroll: true })
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus({ preventScroll: true })
        }
      }}
      onCancel={event => {
        event.preventDefault()
        onClose()
      }}
      onClick={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="dialog-inner">
        <button
          type="button"
          className="dialog-close round-button"
          onClick={onClose}
          aria-label="بستن پنجره"
          autoFocus
        >
          <X size={24} strokeWidth={1.1} />
        </button>
        {children}
      </div>
    </motion.dialog>
  )
}
