import localFont from 'next/font/local'

/**
 * Kosar (v1) font stack — loaded from the copied public/v1/fonts assets.
 * Uses `next/font/local` so fonts are self-hosted, hashed, and optimized
 * exactly like the root app's system fonts.
 */

export const shabnamFont = localFont({
  src: '../public/v1/fonts/Shabnam.woff2',
  variable: '--font-v1-sans',
  display: 'swap',
})

export const farsiFont = localFont({
  src: '../public/v1/fonts/FarsiFont.woff2',
  variable: '--font-v1-display',
  display: 'swap',
})

export const farsiAdad = localFont({
  src: '../public/v1/fonts/FarsiAdad.woff2',
  variable: '--font-v1-numeric',
  display: 'swap',
})

export const farsiAdadBold = localFont({
  src: '../public/v1/fonts/FarsiAdad-Bold.woff2',
  variable: '--font-v1-numeric-bold',
  display: 'swap',
})

export const v1Fonts = [shabnamFont, farsiFont, farsiAdad, farsiAdadBold]
