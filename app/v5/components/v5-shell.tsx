'use client'

import { useEffect, type ReactNode } from 'react'
import { shabnamV5, farsiAdadV5 } from '../fonts'

/**
 * Marks <html> with data-v5-active while any /v5 page is mounted.
 * The attribute gates every html/body-level rule in v5/globals.css,
 * so those styles exist only while a /v5 route is on screen and are
 * gone the moment the user navigates away. The wrapper carries the
 * port's own font variables and the fa-IR/rtl context (matches the
 * production <html>, so no direction flip happens at the document
 * level; the subtree stays self-consistent either way).
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
    <div className={`v5  ${shabnamV5.variable} ${farsiAdadV5.variable}`} lang="fa-IR" dir="rtl">
      {children}
    </div>
  )
}
