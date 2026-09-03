'use client'

import { useEffect, useState } from 'react'

const MIN_DISPLAY_MS = 1100
const MAX_WAIT_MS = 8000

const APP_READY_EVENT = 'cc:app-ready'

/**
 * Optional readiness seam for heavy content: call this from a WebGL scene (or
 * anything async) once its first frame is actually rendered, and the preloader
 * will treat the app as loaded even if window.load hasn't fired yet. It can
 * only settle the preloader EARLIER — never later than MAX_WAIT_MS.
 */
export function signalAppReady() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(APP_READY_EVENT))
  }
}

export interface LoadProgress {
  progress: number
  isReady: boolean
  isLoading: boolean
}

export function usePageLoadProgress(): LoadProgress {
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      sessionStorage.getItem('cc:loaded')
    ) {
      queueMicrotask(() => {
        setProgress(100)
        setIsReady(true)
      })
      return
    }

    let windowLoaded = false
    let appReady = false
    let minElapsed = false
    let settled = false
    const start = Date.now()

    const evaluate = () => {
      if (settled) return
      const elapsed = Date.now() - start
      const loadedPart = windowLoaded || appReady ? 70 : 0
      const timePart = Math.min(30, (elapsed / MIN_DISPLAY_MS) * 30)
      setProgress(Math.round(Math.min(100, loadedPart + timePart)))

      if ((windowLoaded || appReady) && minElapsed) {
        settled = true
        setProgress(100)
        setIsReady(true)
        try {
          sessionStorage.setItem('cc:loaded', '1')
        } catch {
          /* quota exceeded — still proceed */
        }
      }
    }

    const onLoad = () => {
      windowLoaded = true
      evaluate()
    }
    const minTimer = setTimeout(() => {
      minElapsed = true
      evaluate()
    }, MIN_DISPLAY_MS)
    const maxTimer = setTimeout(() => {
      if (!settled) {
        settled = true
        setProgress(100)
        setIsReady(true)
        try {
          sessionStorage.setItem('cc:loaded', '1')
        } catch {
          /* skip */
        }
      }
    }, MAX_WAIT_MS)

    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad)

    const onAppReady = () => {
      appReady = true
      evaluate()
    }
    window.addEventListener(APP_READY_EVENT, onAppReady)

    const ticker = setInterval(evaluate, 80)

    return () => {
      clearTimeout(minTimer)
      clearTimeout(maxTimer)
      clearInterval(ticker)
      window.removeEventListener('load', onLoad)
      window.removeEventListener(APP_READY_EVENT, onAppReady)
    }
  }, [])

  return { progress, isReady, isLoading: !isReady }
}