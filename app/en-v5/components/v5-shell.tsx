'use client'

import { useEffect, type ReactNode } from 'react'
import { manropeV5, instrumentV5 } from '../fonts'

/**
 * Marks <html> with data-v5-active while any /v5 page is mounted.
 * The attribute gates every html/body-level rule in v5/globals.css,
 * so those styles exist only while a /v5 route is on screen and are
 * gone the moment the user navigates away (client-side restore is
 * handled by the attribute removal — no production style is ever
 * overridden). The wrapper carries the port's own font variables and
 * the fr/ltr context (production <html> stays fa-IR/rtl).
 */
export function V5Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v5-active', '')
    return () => {
      html.removeAttribute('data-v5-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div className={`v5 ${manropeV5.variable} ${instrumentV5.variable}`} lang="fr" dir="ltr">
      {children}
    </div>
  )
}
