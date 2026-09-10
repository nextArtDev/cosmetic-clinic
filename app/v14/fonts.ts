import localFont from 'next/font/local'

/**
 * /v14 font stack — Iranized thegrind.nl (Maciej Maćkowiak) port, rebuilt
 * for a Persian psychologist. Shabnam (100–700) is the Persian text family
 * already self-hosted in public/fonts (same files production, /v5, /v7,
 * /v9–/v11 use). It takes the role Aestetico (body sans) had in the
 * original. SD Golpayegani (classic bold Naskh display face, same role as
 * in /v11) plays the Migra serif display role for h1/h2/h3 — Persian has
 * no true italic, so the original's italic Latin serif is replaced by a
 * Naskh display face rather than a synthetic slant. Variables are v14-
 * scoped and consumed only inside app/v14/globals.css.
 */
export const shabnamV14 = localFont({
  src: [
    { path: '../../public/fonts/Shabnam-Thin.woff2', weight: '100' },
    { path: '../../public/fonts/Shabnam-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Shabnam.woff2', weight: '400' },
    { path: '../../public/fonts/Shabnam-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Shabnam-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v14-sans',
  display: 'swap',
})

export const golpayeganiV14 = localFont({
  src: [{ path: '../../public/fonts/SD-Golpayegani Bold.woff2', weight: '400' }],
  variable: '--font-v14-serif',
  display: 'swap',
})
