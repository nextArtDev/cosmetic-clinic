import type { ComparatorCopy, ComparatorTheme } from './types'

/**
 * "Atelier" theme — the default identity for this component.
 * Deep vitrine-black with a warm, slightly desaturated champagne accent
 * (not the near-black + acid-accent AI default, and not warm-cream/terracotta
 * either): the palette of a private surgical suite at night, not a landing
 * page. `gem` is a muted garnet reserved only for "before" state markers,
 * so before/after read as two distinct materials, not two shades of gold.
 */
export const DEFAULT_THEME: ComparatorTheme = {
  background: '#0b0a08',
  surface: '#15130f',
  ink: '#f2ead6',
  inkMuted: '#9c8f72',
  accent: '#cfae74',
  accentSoft: '#e9d9ad',
  accentDeep: '#7c611f',
  gem: '#7a3341',
  border: 'rgba(242, 234, 214, 0.10)',
}

export const DEFAULT_COPY: ComparatorCopy = {
  eyebrow: 'Case Studies in Transformation',
  heading: 'Thirteen studies in what changes, rendered in real time',
  subheading:
    'Each frame responds to your scroll, one to one. Hold any frame to see the starting point.',
  scrollHint: 'Scroll to advance',
  holdHint: 'Hold to reveal before',
  progressLabel: (percent) => `${percent}% transformed`,
  beforeLabel: (procedure) => `Before — ${procedure}`,
  afterLabel: (procedure) => `After — ${procedure}`,
  fallbackDragHint: 'Drag to compare',
  footnote:
    'Results vary by patient and procedure. Provide matched before/after pairs for production use — a synthesized plate is shown only when no "before" photo is supplied.',
}

export const FA_COPY: ComparatorCopy = {
  eyebrow: 'مطالعات موردیِ تحول',
  heading: 'سیزده مطالعه از آنچه تغییر می‌کند، به‌صورت زنده',
  subheading: 'هر قاب دقیقاً همگام با اسکرول شما حرکت می‌کند. برای دیدن حالت اولیه، لمس‌نگه‌دارید.',
  scrollHint: 'برای ادامه اسکرول کنید',
  holdHint: 'برای دیدن پیش از، نگه دارید',
  progressLabel: (percent) => `${percent}٪ تحول`,
  beforeLabel: (procedure) => `پیش از — ${procedure}`,
  afterLabel: (procedure) => `پس از — ${procedure}`,
  fallbackDragHint: 'برای مقایسه بکشید',
  footnote:
    'نتایج بسته به بیمار و نوع عمل متفاوت است. برای استفاده واقعی، جفت تصاویر پیش/پس از را ارائه دهید؛ تصویر ساخته‌شده تنها زمانی نمایش داده می‌شود که تصویر «پیش از» موجود نباشد.',
}

export function mergeTheme(theme?: Partial<ComparatorTheme>): ComparatorTheme {
  return { ...DEFAULT_THEME, ...theme }
}

export function mergeCopy(
  base: ComparatorCopy,
  copy?: Partial<ComparatorCopy>,
): ComparatorCopy {
  return { ...base, ...copy }
}

/** Maps a theme to CSS custom properties consumed by every child component. */
export function themeToCssVars(
  theme: ComparatorTheme,
  fonts: { display?: string; body?: string },
): React.CSSProperties {
  return {
    '--cc-bg': theme.background,
    '--cc-surface': theme.surface,
    '--cc-ink': theme.ink,
    '--cc-ink-muted': theme.inkMuted,
    '--cc-accent': theme.accent,
    '--cc-accent-soft': theme.accentSoft,
    '--cc-accent-deep': theme.accentDeep,
    '--cc-gem': theme.gem,
    '--cc-border': theme.border,
    '--cc-font-display': fonts.display ?? 'Georgia, "Times New Roman", serif',
    '--cc-font-body': fonts.body ?? 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties
}
