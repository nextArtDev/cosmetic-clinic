import localFont from 'next/font/local'

/**
 * /v5 font stack — NOVA Capillaire port (Manrope + Instrument Serif).
 * Files are self-hosted under public/v5/fonts (fontsource latin subsets),
 * hashed and preloaded by next/font/local. No external requests.
 * Variables are v5-scoped (--font-v5-sans/--font-v5-serif) and consumed
 * only inside app/v5/globals.css.
 */
export const manropeV5 = localFont({
  src: [
    { path: '../../public/v5/fonts/manrope-200.woff2', weight: '200' },
    { path: '../../public/v5/fonts/manrope-300.woff2', weight: '300' },
    { path: '../../public/v5/fonts/manrope-400.woff2', weight: '400' },
    { path: '../../public/v5/fonts/manrope-500.woff2', weight: '500' },
    { path: '../../public/v5/fonts/manrope-600.woff2', weight: '600' },
    { path: '../../public/v5/fonts/manrope-700.woff2', weight: '700' },
    { path: '../../public/v5/fonts/manrope-800.woff2', weight: '800' },
  ],
  variable: '--font-v5-sans',
  display: 'swap',
})

export const instrumentV5 = localFont({
  src: [
    { path: '../../public/v5/fonts/instrument-serif-400.woff2', weight: '400', style: 'normal' },
    { path: '../../public/v5/fonts/instrument-serif-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-v5-serif',
  display: 'swap',
})
