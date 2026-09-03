import type { StaticImageData } from 'next/image'
import type { ReactNode } from 'react'

/**
 * The 16 GPU transition studies. Each maps to a hand-written GLSL fragment
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

export interface ComparisonImage {
  /** Prefer next/image `StaticImageData` for build-time optimization; a raw URL also works. */
  src: string | StaticImageData
  /** Required — this sits over a patient photo, so a real description matters for a11y. */
  alt: string
}

export interface ComparisonItem {
  /** Stable, unique id. Doubles as the React key and the `#stage-<id>` anchor. */
  id: string
  effect: TransitionEffect
  /** The result photo. Always required. */
  after: ComparisonImage
  /**
   * The pre-procedure photo. Optional — when omitted the shader synthesizes an
   * aged plate from `after`. Note the CSS tiers cannot synthesize, so they show
   * a desaturated `after` instead: supply real pairs for production.
   */
  before?: ComparisonImage
  /** e.g. "Rhinoplasty" — shown as the stage caption. */
  procedureLabel: string
  /** e.g. "Torn Paper" — the name of the transition study. */
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
  /** Secondary jewel tone used for "before" markers, kept distinct from `accent`. */
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
  /** Merged over the default theme — only override the tokens you need. */
  theme?: Partial<ComparatorTheme>
  /** Merged over the default (English) copy. */
  copy?: Partial<ComparatorCopy>
  /** Font-family CSS values, typically the `.style.fontFamily` of a next/font export. */
  displayFontFamily?: string
  bodyFontFamily?: string
  showQuickNav?: boolean
  showHero?: boolean
  className?: string
}
