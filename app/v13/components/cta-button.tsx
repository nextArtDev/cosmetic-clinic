'use client'

import { useCallback, useRef, type ReactNode } from 'react'
import { gsap, EASE } from '../lib/gsap'
import { LINKS } from '../lib/assets'

type Props = {
  href?: string
  className?: string
  textClassName?: string
  children?: ReactNode
  /** data attribute hook used by the scroll timeline */
  bgAttr?: string
  textAttr?: string
}

/**
 * Original hover (Webflow a-6 / a-7): both background ellipses travel
 * -150% on Y (1s expo.inOut) and settle back in 0.8s.
 */
export default function CtaButton({
  href = LINKS.booking,
  className = '',
  textClassName = '',
  children = 'رزرو جلسه',
  bgAttr,
  textAttr,
}: Props) {
  const ref = useRef<HTMLAnchorElement | null>(null)

  const enter = useCallback(() => {
    if (!ref.current) return
    gsap.to(ref.current.querySelectorAll('.btn-background'), {
      yPercent: -150,
      duration: 1,
      ease: EASE.inOutExpo,
      overwrite: 'auto',
    })
  }, [])
  const leave = useCallback(() => {
    if (!ref.current) return
    gsap.to(ref.current.querySelectorAll('.btn-background'), {
      yPercent: 0,
      duration: 0.8,
      ease: EASE.inOutExpo,
      overwrite: 'auto',
    })
  }, [])

  const bgProps = bgAttr ? { [bgAttr]: '' } : {}
  const textProps = textAttr ? { [textAttr]: '' } : {}

  return (
    <a
      ref={ref}
      href={href}
      className={`cta-btn ${className}`}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
    >
      <div className={`text-standard btn ${textClassName}`} {...textProps}>
        {children}
      </div>
      <div className="btn-background hoover-on" />
      <div className="btn-background" {...bgProps} />
    </a>
  )
}
