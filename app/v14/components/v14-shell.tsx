'use client'

import { useEffect, type ReactNode } from 'react'
import { shabnamV14, golpayeganiV14 } from '../fonts'

/**
 * Marks <html> with data-v14-active while any /v14 page is mounted.
 * The attribute gates every html/body-level rule in v14/globals.css, so
 * those styles exist only while a /v14 route is on screen and are gone
 * the moment the user navigates away. The wrapper carries the port's own
 * font variables and the fa-IR/rtl context (matches the production
 * <html>, so no direction flip happens at the document level; the
 * horizontal-scroll choreography stays physically LTR via CSS `direction:
 * ltr` on the track/frame/grid containers inside v14/globals.css).
 */
export function V14Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v14-active', '')
    return () => {
      html.removeAttribute('data-v14-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div
      id="v14-site-content"
      className={`v14 ${shabnamV14.variable} ${golpayeganiV14.variable}`}
      lang="fa-IR"
      dir="rtl"
    >
      {children}
    </div>
  )
}
