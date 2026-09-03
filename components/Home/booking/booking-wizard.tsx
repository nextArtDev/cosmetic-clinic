'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Banknote,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
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
import { MobileNumberInput } from '@/components/ui/mobile-number-input'
import { TomanIcon } from '@/components/ui/toman-icon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import {
  fetchAvailableSlots,
  type SlotDTO,
} from '@/lib/actions/home/booking/get-slots'
import { fetchAvailableDates } from '@/lib/actions/home/booking/get-available-dates'
import {
  createBooking,
  type CreateBookingInput,
} from '@/lib/actions/dashboard/booking/create-booking'
import { cn, formatter } from '@/lib/utils'

const APP_TZ = 'Asia/Tehran'

export interface WizardDoctor {
  userId: string
  name: string
  title: string
  consultFee: number
}

interface BookingWizardProps {
  doctors: WizardDoctor[]
  initialDoctorId?: string
  closedDates: string[]
  holidays: Record<string, string>
  maxAdvanceBookingDays: number
  loggedIn: boolean
}

type PatientType = 'MYSELF' | 'SOMEONE_ELSE'
type PaymentMethod = NonNullable<CreateBookingInput['paymentMethod']>

const STEPS = ['پزشک', 'زمان', 'مشخصات', 'تأیید'] as const

const GRADIENT_PILL =
  'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#30e8bf] via-[#e96f18] to-[#30e8bf] bg-[length:200%_auto] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-black/25 transition-all duration-300 hover:bg-[position:right_center] hover:scale-[1.03] active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:hover:scale-100'

function toDateISO(date: Date): string {
  return formatInTimeZone(date, APP_TZ, 'yyyy-MM-dd')
}

function jalaliDayLabel(date: Date): string {
  return format(date, 'EEEE d MMMM', { locale: faIR })
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return toDateISO(a) === toDateISO(b)
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
}

const stepMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
}

export function BookingWizard({
  doctors,
  initialDoctorId,
  closedDates,
  holidays,
  maxAdvanceBookingDays,
  loggedIn,
}: BookingWizardProps) {
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE')
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

  const disabledDates = useMemo(() => {
    const closed = new Set(closedDates)
    const today = new Date()
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + maxAdvanceBookingDays)

    return (d: Date) => {
      const iso = toDateISO(d)

      if (isSameCalendarDay(d, today)) {
        // Today is allowed — the slot engine handles lead-time
      } else if (d < today) {
        return true
      }

      if (d > maxDate) return true
      if (closed.has(iso)) return true
      if (availableDates && !availableDates.has(iso)) return true

      return false
    }
  }, [closedDates, maxAdvanceBookingDays, availableDates])

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
        phoneNumber: phoneNumber || undefined,
        reasonForVisit,
        paymentMethod,
      },
      '/booking',
      'home',
    )
    setSubmitting(false)
    if (result.errors?._form?.[0]) {
      setFormError(result.errors._form[0])
      toast.error(result.errors._form[0])
    }
  }

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/60 bg-white/90 p-10 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#30e8bf] to-[#e96f18] text-white">
          <User size={24} />
        </span>
        <h2 className="mt-6 text-2xl font-bold text-neutral-900">
          برای رزرو نوبت وارد شوید
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          رزرو نوبت نیاز به حساب کاربری دارد. با شمارهٔ موبایل خود وارد شوید؛
          بدون رمز عبور و فقط با کد تأیید پیامکی.
        </p>
        <Link
          href="/signin?callbackUrl=/booking"
          className={cn(GRADIENT_PILL, 'mt-8')}
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
                  'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                  i < step
                    ? 'bg-gradient-to-br from-[#30e8bf] to-[#e96f18] text-white shadow-md shadow-black/30'
                    : i === step
                      ? 'bg-gradient-to-br from-[#30e8bf] to-[#e96f18] text-white shadow-lg shadow-black/30 ring-4 ring-white/10'
                      : 'border border-white/15 bg-white/5 text-neutral-400',
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-xs sm:block',
                  i <= step ? 'text-white' : 'text-neutral-500',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-3 h-px flex-1 transition-colors duration-500',
                  i < step
                    ? 'bg-gradient-to-l from-[#30e8bf] to-[#e96f18]'
                    : 'bg-white/10',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 text-neutral-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="doctor" {...stepMotion}>
              <h2 className="text-2xl font-bold">پزشک را انتخاب کنید</h2>
              <p className="mt-1 text-sm text-neutral-500">
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
                      setSlots([])
                      setAvailableDates(null)
                      setAvailableDatesLoading(true)
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border p-4 text-right transition-all duration-300',
                      doctorId === d.userId
                        ? 'border-transparent bg-[#30e8bf]/10 ring-2 ring-[#30e8bf]'
                        : 'border-neutral-200 hover:border-[#30e8bf]/60 hover:bg-neutral-50',
                    )}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#30e8bf] to-[#e96f18] text-sm font-bold text-white">
                      {initials(d.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {d.name}
                      </span>
                      <span className="block truncate text-xs text-neutral-500">
                        {d.title}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="time" {...stepMotion}>
              <h2 className="text-2xl font-bold">تاریخ و ساعت نوبت</h2>
              <p className="mt-1 text-sm text-neutral-500">
                روز موردنظر را در تقویم انتخاب کنید و سپس ساعت را از نوبت‌های
                خالی {doctor?.name} برگزینید.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex justify-center rounded-2xl border border-neutral-200 bg-white p-4">
                  {availableDatesLoading ? (
                    <div className="flex h-[300px] w-full items-center justify-center">
                      <Loader2
                        size={20}
                        className="animate-spin text-neutral-400"
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
                      className="rounded-xl bg-white text-neutral-800 [&_.rdp-day_button[data-holiday=true]]:border-orange-400/50 [&_.rdp-day_button[data-holiday=true]]:text-orange-600 [&_.rdp-day_button[data-holiday=true]]:hover:bg-orange-50 [&_[data-unavailable=true]>span]:text-neutral-400 [&_button]:focus-visible:ring-[#30e8bf]/40"
                    />
                  )}
                </div>

                <div>
                  {!date ? (
                    <p className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
                      ابتدا یک روز را انتخاب کنید.
                    </p>
                  ) : slotsLoading ? (
                    <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
                      <Loader2 size={16} className="animate-spin" />
                      در حال دریافت نوبت‌های خالی...
                    </p>
                  ) : slots.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
                      در این روز نوبت خالی وجود ندارد. روز دیگری را انتخاب کنید.
                    </p>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto pl-1">
                      <p className="mb-3 text-xs text-neutral-500">
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
                                ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                                : s.reservedByMe
                                  ? 'border-emerald-500/50 bg-emerald-50 text-emerald-700 hover:border-emerald-500'
                                  : 'border-neutral-200 hover:border-[#30e8bf]',
                            )}
                          >
                            {s.label}
                            {s.reservedByMe && (
                              <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                                <Lock size={8} />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      {slots.some((s) => s.reservedByMe) && (
                        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600">
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
              <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full border border-orange-400/60 bg-orange-100" />
                  تعطیل رسمی
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                  بدون نوبت
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full border border-emerald-500/50 bg-emerald-100" />
                  رزرو شده توسط شما
                </span>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="details" {...stepMotion}>
              <h2 className="text-2xl font-bold">مشخصات بیمار</h2>
              <p className="mt-1 text-sm text-neutral-500">
                این نوبت برای چه کسی است؟
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setPatientType('MYSELF')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-2xl border p-4 text-sm transition-all duration-300',
                    patientType === 'MYSELF'
                      ? 'border-transparent bg-[#30e8bf]/10 ring-2 ring-[#30e8bf]'
                      : 'border-neutral-200 text-neutral-500 hover:border-[#30e8bf]/60',
                  )}
                >
                  <User size={15} /> خودم
                </button>
                <button
                  onClick={() => setPatientType('SOMEONE_ELSE')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-2xl border p-4 text-sm transition-all duration-300',
                    patientType === 'SOMEONE_ELSE'
                      ? 'border-transparent bg-[#30e8bf]/10 ring-2 ring-[#30e8bf]'
                      : 'border-neutral-200 text-neutral-500 hover:border-[#30e8bf]/60',
                  )}
                >
                  <Users size={15} /> فرد دیگر
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs text-neutral-500">
                    نام و نام خانوادگی بیمار
                  </span>
                  <input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="مثلاً علی رضایی"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus-visible:border-[#30e8bf]"
                  />
                </label>
                {patientType === 'SOMEONE_ELSE' && (
                  <label className="block">
                    <span className="text-xs text-neutral-500">
                      نسبت با بیمار
                    </span>
                    <input
                      value={patientRelation}
                      onChange={(e) => setPatientRelation(e.target.value)}
                      placeholder="مثلاً فرزند، همسر، پدر..."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus-visible:border-[#30e8bf]"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="mb-2 block text-xs text-neutral-500">
                    شماره موبایل (اختیاری)
                  </span>
                  <MobileNumberInput
                    value={phoneNumber}
                    onValueChange={setPhoneNumber}
                    placeholder="0912 345 6789"
                    className="h-12 rounded-xl border border-neutral-200 shadow-none"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs text-neutral-500">
                    دلیل مراجعه (اختیاری)
                  </span>
                  <textarea
                    value={reasonForVisit}
                    onChange={(e) => setReasonForVisit(e.target.value)}
                    rows={3}
                    placeholder="به‌طور خلاصه توضیح دهید دربارهٔ چه چیزی می‌خواهید گفت‌وگو کنید"
                    className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus-visible:border-[#30e8bf]"
                  />
                </label>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="confirm"
              {...stepMotion}
              className="flex flex-col items-center text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#30e8bf] to-[#e96f18] text-white shadow-lg shadow-black/20">
                <CalendarCheck size={26} />
              </span>
              <h2 className="mt-6 text-2xl font-bold">بررسی و تأیید نوبت</h2>
              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                هنوز چیزی قطعی نشده است؛ با تأیید، این نوبت به‌صورت موقت رزرو
                می‌شود.
              </p>

              <div className="mt-8 w-full max-w-sm space-y-3 rounded-2xl border border-neutral-200 p-6 text-right text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">پزشک</span>
                  <span className="font-medium">{doctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">زمان</span>
                  <span className="font-medium">
                    {date && slot
                      ? `${jalaliDayLabel(date)}، ساعت ${slot.label}`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">بیمار</span>
                  <span className="font-medium">{patientName || '—'}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-3">
                  <span className="text-neutral-500">هزینهٔ ویزیت</span>
                  <span className="flex items-center gap-1.5 font-bold text-neutral-900">
                    {doctor ? formatter.format(doctor.consultFee) : '—'}
                    <TomanIcon className="size-3.5 text-[#e96f18]" />
                  </span>
                </div>
              </div>

              {/* Payment method */}
              <div className="mt-6 w-full max-w-sm">
                <Tabs
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  variant="rounded"
                  className="items-center"
                >
                  <TabsList className="bg-neutral-100">
                    <TabsTrigger
                      value="ONLINE"
                      className="data-[active]:bg-neutral-900 data-[active]:text-white"
                    >
                      <CreditCard size={14} />
                      پرداخت آنلاین
                    </TabsTrigger>
                    <TabsTrigger
                      value="CASH"
                      className="data-[active]:bg-neutral-900 data-[active]:text-white"
                    >
                      <Banknote size={14} />
                      پرداخت در کلینیک
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="ONLINE" className="w-full">
                    <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                      پس از تأیید، به درگاه امن زرین‌پال هدایت می‌شوید و نوبت
                      شما بلافاصله قطعی می‌شود.
                    </p>
                  </TabsContent>
                  <TabsContent value="CASH" className="w-full">
                    <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                      نوبت شما ثبت می‌شود و مبلغ ویزیت را حضوری در کلینیک تسویه
                      می‌کنید.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              {formError && (
                <p className="mt-4 max-w-sm rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {formError}
                </p>
              )}

              <button
                onClick={confirm}
                disabled={submitting}
                className={cn(GRADIENT_PILL, 'mt-8')}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> در حال ثبت
                    نوبت...
                  </>
                ) : paymentMethod === 'ONLINE' ? (
                  'تأیید و پرداخت آنلاین'
                ) : (
                  'ثبت نوبت با پرداخت حضوری'
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      {step < 3 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-1 rounded-full border border-white/25 px-5 py-2.5 text-sm text-white transition-colors hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight size={15} /> بازگشت
          </button>
          <button
            onClick={next}
            disabled={!canProceed}
            className={GRADIENT_PILL}
          >
            ادامه <ChevronLeft size={15} />
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="mt-6">
          <button
            onClick={back}
            className="inline-flex items-center gap-1 rounded-full border border-white/25 px-5 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
          >
            <ChevronRight size={15} /> بازگشت
          </button>
        </div>
      )}
    </div>
  )
}
