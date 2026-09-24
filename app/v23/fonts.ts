import localFont from 'next/font/local';

/**
 * /v23 font stack — the port of https://jacques-cie.com/ typesets every role in
 * a single geometric grotesque (Aeonik, declared as both `--ff-heading` and
 * `--ff-paragraph` in the reference's own stylesheet).
 *
 * The Persian equivalent keeps that one-family system rather than inventing a
 * display/body pairing the reference does not have: Vazirmatn is a geometric
 * Persian sans with the same neutral, clinical tone. The variable is v23-scoped
 * and consumed only inside styles/jacques.module.css.
 */
export const vazirmatnV23 = localFont({
  src: '../../public/v23/fonts/Vazirmatn.ttf',
  variable: '--font-jc-body',
  display: 'swap',
  weight: '100 900',
});
