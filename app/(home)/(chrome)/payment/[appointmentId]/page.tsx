import type { Metadata } from 'next'
import { ViewTransition } from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { Clock3, Lock, ShieldCheck } from 'lucide-react'
import prisma from '@/lib/prisma'
import {
  getAppTimeZone,
  toClinicHHMM,
  toClinicDateISO,
} from '@/lib/scheduling/tz'
import { formatter } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth-helpers'
import { reconcilePendingZarinpalPayment } from '@/lib/actions/payment'
import { FlowShell } from '@/components/Home/booking/flow-shell'
import { PayButton } from '@/components/Home/booking/pay-button'
import { TomanIcon } from '@/components/ui/toman-icon'

export const metadata: Metadata = {
  title: 'پرداخت نوبت | کلینیک دکتر نگین فضلی',
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

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>
}) {
  const { appointmentId } = await params
  if (!UUID_RE.test(appointmentId)) notFound()
  const [user, appointment] = await Promise.all([
    getCurrentUser(),
    prisma.appointment.findUnique({
      where: { appointmentId },
      include: { doctor: { include: { doctorProfile: true } } },
    }),
  ])

  if (!appointment) notFound()

  // Heal abandoned payments: if a Pending order already holds an authority
  // (user paid but never returned from the callback), verify and mark it Paid.
  if (appointment.status === 'PAYMENT_PENDING') {
    const { reconciled } = await reconcilePendingZarinpalPayment(appointmentId)
    if (reconciled) {
      redirect(`/appointments/${appointmentId}?status=success`)
    }
  }

  const tz = getAppTimeZone()
  const dateISO = toClinicDateISO(appointment.appointmentStartUTC, tz)
  const weekday = JALALI_WEEKDAY[new Date(`${dateISO}T00:00:00Z`).getUTCDay()]
  const dateLabel = format(new Date(`${dateISO}T00:00:00Z`), 'd MMMM yyyy', {
    locale: faIR,
  })
  const timeLabel = toClinicHHMM(appointment.appointmentStartUTC, tz)
  const fee = appointment.doctor.doctorProfile?.consultFee ?? 0

  return (
    <ViewTransition
      name="page"
      share="page-wipe"
      enter="page-wipe"
      exit="page-wipe"
      default="none"
    >
      <FlowShell
        eyebrow="گام آخر"
        title="پرداخت امن نوبت"
        description="نوبت شما به‌طور موقت رزرو شده است. برای قطعی شدن آن، لطفاً از طریق درگاه امن زرین‌پال پرداخت را تکمیل کنید."
      >
        <div className="mx-auto max-w-xl">
          <div className="rounded-[2rem] border border-white/60 bg-white/90 p-7 text-neutral-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-9">
            <div className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="text-neutral-500">پزشک</span>
                <span className="text-left font-medium">
                  {appointment.doctor.name}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-neutral-500">تاریخ نوبت</span>
                <span className="text-left font-medium">
                  {weekday} {dateLabel}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-neutral-500">ساعت</span>
                <span className="text-left font-mono font-medium">
                  {timeLabel}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-neutral-500">بیمار</span>
                <span className="text-left font-medium">
                  {appointment.patientName}
                </span>
              </div>
              <div className="h-px bg-neutral-200" />
              <div className="flex items-start justify-between gap-4">
                <span className="text-neutral-500">مبلغ قابل پرداخت</span>
                <span className="flex items-center gap-1.5 text-left text-2xl font-bold text-neutral-900">
                  {formatter.format(fee)}
                  <TomanIcon className="size-4 text-[#e96f18]" />
                </span>
              </div>
            </div>

            {appointment.status !== 'PAYMENT_PENDING' ? (
              <div className="mt-6 rounded-2xl border border-[#30e8bf]/40 bg-[#30e8bf]/10 p-4 text-center text-sm">
                {appointment.status === 'BOOKING_CONFIRMED'
                  ? 'این نوبت قبلاً پرداخت و تأیید شده است.'
                  : 'وضعیت این نوبت اجازهٔ پرداخت را نمی‌دهد.'}
              </div>
            ) : user?.id ? (
              <div className="mt-6">
                <PayButton appointmentId={appointmentId} />
                <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-500">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  پرداخت از طریق درگاه امن زرین‌پال انجام می‌شود.
                </p>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-500">
                  <Clock3 size={14} className="text-[#e96f18]" />
                  نوبت به‌مدت محدود رزرو می‌ماند؛ پس از اتمام، آزاد می‌شود.
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-neutral-200 p-5 text-center">
                <p className="text-sm text-neutral-500">
                  برای پرداخت باید وارد حساب کاربری خود شوید.
                </p>
                <Link
                  href={`/signin?callbackUrl=/payment/${appointmentId}`}
                  className="mt-4 inline-flex rounded-full bg-gradient-to-r from-[#30e8bf] via-[#e96f18] to-[#30e8bf] bg-[length:200%_auto] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-[position:right_center]"
                >
                  <Lock size={14} className="me-1.5" />
                  ورود با شماره موبایل
                </Link>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-neutral-500">
            نیاز به راهنمایی دارید؟ با تیم پشتیبانی کلینیک تماس بگیرید.
          </p>
        </div>
      </FlowShell>
    </ViewTransition>
  )
}
