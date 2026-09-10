'use client'

import { useEffect, type ReactNode } from 'react'

/**
 * Marks <html> with data-v15-active while any /v15 page is mounted.
 * The attribute gates every html/body-level rule in v15/globals.css, so
 * those styles exist only while a /v15 route is on screen and are gone
 * the moment the user navigates away. The wrapper carries the port's own
 * font variables and the fa-IR/rtl context. The vertical-scroll choreography
 * of the maison experience stays native; no horizontal scroll here.
 */
export function V15Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v15-active', '')
    return () => {
      html.removeAttribute('data-v15-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div
      id="v15-site-content"
      className="v15"
      lang="fa"
      dir="rtl"
    >
      {children}
    </div>
  )
}
