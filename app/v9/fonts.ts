import localFont from 'next/font/local'

/**
 * /v9 font stack — Iranized Salvato port (Persian UI, dental clinic).
 * Shabnam (100–700) is the Persian text family already self-hosted in
 * public/fonts (same files the production home route and /v7 use).
 * FarsiAdad plays the display role that "The Seasons"/"Novecento" had in
 * the original — a Persian display face for headlines and nav accents.
 * next/font/local self-hosts, hashes, and preloads — no external requests.
 * Variables are v9-scoped and consumed only inside app/v9/globals.css.
 */
export const shabnamV9 = localFont({
  src: [
    { path: '../../public/fonts/Shabnam-Thin.woff2', weight: '100' },
    { path: '../../public/fonts/Shabnam-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Shabnam.woff2', weight: '400' },
    { path: '../../public/fonts/Shabnam-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Shabnam-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v9-sans',
  display: 'swap',
})

export const farsiAdadV9 = localFont({
  src: [
    { path: '../../public/fonts/FarsiAdad-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/FarsiAdad-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v9-display',
  display: 'swap',
})
