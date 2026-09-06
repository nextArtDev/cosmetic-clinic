import localFont from 'next/font/local'

/**
 * /v2 (Doctor Shanina port — دکتر شبنم فضلی) font stack.
 * Persian UI needs a proper Arabic-script family: the latin Inter Tight /
 * Manrope pair from the original cannot render Farsi. Shabnam is already
 * self-hosted in public/fonts (used by the production home route too).
 * next/font/local self-hosts, hashes, and preloads — no external requests.
 */
export const shabnamV2 = localFont({
  src: [
    { path: '../../public/fonts/Shabnam-Thin.woff2', weight: '100' },
    { path: '../../public/fonts/Shabnam-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Shabnam.woff2', weight: '400' },
    { path: '../../public/fonts/Shabnam-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Shabnam-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v2-sans',
  display: 'swap',
})
