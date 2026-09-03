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
import { Calendar as JalaliCalendar } from '@/components/ui/calendar'
import {
  fetchAvailableSlots,
  fetchBookingWindow,
  type SlotDTO,
} from '@/lib/actions/home/booking/get-slots'
import { fetchAvailableDates } from '@/lib/actions/home/booking/get-available-dates'
import { createBooking } from '@/lib/actions/dashboard/booking/create-booking'
import type { V1Doctor } from '@/lib/v1/data'
import { cn } from '@/lib/utils'

const APP_TZ = 'Asia/Tehran'

type PatientType = 'MYSELF' | 'SOMEONE_ELSE'

interface BookingFormProps {
  doctors: V1Doctor[]
  initialDoctorId?: string
  loggedIn: boolean
}

const STEPS = ['پزشک', 'زمان', 'مشخصات', 'تأیید'] as const

function toDateISO(date: Date): string {
  return formatInTimeZone(date, APP_TZ, 'yyyy-MM-dd')
}

function jalaliDayLabel(date: Date): string {
  return format(date, 'EEEE d MMMM', { locale: faIR })
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return toDateISO(a) === toDateISO(b)
}

export function BookingForm({
  doctors,
  initialDoctorId,
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
  const [windowData, setWindowData] = useState({
    closedDates: [] as string[],
    holidays: {} as Record<string, string>,
    maxAdvanceBookingDays: 30,
  })

  const doctor = useMemo(
    () => doctors.find((d) => d.userId === doctorId),
    [doctors, doctorId],
  )

  // Fetch booking window config once
  useEffect(() => {
    fetchBookingWindow().then(setWindowData)
  }, [])

  // Fetch the set of dates on which the selected doctor has availability.
  useEffect(() => {
    if (!doctorId) return
    let cancelled = false
    fetchAvailableDates(doctorId, windowData.maxAdvanceBookingDays).then(
      (dates) => {
        if (cancelled) return
        setAvailableDates(new Set(dates))
        setAvailableDatesLoading(false)
      },
    )
    return () => {
      cancelled = true
    }
  }, [doctorId, windowData.maxAdvanceBookingDays])

  const disabledDates = useMemo(() => {
    const closed = new Set(windowData.closedDates)
    const today = new Date()
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + windowData.maxAdvanceBookingDays)

    return (d: Date) => {
      const iso = toDateISO(d)
      if (isSameCalendarDay(d, today)) {
        // Today is allowed
      } else if (d < today) {
        return true
      }
      if (d > maxDate) return true
      if (closed.has(iso)) return true
      if (availableDates && !availableDates.has(iso)) return true
      return false
    }
  }, [windowData.closedDates, windowData.maxAdvanceBookingDays, availableDates])

  const calendarModifiers = useMemo(() => {
    const holidayDates: Date[] = []
    for (const iso of Object.keys(windowData.holidays)) {
      const [y, m, d] = iso.split('-').map(Number)
      holidayDates.push(new Date(y, m - 1, d))
    }
    return { holiday: holidayDates }
  }, [windowData.holidays])

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
      '/v1/booking',
    )
    setSubmitting(false)
    if (result.errors?._form?.[0]) {
      setFormError(result.errors._form[0])
      toast.error(result.errors._form[0])
    }
  }

  if (!loggedIn) {
    return (
      <div className="v1-glass v1-shadow mx-auto max-w-xl rounded-3xl p-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-800/15 text-teal-800">
          <User size={26} />
        </span>
        <h2 className="v1-title-gradient mt-6 text-2xl font-black">
          برای رزرو نوبت وارد شوید
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-black/60">
          رزرو نوبت نیاز به حساب کاربری دارد. با شمارهٔ موبایل خود وارد شوید؛
          بدون رمز عبور و فقط با کد تأیید پیامکی.
        </p>
        <Link
          href="/v1/login?callbackUrl=/v1/booking"
          className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-xl bg-teal-800 px-7 py-3 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
        >
          ورود با شماره موبایل
        </Link>
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
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-colors duration-300',
                  i < step
                    ? 'border-teal-800 bg-teal-800 text-white'
                    : i === step
                      ? 'border-teal-800 text-teal-800'
                      : 'border-black/15 text-black/40',
                )}
              >
                {i < step ? <Check size={13} /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-xs font-bold sm:block',
                  i <= step ? 'text-teal-900' : 'text-black/40',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-3 h-px flex-1 transition-colors duration-500',
                  i < step ? 'bg-teal-800' : 'bg-black/10',
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="v1-glass v1-shadow min-h-[420px] rounded-3xl p-8 md:p-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="doctor"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="v1-title-gradient text-2xl font-black">
                پزشک را انتخاب کنید
              </h2>
              <p className="mt-1 text-sm font-medium text-black/60">
                متخصص موردنظر خود را از میان پزشکان مجتمع انتخاب کنید.
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
                        ? 'border-teal-800 bg-teal-800/10'
                        : 'border-black/10 hover:border-teal-800/40',
                    )}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-700/30 to-teal-800/20 font-black text-teal-900">
                      {d.name.slice(0, 1)}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-teal-900">
                        دکتر {d.name}
                      </span>
                      <span className="block text-xs font-semibold text-black/55">
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
              <h2 className="v1-title-gradient text-2xl font-black">
                تاریخ و ساعت نوبت
              </h2>
              <p className="mt-1 text-sm font-medium text-black/60">
                روز موردنظر را در تقویم انتخاب کنید و سپس ساعت را از نوبت‌های
                خالی انتخاب کنید.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex justify-center rounded-2xl border border-black/10 bg-white/30 p-4 backdrop-blur-md">
                  {availableDatesLoading ? (
                    <div className="flex h-[300px] w-full items-center justify-center">
                      <Loader2
                        size={20}
                        className="animate-spin text-teal-800"
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
                      holidayNames={windowData.holidays}
                      className="rounded-xl bg-white/40 text-teal-950 [&_.rdp-day]:text-teal-950 [&_.rdp-day]:[&_button]:hover:bg-teal-800/20 [&_button]:focus-visible:ring-teal-800/50"
                    />
                  )}
                </div>

                <div>
                  {!date ? (
                    <p className="rounded-2xl border border-dashed border-black/20 p-6 text-center text-sm font-semibold text-black/50">
                      ابتدا یک روز را انتخاب کنید.
                    </p>
                  ) : slotsLoading ? (
                    <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-black/20 p-6 text-sm font-semibold text-black/50">
                      <Loader2 size={16} className="animate-spin" />
                      در حال دریافت نوبت‌های خالی...
                    </p>
                  ) : slots.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-black/20 p-6 text-center text-sm font-semibold text-black/50">
                      در این روز نوبت خالی وجود ندارد. روز دیگری را انتخاب کنید.
                    </p>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto pr-1">
                      <p className="mb-3 text-xs font-bold text-black/55">
                        نوبت‌های {jalaliDayLabel(date)}:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((s) => (
                          <button
                            key={s.startUTC}
                            onClick={() => setSlot(s)}
                            className={cn(
                              'relative rounded-xl border px-2 py-3 text-center font-mono text-sm font-bold transition-all duration-300',
                              slot?.startUTC === s.startUTC
                                ? 'border-teal-800 bg-teal-800/10 text-teal-900'
                                : s.reservedByMe
                                  ? 'border-green-600/50 bg-green-600/10 text-green-800 hover:border-green-600'
                                  : 'border-black/15 text-black/70 hover:border-teal-800/40',
                            )}
                          >
                            {s.label}
                            {s.reservedByMe && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-white">
                                <Lock size={8} />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      {slots.some((s) => s.reservedByMe) && (
                        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-green-800">
                          <Lock size={11} />
                          نوبت‌های قفل‌شده متعلق به شماست و فقط شما می‌توانید
                          آن‌ها را تکمیل کنید.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-black/50">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full border border-teal-800/40 bg-teal-800/10" />
                  تعطیل رسمی
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
                  بدون نوبت
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
              <h2 className="v1-title-gradient text-2xl font-black">
                مشخصات بیمار
              </h2>
              <p className="mt-1 text-sm font-medium text-black/60">
                این نوبت برای چه کسی است؟
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setPatientType('MYSELF')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all duration-300',
                    patientType === 'MYSELF'
                      ? 'border-teal-800 bg-teal-800/10 text-teal-900'
                      : 'border-black/10 text-black/50 hover:border-teal-800/40',
                  )}
                >
                  <User size={15} /> خودم
                </button>
                <button
                  onClick={() => setPatientType('SOMEONE_ELSE')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all duration-300',
                    patientType === 'SOMEONE_ELSE'
                      ? 'border-teal-800 bg-teal-800/10 text-teal-900'
                      : 'border-black/10 text-black/50 hover:border-teal-800/40',
                  )}
                >
                  <Users size={15} /> فرد دیگر
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold text-black/55">
                    نام و نام خانوادگی بیمار
                  </span>
                  <input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="مثلاً علی رضایی"
                    className="mt-2 w-full rounded-xl border border-black/15 bg-white/40 px-4 py-3 text-sm font-semibold text-teal-950 placeholder:text-black/30 backdrop-blur-md outline-none focus-visible:border-teal-800"
                  />
                </label>
                {patientType === 'SOMEONE_ELSE' && (
                  <label className="block">
                    <span className="text-xs font-bold text-black/55">
                      نسبت با بیمار
                    </span>
                    <input
                      value={patientRelation}
                      onChange={(e) => setPatientRelation(e.target.value)}
                      placeholder="مثلاً فرزند، همسر، پدر..."
                      className="mt-2 w-full rounded-xl border border-black/15 bg-white/40 px-4 py-3 text-sm font-semibold text-teal-950 placeholder:text-black/30 backdrop-blur-md outline-none focus-visible:border-teal-800"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="text-xs font-bold text-black/55">
                    شماره موبایل (اختیاری)
                  </span>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    dir="ltr"
                    className="mt-2 w-full rounded-xl border border-black/15 bg-white/40 px-4 py-3 text-sm font-semibold text-teal-950 placeholder:text-black/30 backdrop-blur-md outline-none focus-visible:border-teal-800"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-bold text-black/55">
                    دلیل مراجعه (اختیاری)
                  </span>
                  <textarea
                    value={reasonForVisit}
                    onChange={(e) => setReasonForVisit(e.target.value)}
                    rows={3}
                    placeholder="به‌طور خلاصه توضیح دهید دربارهٔ چه چیزی می‌خواهید گفت‌وگو کنید"
                    className="mt-2 w-full resize-none rounded-xl border border-black/15 bg-white/40 px-4 py-3 text-sm font-semibold text-teal-950 placeholder:text-black/30 backdrop-blur-md outline-none focus-visible:border-teal-800"
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
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-800/15 text-teal-800">
                <CalendarCheck size={26} />
              </span>
              <h2 className="v1-title-gradient mt-6 text-2xl font-black">
                بررسی و تأیید نوبت
              </h2>
              <p className="mt-1 max-w-sm text-sm font-medium text-black/60">
                هنوز چیزی قطعی نشده است؛ با تأیید، این نوبت به‌صورت موقت رزرو
                شده و به درگاه پرداخت هدایت می‌شوید.
              </p>

              <div className="mt-8 w-full max-w-sm space-y-3 rounded-2xl border border-black/10 bg-white/30 p-6 text-left text-sm font-bold backdrop-blur-md">
                <div className="flex justify-between">
                  <span className="text-black/50">پزشک</span>
                  <span className="text-teal-900">دکتر {doctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">زمان</span>
                  <span className="text-teal-900">
                    {date && slot
                      ? `${jalaliDayLabel(date)}، ساعت ${slot.label}`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">بیمار</span>
                  <span className="text-teal-900">{patientName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">هزینهٔ ویزیت</span>
                  <span className="v1-title-gradient">
                    {new Intl.NumberFormat('fa-IR').format(
                      doctor?.consultFee ?? 0,
                    )}{' '}
                    تومان
                  </span>
                </div>
              </div>

              {formError && (
                <p className="mt-4 max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
                  {formError}
                </p>
              )}

              <button
                onClick={confirm}
                disabled={submitting}
                className="mt-8 flex w-fit items-center justify-center gap-2 rounded-xl bg-teal-800 px-8 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> در حال ثبت
                    نوبت...
                  </>
                ) : (
                  'تأیید و ادامه به پرداخت'
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step < 3 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-1 rounded-xl border border-black/15 px-5 py-2.5 text-sm font-bold text-black/60 transition-colors hover:border-teal-800/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={15} /> بازگشت
          </button>
          <button
            onClick={next}
            disabled={!canProceed}
            className="flex items-center gap-1 rounded-xl bg-teal-800 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ادامه <ChevronRight size={15} />
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="mt-6">
          <button
            onClick={back}
            className="flex items-center gap-1 rounded-xl border border-black/15 px-5 py-2.5 text-sm font-bold text-black/60 transition-colors hover:border-teal-800/40"
          >
            <ChevronLeft size={15} /> بازگشت
          </button>
        </div>
      )}
    </div>
  )
}
