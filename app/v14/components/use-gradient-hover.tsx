'use client'

import { useCallback } from 'react'
import { gsap, EASE } from '../lib/gsap'

/**
 * Hover microinteraction from the original: two teal gradients slide in
 * from both edges. Implemented event-driven (the handlers read the DOM
 * from event.currentTarget) so no ref is touched during render, which the
 * repo's react-hooks/refs lint rule requires.
 */
export function useGradientHover<T extends HTMLElement>() {
  const onEnter = useCallback((e: React.MouseEvent<T> | React.FocusEvent<T>) => {
    const el = e.currentTarget
    gsap.to(el.querySelectorAll<HTMLElement>('.gradient-nav.right-side'), {
      xPercent: -100,
      duration: 1.5,
      ease: EASE.outQuart,
      overwrite: 'auto',
    })
    gsap.to(el.querySelectorAll<HTMLElement>('.gradient-nav.left-side'), {
      xPercent: 100,
      duration: 1.5,
      ease: EASE.outQuart,
      overwrite: 'auto',
    })
  }, [])
  const onLeave = useCallback((e: React.MouseEvent<T> | React.FocusEvent<T>) => {
    const el = e.currentTarget
    gsap.to(el.querySelectorAll<HTMLElement>('.gradient-nav'), {
      xPercent: 0,
      duration: 1,
      ease: EASE.outQuart,
      overwrite: 'auto',
    })
  }, [])
  return { onMouseEnter: onEnter, onMouseLeave: onLeave, onFocus: onEnter, onBlur: onLeave }
}
