import localFont from 'next/font/local'

/**
 * /v7 font stack — Iranized Grigoriak port (Persian UI, laser clinic).
 * Shabnam (100–700) is the Persian text family already self-hosted in
 * public/fonts (same files the production home route and /v2, /v5 use).
 * FarsiAdad plays the display role that "Factor A"/"Moniqa" had in the
 * original (huge editorial headlines) — it's a Persian display face.
 * next/font/local self-hosts, hashes, and preloads — no external requests.
 * Variables are v7-scoped and consumed only inside app/v7/globals.css.
 */
export const shabnamV7 = localFont({
  src: [
    { path: '../../public/fonts/Shabnam-Thin.woff2', weight: '100' },
    { path: '../../public/fonts/Shabnam-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Shabnam.woff2', weight: '400' },
    { path: '../../public/fonts/Shabnam-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Shabnam-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v7-sans',
  display: 'swap',
})

export const farsiAdadV7 = localFont({
  src: [
    { path: '../../public/fonts/FarsiAdad-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/FarsiAdad-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v7-display',
  display: 'swap',
})
