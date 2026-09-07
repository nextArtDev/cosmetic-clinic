import localFont from 'next/font/local'

/**
 * /v8 font stack — Iranized Clingr port (Persian UI).
 * Shabnam (100–700) plays the Sofia Pro role (body family), FarsiAdad
 * plays the SangBleu Sunrise role (display family). Both are already
 * self-hosted in public/fonts (same files the production routes and
 * /v2–/v7 use). next/font/local self-hosts, hashes, and preloads — no
 * external requests. Variables are v8-scoped and consumed only inside
 * app/v8/globals.css.
 */
export const shabnamV8 = localFont({
  src: [
    { path: '../../public/fonts/Shabnam-Thin.woff2', weight: '100' },
    { path: '../../public/fonts/Shabnam-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Shabnam.woff2', weight: '400' },
    { path: '../../public/fonts/Shabnam-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Shabnam-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v8-sans',
  display: 'swap',
})

export const farsiAdadV8 = localFont({
  src: [
    { path: '../../public/fonts/FarsiAdad-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/FarsiAdad-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v8-display',
  display: 'swap',
})
