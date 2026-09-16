import localFont from 'next/font/local';

/**
 * /v22 font stack — the آریاسنگ (AryaSang) port of https://www.elitestone.it/
 * typesets in two self-hosted Persian faces, mirroring the upstream pairing of
 * a bespoke display serif ("Elite Stone") + Inter for UI/body:
 *   - SD Golpayegani (Persian serif)  → display headings, the luxury voice
 *   - Vazirmatn (Persian variable)    → body, UI, labels
 * Both variables are v22-scoped and consumed only inside
 * app/v22/components/elitone.module.css.
 */
export const golpayeganiV22 = localFont({
  src: '../../public/v22/fonts/SD-Golpayegani-Bold.woff2',
  variable: '--font-es-display',
  display: 'swap',
});

export const vazirmatnV22 = localFont({
  src: '../../public/v22/fonts/Vazirmatn.ttf',
  variable: '--font-es-body',
  display: 'swap',
});
