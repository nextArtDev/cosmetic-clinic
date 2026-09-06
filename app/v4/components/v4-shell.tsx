'use client'

import { useEffect, type ReactNode } from 'react'
import { shabnamV4 } from '../fonts'

/**
 * Marks <html> with data-v4-active while any /v4 page is mounted. The
 * attribute gates every html/body-level rule in v4/globals.css, so those
 * styles exist only while a /v4 route is on screen and are gone the moment
 * the user navigates away. The wrapper carries the Persian font variable
 * and the fa-IR/rtl context for the whole port (production <html> is
 * already fa-IR/rtl; the wrapper keeps the subtree correct regardless).
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
    <div className={`v4 ${shabnamV4.variable}`} lang="fa-IR" dir="rtl">
      {children}
    </div>
  )
}
