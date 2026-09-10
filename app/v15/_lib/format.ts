/** Persian digit + price helpers used across the V15 experience. */

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Convert latin digits in any string/number to Persian digits. */
export function faDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** 46500000 -> «۴۶٬۵۰۰٬۰۰۰» */
export function faNumber(n: number): string {
  return faDigits(n.toLocaleString('en-US').replace(/,/g, '٬'));
}

/** 46500000 -> «۴۶٬۵۰۰٬۰۰۰ تومان» */
export function toman(n: number): string {
  return `${faNumber(n)} تومان`;
}

/** Pad two digits and convert: 3 -> «۰۳» */
export function faIndex(n: number): string {
  return faDigits(String(n).padStart(2, '0'));
}
