import localFont from 'next/font/local';

/**
 * /v20 font stack — the IRANFIT port (atumobile-inspired fitness concept)
 * typesets in Vazirmatn. Upstream loaded it from Google Fonts
 * (next/font/google), which is unreliable from this app's Iran-network
 * build environment, so — exactly like /v17 and /v18 — the variable TTF
 * of the official `vazirmatn` package (v33.0.3) is self-hosted at
 * public/v20/fonts/Vazirmatn.ttf (SIL OFL 1.1). The variable is v20-scoped
 * and consumed only inside app/v20/iranfit.css as `--font-iranfit`.
 */
export const vazirmatnV20 = localFont({
  src: '../../public/v20/fonts/Vazirmatn.ttf',
  variable: '--font-iranfit',
  display: 'swap',
});
