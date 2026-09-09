'use client'

import { useEffect, type ReactNode } from 'react'
import { shabnamV12, farsiAdadV12 } from '../fonts'

/**
 * Marks <html> with data-v12-active while any /v12 page is mounted.
 * The attribute gates every html/body-level rule in v12/globals.css,
 * so those styles exist only while a /v12 route is on screen and are
 * gone the moment the user navigates away. The wrapper carries the
 * port's own font variables and the fa-IR/rtl context (matches the
 * production <html>, so no direction flip happens at the document
 * level; the subtree stays self-consistent either way).
 */
export function V12Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v12-active', '')
    return () => {
      html.removeAttribute('data-v12-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div
      id="v12-site-content"
      className={`v12 ${shabnamV12.variable} ${farsiAdadV12.variable}`}
      lang="fa-IR"
      dir="rtl"
    >
      {children}
    </div>
  )
}
