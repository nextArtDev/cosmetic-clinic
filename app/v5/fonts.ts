import localFont from 'next/font/local'

/**
 * /v5 font stack — Iranized NOVA port (Persian UI).
 * Shabnam (100–700) is the Persian text family already self-hosted in
 * public/fonts (same files the production home route and /v2, /v3 use).
 * FarsiAdad plays the display/accent role that Instrument Serif had in the
 * original (accent words, serif moments) — it's a Persian display face.
 * next/font/local self-hosts, hashes, and preloads — no external requests.
 * Variables are v5-scoped and consumed only inside app/v5/globals.css.
 */
export const shabnamV5 = localFont({
  src: [
    { path: '../../public/fonts/Shabnam-Thin.woff2', weight: '100' },
    { path: '../../public/fonts/Shabnam-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Shabnam.woff2', weight: '400' },
    { path: '../../public/fonts/Shabnam-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Shabnam-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v5-sans',
  display: 'swap',
})

export const farsiAdadV5 = localFont({
  src: [
    { path: '../../public/fonts/FarsiAdad-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/FarsiAdad-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v5-serif',
  display: 'swap',
})
