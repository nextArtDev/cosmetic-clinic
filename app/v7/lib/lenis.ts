import type Lenis from 'lenis'

/**
 * Module-level handle for the /v7 smooth scroller (see v7-smooth-scroll).
 * Dialogs and the preloader call getLenis()?.stop()/start() so virtual
 * scrolling pauses while an overlay owns the page.
 */
let instance: Lenis | null = null

export function setLenis(lenis: Lenis | null) {
  instance = lenis
}

export function getLenis() {
  return instance
}
