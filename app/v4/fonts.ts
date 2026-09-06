import localFont from 'next/font/local'

/**
 * /v4 font stack. The port is fully Persian now, so it reuses the Shabnam
 * family already self-hosted in public/fonts for the production routes.
 * next/font/local self-hosts, hashes, and preloads — no external requests.
 */
export const shabnamV4 = localFont({
  src: [
    { path: '../../public/fonts/Shabnam-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Shabnam.woff2', weight: '400' },
    { path: '../../public/fonts/Shabnam-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Shabnam-Bold.woff2', weight: '700' },
  ],
  variable: '--font-v4-sans',
  display: 'swap',
})
