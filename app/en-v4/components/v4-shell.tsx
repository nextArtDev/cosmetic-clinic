'use client'

import { useEffect, type ReactNode } from 'react'

/**
 * Marks <html> with data-v4-active while any /v4 page is mounted. The
 * attribute gates every html/body-level rule in v4/globals.css, so those
 * styles exist only while a /v4 route is on screen and are gone the moment
 * the user navigates away. The wrapper also forces lang="ja" dir="ltr":
 * the production <html> is fa-IR/rtl (Persian) while this port is Japanese.
 */
export function V4Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v4-active', '')
    return () => {
      html.removeAttribute('data-v4-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div className="v4" lang="ja" dir="ltr">
      {children}
    </div>
  )
}
