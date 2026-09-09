import localFont from 'next/font/local'

/**
 * /v12 font stack — Iranized THE GRIND port (Persian UI, sports medicine).
 * Shabnam (100–700) is the Persian text family already self-hosted in
 * public/fonts (same files production, /v5, /v9, /v10 and /v11 use). It
 * takes the role Inter had in the original. FarsiAdad plays Anton's
 * display role — a heavy Persian display face that keeps the poster-like
 * condensed impact of the original headlines. The original Latin
 * Anton/Inter Google fonts are never loaded. Variables are v12-scoped
 * and consumed only inside app/v12/globals.css.
 */
export const shabnamV12 = localFont({
  src: [
    { path: '../../public/fonts/Shabnam-Thin.woff2', weight: '100' },
    { path: '../../public/fonts/Shabnam-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Shabnam.woff2', weight: '400' },
    { path: '../../public/fonts/Shabnam-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Shabnam-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v12-sans',
  display: 'swap',
})

export const farsiAdadV12 = localFont({
  src: [
    { path: '../../public/fonts/FarsiAdad-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/FarsiAdad-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v12-display',
  display: 'swap',
})
