'use client'

import { useEffect, type ReactNode } from 'react'
import { shabnamV6, farsiAdadV6 } from '../fonts'

/**
 * Marks <html> with data-v6-active while any /v6 page is mounted.
 * The attribute gates every html/body-level rule in v6/globals.css,
 * so those styles exist only while a /v6 route is on screen and are
 * gone the moment the user navigates away. The wrapper carries the
 * port's own font variables and the fa-IR/rtl context (matches the
 * production <html>, so no direction flip happens at the document
 * level; the subtree stays self-consistent either way).
 */
export function V6Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v6-active', '')
    return () => {
      html.removeAttribute('data-v6-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div className={`v6 ${shabnamV6.variable} ${farsiAdadV6.variable}`} lang="fa-IR" dir="rtl">
      {children}
    </div>
  )
}
