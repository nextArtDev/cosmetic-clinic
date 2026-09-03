// lib/holidays.ts
// Official Iranian solar (Shamsi/Jalali) holidays.
// Religious (lunar Hijri) holidays are managed via ClinicClosure records in the DB.

import { toJalaali } from 'jalaali-js'
import { formatInTimeZone } from 'date-fns-tz'

export interface JalaliHoliday {
  month: number // 1 = Farvardin … 12 = Esfand
  day: number
  name: string
}

/** Fixed solar holidays on the Jalali calendar. */
export const JALALI_HOLIDAYS: JalaliHoliday[] = [
  { month: 1, day: 1, name: 'نوروز' },
  { month: 1, day: 2, name: 'نوروز' },
  { month: 1, day: 3, name: 'نوروز' },
  { month: 1, day: 4, name: 'نوروز' },
  { month: 1, day: 12, name: 'روز جمهوری اسلامی' },
  { month: 1, day: 13, name: 'روز طبیعت' },
  { month: 3, day: 14, name: 'رحلت امام خمینی' },
  { month: 3, day: 15, name: 'قیام ۱۵ خرداد' },
  { month: 11, day: 22, name: 'پیروزی انقلاب اسلامی' },
  { month: 12, day: 29, name: 'ملی‌شدن صنعت نفت' },
]

/** Look up a holiday by Jalali (month, day). Returns the holiday name or null. */
export function getJalaliHoliday(
  _jy: number,
  jm: number,
  jd: number,
): string | null {
  for (const h of JALALI_HOLIDAYS) {
    if (h.month === jm && h.day === jd) return h.name
  }
  return null
}

/** Look up a holiday for a Gregorian "YYYY-MM-DD" date string. */
export function getHolidayFromISO(dateISO: string): string | null {
  const [gy, gm, gd] = dateISO.split('-').map(Number)
  if (!gy || !gm || !gd) return null
  try {
    const j = toJalaali(gy, gm, gd)
    return getJalaliHoliday(j.jy, j.jm, j.jd)
  } catch {
    return null
  }
}

/** Look up a holiday for a JS Date, interpreted in a fixed time zone. */
export function getHolidayFromDate(
  date: Date,
  tz = 'Asia/Tehran',
): string | null {
  return getHolidayFromISO(formatInTimeZone(date, tz, 'yyyy-MM-dd'))
}

/**
 * Compute all fixed solar holidays inside a Gregorian date range.
 * Returns a map of "YYYY-MM-DD" -> holiday name.
 * Keys are in the clinic timezone (Asia/Tehran) to match the calendar.
 */
export function getHolidaysInRange(
  startISO: string,
  endISO: string,
  tz = 'Asia/Tehran',
): Record<string, string> {
  const result: Record<string, string> = {}
  const [sy, sm, sd] = startISO.split('-').map(Number)
  const [ey, em, ed] = endISO.split('-').map(Number)
  const start = new Date(Date.UTC(sy, sm - 1, sd))
  const end = new Date(Date.UTC(ey, em - 1, ed))
  if (start > end) return result

  // Iterate day by day over the range
  const cursor = new Date(start)
  while (cursor <= end) {
    const iso = formatInTimeZone(cursor, tz, 'yyyy-MM-dd')
    const name = getHolidayFromISO(iso)
    if (name) result[iso] = name
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return result
}
