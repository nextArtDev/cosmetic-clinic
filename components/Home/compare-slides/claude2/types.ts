import type { StaticImageData } from 'next/image'
import type { ReactNode } from 'react'
import type { DeviceTier, DeviceTierResult } from './device-tier'

/**
 * The 21 GPU transition studies. Each maps to a hand-written GLSL fragment
 * shader in `shaders.ts`. Names describe the *visual mechanic*, not the
 * procedure — procedures are supplied per-item via `procedureLabel`.
 */
export type TransitionEffect =
  | 'tear'
  | 'peel'
  | 'dissolve'
  | 'ripple'
  | 'laser'
  | 'cells'
  | 'kintsugi'
  | 'frost'
  | 'silk'
  | 'iris'
  | 'bubbles'
  | 'ink'
  | 'mosaic'
  | 'bloom'
  | 'thread'
  | 'chrysalis'
  | 'liquid'
  | 'wave'
  | 'blinds'
  | 'diagonal'
  | 'crystalline'

export interface ComparisonImage {
  /** Prefer next/image `StaticImageData` for build-time optimization; a raw URL also works. */
  src: string | StaticImageData
  /** Required — this sits over a patient photo, so a real description matters for a11y. */
  alt: string
}

export interface ComparisonItem {
  /** Stable id, used for React keys and deep-linking (`#stage-<id>`). */
  id: string
  effect: TransitionEffect
  /** The result photo. Always required. */
  after: ComparisonImage
  /**
   * The pre-procedure photo. Optional — when omitted, the shader synthesizes
   * an aged, desaturated "before" plate procedurally from `after`, so the
   * component still works with after-only photo libraries.
   */
  before?: ComparisonImage
  /** e.g. "Rhinoplasty", "Deep Plane Facelift" — shown as the stage caption. */
  procedureLabel: string
  /** e.g. "Torn Paper", "Golden Ember" — the name of the transition study. */
  effectLabel: string
  /** Vertical focal point of the image, 0 (top) – 1 (bottom). Default 0.5. */
  focusY?: number
  /** Deterministic noise seed so the same item always renders identically. */
  seed?: number
}

export interface ComparatorTheme {
  background: string
  surface: string
  ink: string
  inkMuted: string
  accent: string
  accentSoft: string
  accentDeep: string
  /** Secondary jewel tone used for "before" state markers, kept distinct from `accent`. */
  gem: string
  border: string
}

export interface ComparatorCopy {
  eyebrow: string
  heading: ReactNode
  subheading: string
  scrollHint: string
  holdHint: string
  progressLabel: (percent: number) => string
  beforeLabel: (procedure: string) => string
  afterLabel: (procedure: string) => string
  fallbackDragHint: string
  footnote: ReactNode
}

export interface CosmeticComparatorProps {
  items: ComparisonItem[]
  direction?: 'rtl' | 'ltr'
  /** Deep-merged over the default theme — only override the tokens you need. */
  theme?: Partial<ComparatorTheme>
  /** Deep-merged over the default (English) copy. */
  copy?: Partial<ComparatorCopy>
  /** Font-family CSS values, typically the `.style.fontFamily` of a next/font export. */
  displayFontFamily?: string
  bodyFontFamily?: string
  /** Renders the pill nav that jumps between stages. Default true. */
  showQuickNav?: boolean
  /** Renders the hero/heading block above the stages. Default true. */
  showHero?: boolean
  className?: string
  /**
   * Skips capability detection and forces a tier — useful in QA to see
   * exactly what a 'low' or 'mid' visitor sees without needing the
   * hardware, or to pin behavior in automated visual tests.
   */
  qualityOverride?: DeviceTier
  /**
   * Fires once, after detection resolves, with the full measurement
   * (renderer string, GPU benchmark ms, chosen tier). The main practical
   * way to find out which of *your* visitors' devices land in which tier —
   * wire it to analytics rather than guessing from device model lists.
   */
  onDeviceTierResolved?: (result: DeviceTierResult) => void
}
