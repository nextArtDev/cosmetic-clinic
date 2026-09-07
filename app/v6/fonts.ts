import localFont from 'next/font/local'

/**
 * /v6 font stack — Iranized LIKHA port (Persian UI).
 * Shabnam (100–700) is the Persian text family self-hosted in public/fonts
 * (same files production and /v2, /v3, /v5 use). FarsiAdad plays the display
 * role Gilda Display had in the original — it is a Persian display face with
 * a comparable elegant, high-contrast feel. next/font/local self-hosts,
 * hashes and preloads — no external requests. Variables are v6-scoped and
 * consumed only inside app/v6/globals.css.
 */
export const shabnamV6 = localFont({
  src: [
    { path: '../../public/fonts/Shabnam-Thin.woff2', weight: '100' },
    { path: '../../public/fonts/Shabnam-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Shabnam.woff2', weight: '400' },
    { path: '../../public/fonts/Shabnam-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Shabnam-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v6-sans',
  display: 'swap',
})

export const farsiAdadV6 = localFont({
  src: [
    { path: '../../public/fonts/FarsiAdad-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/FarsiAdad-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v6-display',
  display: 'swap',
})
