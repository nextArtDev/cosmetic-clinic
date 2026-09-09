'use client'

import { useEffect, type ReactNode } from 'react'
import { shabnamV13, golpayeganiV13 } from '../fonts'

/**
 * Marks <html> with data-v13-active while any /v13 page is mounted.
 * The attribute gates every html/body-level rule in v13/globals.css, so
 * those styles exist only while a /v13 route is on screen and are gone
 * the moment the user navigates away. The wrapper carries the port's own
 * font variables and the fa-IR/rtl context (matches the production
 * <html>, so no direction flip happens at the document level; the
 * horizontal-scroll choreography stays physically LTR via CSS `direction:
 * ltr` on the track/frame/grid containers inside v13/globals.css).
 */
export function V13Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v13-active', '')
    return () => {
      html.removeAttribute('data-v13-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div
      id="v13-site-content"
      className={`v13 ${shabnamV13.variable} ${golpayeganiV13.variable}`}
      lang="fa-IR"
      dir="rtl"
    >
      {children}
    </div>
  )
}
