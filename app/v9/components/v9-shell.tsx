'use client'

import { useEffect, type ReactNode } from 'react'
import { shabnamV9, farsiAdadV9 } from '../fonts'

/**
 * Marks <html> with data-v9-active while any /v9 page is mounted.
 * The attribute gates every html/body-level rule in v9/globals.css,
 * so those styles exist only while a /v9 route is on screen and are
 * gone the moment the user navigates away. The wrapper carries the
 * port's own font variables and the fa-IR/rtl context (matches the
 * production <html>, so no direction flip happens at the document
 * level; the subtree stays self-consistent either way).
 */
export function V9Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v9-active', '')
    return () => {
      html.removeAttribute('data-v9-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div
      id="v9-site-content"
      className={`v9 ${shabnamV9.variable} ${farsiAdadV9.variable}`}
      lang="fa-IR"
      dir="rtl"
    >
      {children}
    </div>
  )
}
