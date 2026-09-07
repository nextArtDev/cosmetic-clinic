'use client'

import { useEffect, type ReactNode } from 'react'
import { shabnamV8, farsiAdadV8 } from '../fonts'

/**
 * Marks <html> with data-v8-active while any /v8 page is mounted.
 * The attribute gates every html/body-level rule in v8/globals.css,
 * so those styles exist only while a /v8 route is on screen and are
 * gone the moment the user navigates away. The wrapper carries the
 * port's own font variables and the fa-IR/rtl context (matches the
 * production <html>, so no direction flip happens at the document
 * level; the subtree stays self-consistent either way).
 */
export function V8Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v8-active', '')
    return () => {
      html.removeAttribute('data-v8-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div
      id="v8-site-content"
      className={`v8 ${shabnamV8.variable} ${farsiAdadV8.variable}`}
      lang="fa-IR"
      dir="rtl"
    >
      {children}
    </div>
  )
}
