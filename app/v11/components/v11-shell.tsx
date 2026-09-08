'use client'

import { useEffect, type ReactNode } from 'react'
import { shabnamV11, golpayeganiV11 } from '../fonts'

/**
 * Marks <html> with data-v11-active while any /v11 page is mounted.
 * The attribute gates every html/body-level rule in v11/globals.css, so
 * those styles exist only while a /v11 route is on screen and are gone
 * the moment the user navigates away. The wrapper carries the port's own
 * font variables and the fa-IR/rtl context (matches the production
 * <html>, so no direction flip happens at the document level; the
 * subtree stays self-consistent either way). The fluid 1em ≈ 1.1111vw
 * scale lives on .v11 itself — never on production body.
 */
export function V11Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v11-active', '')
    return () => {
      html.removeAttribute('data-v11-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div
      id="v11-site-content"
      className={`v11 ${shabnamV11.variable} ${golpayeganiV11.variable}`}
      lang="fa-IR"
      dir="rtl"
    >
      {children}
    </div>
  )
}
