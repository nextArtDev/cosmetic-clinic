// lib/scheduling/tz.ts
// THE single timezone utility module. No other file in the codebase is
// allowed to do "HH:MM" <-> Date math. All "HH:MM" strings in the DB are
// clinic-local time (AppSettings.timezone); all Appointment timestamps are UTC.
//
//   npm i date-fns date-fns-tz

import { fromZonedTime, formatInTimeZone } from 'date-fns-tz'

/** "2026-07-10" + "08:00" in clinic tz -> exact UTC instant. DST-safe. */
export function clinicTimeToUTC(
  dateISO: string,
  hhmm: string,
  tz: string,
): Date {
  return fromZonedTime(`${dateISO}T${hhmm}:00`, tz)
}

/**
 * Weekday (Sunday=0 ... Saturday=6) of a clinic-local calendar date.
 *
 * Note: `dateISO` IS a clinic-local calendar date, and the weekday of a
 * calendar date is timezone-independent — 2026-07-10 is a Friday everywhere.
 * So we can read it with plain UTC math, no tz needed.
 */
export function clinicWeekday(dateISO: string): number {
  return new Date(`${dateISO}T00:00:00Z`).getUTCDay()
}

/** UTC instant of 00:00 clinic time on the given clinic-local date. */
export function dayStartUTC(dateISO: string, tz: string): Date {
  return clinicTimeToUTC(dateISO, '00:00', tz)
}

/**
 * UTC instant of 00:00 clinic time on the NEXT day (exclusive upper bound).
 * Use as: appointmentStartUTC >= dayStartUTC AND < dayEndUTC.
 * Built from the next calendar date (not +24h) so DST days stay correct.
 */
export function dayEndUTC(dateISO: string, tz: string): Date {
  const d = new Date(`${dateISO}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return clinicTimeToUTC(d.toISOString().slice(0, 10), '00:00', tz)
}

/** UTC instant -> clinic-local "HH:MM" label (what the patient sees). */
export function toClinicHHMM(dateUTC: Date, tz: string): string {
  return formatInTimeZone(dateUTC, tz, 'HH:mm')
}

/** UTC instant -> clinic-local "YYYY-MM-DD" (for grouping/display). */
export function toClinicDateISO(dateUTC: Date, tz: string): string {
  return formatInTimeZone(dateUTC, tz, 'yyyy-MM-dd')
}

/** UTC instant -> full clinic-local display, e.g. "2026-07-10 16:30". */
export function toClinicDateTime(dateUTC: Date, tz: string): string {
  return formatInTimeZone(dateUTC, tz, 'yyyy-MM-dd HH:mm')
}

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/

/** Validate an "HH:MM" string (also exported for zod schemas). */
export function isValidHHMM(s: string): boolean {
  return HHMM_RE.test(s)
}
export { HHMM_RE }

/** "HH:MM" -> minutes since midnight, for pure string-domain overlap checks. */
export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function getAppTimeZone(): string {
  const defaultTimeZone = 'Asia/Tehran'
  const timeZone = process.env.APP_TIMEZONE || defaultTimeZone
  // Validate that the time zone is supported
  try {
    Intl.DateTimeFormat(undefined, { timeZone })
    return timeZone
  } catch {
    console.error(
      `Invalid time zone: ${timeZone}, falling back to ${defaultTimeZone}`,
    )
    return defaultTimeZone
  }
}
