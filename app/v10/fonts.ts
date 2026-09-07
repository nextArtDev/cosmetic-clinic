import localFont from 'next/font/local'

/**
 * /v10 font stack — Iranized NERVANA port (Persian UI).
 * Shabnam (100–700) is the Persian text family already self-hosted in
 * public/fonts (same files production and /v5, /v9 use). It takes the role
 * Planar had in the original. FarsiAdad plays Fraktion's display/mono role
 * (numbers, eyebrows, small caps). The original Latin woff2 files are
 * still shipped in public/v10/assets but NOT loaded — no page ever needs
 * Latin display type. Variables are v10-scoped and consumed only inside
 * app/v10/globals.css.
 */
export const shabnamV10 = localFont({
  src: [
    { path: '../../public/fonts/Shabnam-Thin.woff2', weight: '100' },
    { path: '../../public/fonts/Shabnam-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Shabnam.woff2', weight: '400' },
    { path: '../../public/fonts/Shabnam-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Shabnam-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v10-sans',
  display: 'swap',
})

export const farsiAdadV10 = localFont({
  src: [
    { path: '../../public/fonts/FarsiAdad-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/FarsiAdad-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v10-display',
  display: 'swap',
})
