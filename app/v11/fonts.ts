import localFont from 'next/font/local'

/**
 * /v11 font stack — Iranized ShowcaseMD port (Persian UI, OB/GYN clinic).
 * Shabnam (100–700) is the Persian text family already self-hosted in
 * public/fonts (same files production, /v5, /v9 and /v10 use). It takes
 * the role Suisse Int'l had in the original. SD Golpayegani (a classic
 * bold Naskh display face) plays the "Awesome Serif" accent role — the
 * serif words that sit inside the big headings. FarsiAdad stays available
 * for numeric accents. The original Latin Suisse/Awesome OTF files are
 * never loaded — no page needs Latin display type. Variables are v11-
 * scoped and consumed only inside app/v11/globals.css.
 */
export const shabnamV11 = localFont({
  src: [
    { path: '../../public/fonts/Shabnam-Thin.woff2', weight: '100' },
    { path: '../../public/fonts/Shabnam-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Shabnam.woff2', weight: '400' },
    { path: '../../public/fonts/Shabnam-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Shabnam-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v11-sans',
  display: 'swap',
})

export const golpayeganiV11 = localFont({
  src: [{ path: '../../public/fonts/SD-Golpayegani Bold.woff2', weight: '400' }],
  variable: '--font-v11-serif',
  display: 'swap',
})
