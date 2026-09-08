'use client'

import { useEffect, type ReactNode } from 'react'
import { shabnamV7, farsiAdadV7 } from '../fonts'
import { SmoothScroll } from './v7-smooth-scroll'

/**
 * Marks <html> with data-v7-active while any /v7 page is mounted.
 * The attribute gates every html/body-level rule in v7/globals.css,
 * so those styles exist only while a /v7 route is on screen and are
 * gone the moment the user navigates away. The wrapper carries the
 * port's own font variables and the fa-IR/rtl context (matches the
 * production <html>, so no direction flip happens at the document
 * level; the subtree stays self-consistent either way).
 */
export function V7Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v7-active', '')
    return () => {
      html.removeAttribute('data-v7-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div
      id="v7-site-content"
      className={`v7 ${shabnamV7.variable} ${farsiAdadV7.variable}`}
      lang="fa-IR"
      dir="rtl"
    >
      <SmoothScroll />
      {children}
    </div>
  )
}
