/** Convert Latin digits in a value to Persian digits. */
export function toFaDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/** Format a toman price with Persian thousand separators + digits. */
export function faToman(value: number): string {
  return toFaDigits(new Intl.NumberFormat("en-US").format(value));
}

/** Zero-padded Persian index: 1 -> "۰۱" */
export function faIndex(i: number): string {
  return toFaDigits(String(i).padStart(2, "0"));
}
