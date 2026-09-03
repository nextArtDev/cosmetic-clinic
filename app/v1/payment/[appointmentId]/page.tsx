import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { Lock, ShieldCheck, Clock3 } from 'lucide-react'
import prisma from '@/lib/prisma'
import { getAppTimeZone, toClinicHHMM, toClinicDateISO } from '@/lib/scheduling/tz'
import { formatter } from '@/lib/utils'
import { PayButton } from './pay-button'
import { getCurrentUser } from '@/lib/auth-helpers'
import { reconcilePendingZarinpalPayment } from '@/lib/actions/payment'

export const metadata: Metadata = {
  title: 'پرداخت نوبت | کلینیک ۴۰۴',
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

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>
}) {
  const { appointmentId } = await params
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
      redirect(`/v1/appointments/${appointmentId}?status=success`)
    }
  }

  const tz = getAppTimeZone()
  const dateISO = toClinicDateISO(appointment.appointmentStartUTC, tz)
  const weekday = JALALI_WEEKDAY[new Date(`${dateISO}T00:00:00Z`).getUTCDay()]
  const dateLabel = format(
    new Date(`${dateISO}T00:00:00Z`),
    'd MMMM yyyy',
    { locale: faIR },
  )
  const timeLabel = toClinicHHMM(appointment.appointmentStartUTC, tz)
  const fee = appointment.doctor.doctorProfile?.consultFee ?? 0

  return (
    <section className="mx-auto max-w-2xl px-6 pt-40 pb-28 md:pt-48">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/20 text-sage-mist">
          <Lock size={24} />
        </span>
        <h1 className="mt-6 font-display text-4xl text-ivory md:text-5xl">
          پرداخت امن نوبت
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
          نوبت شما به‌طور موقت رزرو شده است. برای قطعی شدن آن، لطفاً از طریق
          درگاه امن زرین‌پال پرداخت را تکمیل کنید.
        </p>
      </div>

      <div className="glass-panel mt-10 p-7 md:p-8">
        <div className="space-y-4 text-sm">
          <div className="flex items-start justify-between gap-4">
            <span className="text-ivory-dim">پزشک</span>
            <span className="text-left text-ivory">
              {appointment.doctor.name}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-ivory-dim">تاریخ نوبت</span>
            <span className="text-left text-ivory">{weekday} {dateLabel}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-ivory-dim">ساعت</span>
            <span className="text-left font-mono text-ivory">{timeLabel}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-ivory-dim">بیمار</span>
            <span className="text-left text-ivory">
              {appointment.patientName}
            </span>
          </div>
          <div className="hairline" />
          <div className="flex items-start justify-between gap-4">
            <span className="text-ivory-dim">مبلغ قابل پرداخت</span>
            <span className="text-left font-display text-2xl text-gold-soft">
              {formatter.format(fee)}{' '}
              <span className="text-xs text-ivory-dim">تومان</span>
            </span>
          </div>
        </div>

        {appointment.status !== 'PAYMENT_PENDING' ? (
          <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-center text-sm text-ivory">
            {appointment.status === 'BOOKING_CONFIRMED'
              ? 'این نوبت قبلاً پرداخت و تأیید شده است.'
              : 'وضعیت این نوبت اجازهٔ پرداخت را نمی‌دهد.'}
          </div>
        ) : user?.id ? (
          <div className="mt-6">
            <PayButton appointmentId={appointmentId} />
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ivory-dim">
              <ShieldCheck size={14} className="text-sage-mist" />
              پرداخت از طریق درگاه امن زرین‌پال انجام می‌شود.
            </p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-ivory-dim">
              <Clock3 size={14} className="text-sage-mist" />
              نوبت به‌مدت محدود رزرو می‌ماند؛ پس از اتمام، آزاد می‌شود.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-glass-border p-5 text-center">
            <p className="text-sm text-ivory-dim">
              برای پرداخت باید وارد حساب کاربری خود شوید.
            </p>
            <Link
              href={`/signin?callbackUrl=/payment/${appointmentId}`}
              className="mt-4 inline-flex rounded-xl bg-gold px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold/90"
            >
              ورود با شماره موبایل
            </Link>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-ivory-dim">
        نیاز به راهنمایی دارید؟ با تیم پشتیبانی کلینیک تماس بگیرید.
      </p>
    </section>
  )
}
