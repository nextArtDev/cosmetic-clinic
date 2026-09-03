'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  User,
  Users,
} from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Calendar as JalaliCalendar } from '@/components/ui/calendar'
import {
  fetchAvailableSlots,
  type SlotDTO,
} from '@/lib/actions/home/booking/get-slots'
import { fetchAvailableDates } from '@/lib/actions/home/booking/get-available-dates'
import { createBooking } from '@/lib/actions/dashboard/booking/create-booking'
import { cn, initials } from '../lib/utils'
import { formatter } from '@/lib/utils'
import type { Doctor } from '../lib/data'

const APP_TZ = 'Asia/Tehran'

type PatientType = 'MYSELF' | 'SOMEONE_ELSE'

interface BookingFormProps {
  doctors: Doctor[]
  initialDoctorId?: string
  closedDates: string[]
  holidays: Record<string, string>
  maxAdvanceBookingDays: number
  loggedIn: boolean
}

const STEPS = ['پزشک', 'زمان', 'مشخصات', 'تأیید'] as const

function toDateISO(date: Date): string {
  return formatInTimeZone(date, APP_TZ, 'yyyy-MM-dd')
}

function jalaliDayLabel(date: Date): string {
  return format(date, 'EEEE d MMMM', { locale: faIR })
}

/** Compare two dates by their calendar day (ignores time). */
function isSameCalendarDay(a: Date, b: Date): boolean {
  return toDateISO(a) === toDateISO(b)
}

export function BookingForm({
  doctors,
  initialDoctorId,
  closedDates,
  holidays,
  maxAdvanceBookingDays,
  loggedIn,
}: BookingFormProps) {
  const [step, setStep] = useState(0)
  const [doctorId, setDoctorId] = useState<string>(initialDoctorId ?? '')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [slots, setSlots] = useState<SlotDTO[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slot, setSlot] = useState<SlotDTO | null>(null)
  const [patientType, setPatientType] = useState<PatientType>('MYSELF')
  const [patientName, setPatientName] = useState('')
  const [patientRelation, setPatientRelation] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [reasonForVisit, setReasonForVisit] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<Set<string> | null>(null)
  const [availableDatesLoading, setAvailableDatesLoading] = useState(
    Boolean(initialDoctorId),
  )

  const doctor = useMemo(
    () => doctors.find((d) => d.userId === doctorId),
    [doctors, doctorId],
  )

  // Fetch the set of dates on which the selected doctor has availability.
  // This lets us disable calendar days with no slots up front.
  useEffect(() => {
    if (!doctorId) return
    let cancelled = false
    fetchAvailableDates(doctorId, maxAdvanceBookingDays).then((dates) => {
      if (cancelled) return
      setAvailableDates(new Set(dates))
      setAvailableDatesLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [doctorId, maxAdvanceBookingDays])

  // Disabled dates: past days, beyond booking window, clinic closures,
  // and days where the selected doctor has no availability.
  const disabledDates = useMemo(() => {
    const closed = new Set(closedDates)
    const today = new Date()
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + maxAdvanceBookingDays)

    return (d: Date) => {
      const iso = toDateISO(d)

      // Past days (compare by calendar day, not timestamp)
      if (isSameCalendarDay(d, today)) {
        // Today is allowed — the slot engine handles lead-time
      } else if (d < today) {
        return true
      }

      // Beyond booking window
      if (d > maxDate) return true

      // Clinic closure
      if (closed.has(iso)) return true

      // Doctor has no availability on this day
      if (availableDates && !availableDates.has(iso)) return true

      return false
    }
  }, [closedDates, maxAdvanceBookingDays, availableDates])

  // Calendar modifiers: holidays
  const calendarModifiers = useMemo(() => {
    const holidayDates: Date[] = []
    for (const iso of Object.keys(holidays)) {
      const [y, m, d] = iso.split('-').map(Number)
      holidayDates.push(new Date(y, m - 1, d))
    }
    return { holiday: holidayDates }
  }, [holidays])

  useEffect(() => {
    if (!doctorId || !date) return
    let cancelled = false
    fetchAvailableSlots(doctorId, toDateISO(date)).then((res) => {
      if (cancelled) return
      setSlots(res.slots)
      if (res.error) toast.error(res.error)
      setSlotsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [doctorId, date])

  const canProceed =
    (step === 0 && !!doctorId) ||
    (step === 1 && slot !== null) ||
    (step === 2 && patientName.trim().length > 1) ||
    step === 3

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  async function confirm() {
    if (!doctor || !slot || !date) return
    setSubmitting(true)
    setFormError(null)
    const result = await createBooking(
      {
        doctorId: doctor.userId,
        dateISO: toDateISO(date),
        slotStartUTC: new Date(slot.startUTC),
        patientType,
        patientName,
        patientRelation:
          patientType === 'SOMEONE_ELSE' ? patientRelation : undefined,
        phoneNumber,
        reasonForVisit,
        paymentMethod: 'ONLINE',
      },
      '/booking',
    )
    setSubmitting(false)
    if (result.errors?._form?.[0]) {
      setFormError(result.errors._form[0])
      toast.error(result.errors._form[0])
    }
  }

  if (!loggedIn) {
    return (
      <div className="glass-panel mx-auto max-w-xl p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/20 text-sage-mist">
          <User size={24} />
        </span>
        <h2 className="mt-6 font-display text-2xl text-ivory">
          برای رزرو نوبت وارد شوید
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
          رزرو نوبت نیاز به حساب کاربری دارد. با شمارهٔ موبایل خود وارد شوید؛
          بدون رمز عبور و فقط با کد تأیید پیامکی.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/v1/signin?callbackUrl=/v1/booking">ورود با شماره موبایل</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Step indicator */}
      <div className="mb-10 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-mono transition-colors duration-300',
                  i < step
                    ? 'border-gold bg-gold text-ink'
                    : i === step
                      ? 'border-gold text-gold'
                      : 'border-glass-border text-ivory-dim',
                )}
              >
                {i < step ? <Check size={13} /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-xs sm:block',
                  i <= step ? 'text-ivory' : 'text-ivory-dim',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-3 h-px flex-1 transition-colors duration-500',
                  i < step ? 'bg-gold' : 'bg-glass-border',
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="glass-panel min-h-[420px] p-8 md:p-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="doctor"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="font-display text-2xl text-ivory">
                پزشک را انتخاب کنید
              </h2>
              <p className="mt-1 text-sm text-ivory-dim">
                متخصص موردنظر خود را از میان پزشکان کلینیک انتخاب کنید.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {doctors.map((d) => (
                  <button
                    key={d.userId}
                    onClick={() => {
                      setDoctorId(d.userId)
                      setDate(undefined)
                      setSlot(null)
                      setAvailableDates(null)
                      setAvailableDatesLoading(true)
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300',
                      doctorId === d.userId
                        ? 'border-gold bg-gold/10'
                        : 'border-glass-border hover:border-gold/40',
                    )}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sage-bright/40 to-sage/20 font-display text-sm text-ivory">
                      {initials(d.name)}
                    </span>
                    <span>
                      <span className="block text-sm text-ivory">{d.name}</span>
                      <span className="block text-xs text-ivory-dim">
                        {d.title}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="time"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="font-display text-2xl text-ivory">
                تاریخ و ساعت نوبت
              </h2>
              <p className="mt-1 text-sm text-ivory-dim">
                روز موردنظر را در تقویم انتخاب کنید و سپس ساعت را از نوبت‌های
                خالی {doctor?.name} برگزینید.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex justify-center rounded-2xl border border-glass-border p-4">
                  {availableDatesLoading ? (
                    <div className="flex h-[300px] w-full items-center justify-center">
                      <Loader2
                        size={20}
                        className="animate-spin text-ivory-dim"
                      />
                    </div>
                  ) : (
                    <JalaliCalendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        setDate(d as Date | undefined)
                        setSlot(null)
                        setSlots([])
                        setSlotsLoading(true)
                      }}
                      disabled={disabledDates}
                      modifiers={calendarModifiers}
                      holidayNames={holidays}
                      className="rounded-xl bg-ink-soft/40 text-ivory [&_.rdp-day]:text-ivory [&_.rdp-day]:[&_button]:hover:bg-gold/20 [&_button]:focus-visible:ring-gold/50"
                    />
                  )}
                </div>

                <div>
                  {!date ? (
                    <p className="rounded-2xl border border-dashed border-glass-border p-6 text-center text-sm text-ivory-dim">
                      ابتدا یک روز را انتخاب کنید.
                    </p>
                  ) : slotsLoading ? (
                    <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-glass-border p-6 text-sm text-ivory-dim">
                      <Loader2 size={16} className="animate-spin" />
                      در حال دریافت نوبت‌های خالی...
                    </p>
                  ) : slots.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-glass-border p-6 text-center text-sm text-ivory-dim">
                      در این روز نوبت خالی وجود ندارد. روز دیگری را انتخاب کنید.
                    </p>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto pr-1">
                      <p className="mb-3 text-xs text-ivory-dim">
                        نوبت‌های {jalaliDayLabel(date)}:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((s) => (
                          <button
                            key={s.startUTC}
                            onClick={() => setSlot(s)}
                            className={cn(
                              'relative rounded-xl border px-2 py-3 text-center font-mono text-sm transition-all duration-300',
                              slot?.startUTC === s.startUTC
                                ? 'border-gold bg-gold/10 text-gold-soft'
                                : s.reservedByMe
                                  ? 'border-sage-bright/50 bg-sage/10 text-sage-mist hover:border-sage-bright'
                                  : 'border-glass-border text-ivory hover:border-gold/40',
                            )}
                          >
                            {s.label}
                            {s.reservedByMe && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-sage-bright text-ink">
                                <Lock size={8} />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      {slots.some((s) => s.reservedByMe) && (
                        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-sage-mist">
                          <Lock size={11} />
                          نوبت‌های قفل‌شده متعلق به شماست و فقط شما می‌توانید
                          آن‌ها را تکمیل کنید.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-ivory-dim">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full border border-gold/40 bg-gold/10" />
                  تعطیل رسمی
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted/40" />
                  بدون نوبت
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full border border-sage-bright/50 bg-sage/10" />
                  رزرو شده توسط شما
                </span>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="font-display text-2xl text-ivory">مشخصات بیمار</h2>
              <p className="mt-1 text-sm text-ivory-dim">
                این نوبت برای چه کسی است؟
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setPatientType('MYSELF')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-2xl border p-4 text-sm transition-all duration-300',
                    patientType === 'MYSELF'
                      ? 'border-gold bg-gold/10 text-ivory'
                      : 'border-glass-border text-ivory-dim hover:border-gold/40',
                  )}
                >
                  <User size={15} /> خودم
                </button>
                <button
                  onClick={() => setPatientType('SOMEONE_ELSE')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-2xl border p-4 text-sm transition-all duration-300',
                    patientType === 'SOMEONE_ELSE'
                      ? 'border-gold bg-gold/10 text-ivory'
                      : 'border-glass-border text-ivory-dim hover:border-gold/40',
                  )}
                >
                  <Users size={15} /> فرد دیگر
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs text-ivory-dim">
                    نام و نام خانوادگی بیمار
                  </span>
                  <input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="مثلاً علی رضایی"
                    className="mt-2 w-full rounded-xl border border-glass-border bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/50 outline-none focus-visible:border-gold"
                  />
                </label>
                {patientType === 'SOMEONE_ELSE' && (
                  <label className="block">
                    <span className="text-xs text-ivory-dim">
                      نسبت با بیمار
                    </span>
                    <input
                      value={patientRelation}
                      onChange={(e) => setPatientRelation(e.target.value)}
                      placeholder="مثلاً فرزند، همسر، پدر..."
                      className="mt-2 w-full rounded-xl border border-glass-border bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/50 outline-none focus-visible:border-gold"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="text-xs text-ivory-dim">
                    شماره موبایل (اختیاری)
                  </span>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    dir="ltr"
                    className="mt-2 w-full rounded-xl border border-glass-border bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/50 outline-none focus-visible:border-gold"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs text-ivory-dim">
                    دلیل مراجعه (اختیاری)
                  </span>
                  <textarea
                    value={reasonForVisit}
                    onChange={(e) => setReasonForVisit(e.target.value)}
                    rows={3}
                    placeholder="به‌طور خلاصه توضیح دهید دربارهٔ چه چیزی می‌خواهید گفت‌وگو کنید"
                    className="mt-2 w-full resize-none rounded-xl border border-glass-border bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/50 outline-none focus-visible:border-gold"
                  />
                </label>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/20 text-sage-mist">
                <CalendarCheck size={26} />
              </span>
              <h2 className="mt-6 font-display text-2xl text-ivory">
                بررسی و تأیید نوبت
              </h2>
              <p className="mt-1 max-w-sm text-sm text-ivory-dim">
                هنوز چیزی قطعی نشده است؛ با تأیید، این نوبت به‌صورت موقت رزرو
                شده و به درگاه پرداخت هدایت می‌شوید.
              </p>

              <div className="mt-8 w-full max-w-sm space-y-3 rounded-2xl border border-glass-border p-6 text-left text-sm">
                <div className="flex justify-between">
                  <span className="text-ivory-dim">پزشک</span>
                  <span className="text-ivory">{doctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory-dim">زمان</span>
                  <span className="text-ivory">
                    {date && slot
                      ? `${jalaliDayLabel(date)}، ساعت ${slot.label}`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory-dim">بیمار</span>
                  <span className="text-ivory">{patientName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory-dim">هزینهٔ ویزیت</span>
                  <span className="text-gold-soft">
                    {doctor
                      ? `${formatter.format(doctor.consultFee)} تومان`
                      : '—'}
                  </span>
                </div>
              </div>

              {formError && (
                <p className="mt-4 max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {formError}
                </p>
              )}

              <Button
                size="lg"
                className="mt-8"
                onClick={confirm}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> در حال ثبت
                    نوبت...
                  </>
                ) : (
                  'تأیید و ادامه به پرداخت'
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step < 3 && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 0}
            className="gap-1"
          >
            <ChevronLeft size={15} /> بازگشت
          </Button>
          <Button onClick={next} disabled={!canProceed} className="gap-1">
            ادامه <ChevronRight size={15} />
          </Button>
        </div>
      )}
      {step === 3 && (
        <div className="mt-6">
          <Button variant="ghost" onClick={back} className="gap-1">
            <ChevronLeft size={15} /> بازگشت
          </Button>
        </div>
      )}
    </div>
  )
}
