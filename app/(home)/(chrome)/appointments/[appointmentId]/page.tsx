import type { Metadata } from 'next'
import { ViewTransition } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import {
  Banknote,
  CheckCircle2,
  Clock3,
  ReceiptText,
  XCircle,
} from 'lucide-react'
import prisma from '@/lib/prisma'
import {
  getAppTimeZone,
  toClinicHHMM,
  toClinicDateISO,
} from '@/lib/scheduling/tz'
import { formatter } from '@/lib/utils'
import { FlowShell } from '@/components/Home/booking/flow-shell'
import { TomanIcon } from '@/components/ui/toman-icon'

export const metadata: Metadata = {
  title: 'نتیجهٔ نوبت | کلینیک دکتر نگین فضلی',
}

const JALALI_WEEKDAY = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
]

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const GRADIENT_PILL =
  'inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#30e8bf] via-[#e96f18] to-[#30e8bf] bg-[length:200%_auto] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/25 transition-all duration-300 hover:bg-[position:right_center] hover:scale-[1.03] active:scale-95'

export default async function AppointmentResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ appointmentId: string }>
  searchParams: Promise<{ status?: string; error?: string }>
}) {
  const { appointmentId } = await params
  const { status, error } = await searchParams
  if (!UUID_RE.test(appointmentId)) notFound()

  const appointment = await prisma.appointment.findUnique({
    where: { appointmentId },
    include: {
      doctor: { include: { doctorProfile: true } },
      Order: { include: { paymentDetails: true } },
    },
  })
  if (!appointment) notFound()

  const tz = getAppTimeZone()
  const dateISO = toClinicDateISO(appointment.appointmentStartUTC, tz)
  const weekday = JALALI_WEEKDAY[new Date(`${dateISO}T00:00:00Z`).getUTCDay()]
  const dateLabel = format(new Date(`${dateISO}T00:00:00Z`), 'd MMMM yyyy', {
    locale: faIR,
  })
  const timeLabel = toClinicHHMM(appointment.appointmentStartUTC, tz)

  const isSuccess =
    status === 'success' ||
    status === 'already_paid' ||
    appointment.status === 'BOOKING_CONFIRMED'
  const isAlreadyPaid = status === 'already_paid'
  const isCash = status === 'cash' || appointment.status === 'CASH'
  const fee = appointment.doctor.doctorProfile?.consultFee ?? 0
  const order = appointment.Order[0]
  const refId = order?.paymentDetails?.transactionId

  return (
    <ViewTransition
      name="page"
      share="page-wipe"
      enter="page-wipe"
      exit="page-wipe"
      default="none"
    >
      <FlowShell className="justify-center">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[2rem] border border-white/60 bg-white/90 p-8 text-center text-neutral-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-10">
            {isSuccess ? (
              <>
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#30e8bf] to-emerald-500 text-white shadow-lg shadow-black/20">
                  <CheckCircle2 size={30} />
                </span>
                <h1 className="mt-6 text-3xl font-bold md:text-4xl">
                  {isAlreadyPaid
                    ? 'این نوبت قبلاً پرداخت شده است'
                    : 'پرداخت با موفقیت انجام شد'}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  نوبت شما قطعی شد و پیامک تأیید برای شما ارسال شده است. لطفاً
                  ۱۵ دقیقه قبل از نوبت در کلینیک حضور داشته باشید.
                </p>
              </>
            ) : isCash ? (
              <>
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#30e8bf] to-[#e96f18] text-white shadow-lg shadow-black/20">
                  <Banknote size={30} />
                </span>
                <h1 className="mt-6 text-3xl font-bold md:text-4xl">
                  نوبت شما ثبت شد
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  پرداخت به‌صورت حضوری در کلینیک انجام می‌شود؛ لطفاً ۱۵ دقیقه
                  قبل از نوبت حضور داشته باشید.
                </p>
              </>
            ) : (
              <>
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
                  <XCircle size={30} />
                </span>
                <h1 className="mt-6 text-3xl font-bold md:text-4xl">
                  پرداخت کامل نشد
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  {error
                    ? decodeURIComponent(error)
                    : 'مشکلی در پرداخت به وجود آمد. نوبت شما برای مدت محدودی رزرو می‌ماند؛ می‌توانید دوباره تلاش کنید.'}
                </p>
              </>
            )}

            <div className="mt-8 rounded-2xl border border-neutral-200 p-6 text-right text-sm">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest text-[#e96f18]">
                <ReceiptText size={14} /> جزئیات نوبت
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">پزشک</span>
                  <span className="font-medium">{appointment.doctor.name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">زمان</span>
                  <span className="font-medium">
                    {weekday} {dateLabel}، ساعت {timeLabel}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">بیمار</span>
                  <span className="font-medium">{appointment.patientName}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">وضعیت</span>
                  <span className="font-medium text-emerald-600">
                    {isSuccess || isCash ? 'تأیید شده' : 'در انتظار پرداخت'}
                  </span>
                </div>
                {(isSuccess || isCash) && (
                  <div className="flex justify-between gap-4 border-t border-neutral-100 pt-3">
                    <span className="text-neutral-500">
                      {isSuccess ? 'مبلغ پرداختی' : 'قابل تسویه در کلینیک'}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold">
                      {formatter.format(fee)}
                      <TomanIcon className="size-3.5 text-[#e96f18]" />
                    </span>
                  </div>
                )}
                {isSuccess && refId && (
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">کد رهگیری</span>
                    <span className="font-mono" dir="ltr">
                      {refId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {isSuccess || isCash ? (
                <Link href="/" className={GRADIENT_PILL}>
                  بازگشت به صفحهٔ اصلی
                </Link>
              ) : (
                <Link
                  href={`/payment/${appointment.appointmentId}`}
                  className={GRADIENT_PILL}
                >
                  تلاش مجدد برای پرداخت
                </Link>
              )}
              <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Clock3 size={13} /> در صورت نیاز، نوبت را می‌توانید جابجا کنید.
              </span>
            </div>
          </div>
        </div>
      </FlowShell>
    </ViewTransition>
  )
}
