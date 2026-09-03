import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { CheckCircle2, XCircle, Clock3, ReceiptText } from 'lucide-react'
import prisma from '@/lib/prisma'
import { getAppTimeZone, toClinicHHMM, toClinicDateISO } from '@/lib/scheduling/tz'
import { formatter } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'نتیجهٔ نوبت | کلینیک ۴۰۴',
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

export default async function AppointmentResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ appointmentId: string }>
  searchParams: Promise<{ status?: string; error?: string }>
}) {
  const { appointmentId } = await params
  const { status, error } = await searchParams

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
  const dateLabel = format(
    new Date(`${dateISO}T00:00:00Z`),
    'd MMMM yyyy',
    { locale: faIR },
  )
  const timeLabel = toClinicHHMM(appointment.appointmentStartUTC, tz)

  const isSuccess = status === 'success' || appointment.status === 'BOOKING_CONFIRMED'
  const isAlreadyPaid = status === 'already_paid'
  const fee = appointment.doctor.doctorProfile?.consultFee ?? 0
  const order = appointment.Order[0]
  const refId = order?.paymentDetails?.transactionId

  return (
    <section className="mx-auto max-w-2xl px-6 pt-40 pb-28 md:pt-48">
      <div className="glass-panel p-8 text-center md:p-10">
        {isSuccess ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/20 text-sage-mist">
              <CheckCircle2 size={30} />
            </span>
            <h1 className="mt-6 font-display text-3xl text-ivory md:text-4xl">
              {isAlreadyPaid
                ? 'این نوبت قبلاً پرداخت شده است'
                : 'پرداخت با موفقیت انجام شد'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
              نوبت شما قطعی شد و پیامک تأیید برای شما ارسال شده است. لطفاً ۱۵
              دقیقه قبل از نوبت در کلینیک حضور داشته باشید.
            </p>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-400">
              <XCircle size={30} />
            </span>
            <h1 className="mt-6 font-display text-3xl text-ivory md:text-4xl">
              پرداخت کامل نشد
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
              {error
                ? decodeURIComponent(error)
                : 'مشکلی در پرداخت به وجود آمد. نوبت شما برای مدت محدودی رزرو می‌ماند؛ می‌توانید دوباره تلاش کنید.'}
            </p>
          </>
        )}

        <div className="mt-8 rounded-2xl border border-glass-border p-6 text-left text-sm">
          <div className="flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-gold-soft">
            <ReceiptText size={14} /> جزئیات نوبت
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between gap-4">
              <span className="text-ivory-dim">پزشک</span>
              <span className="text-ivory">{appointment.doctor.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-ivory-dim">زمان</span>
              <span className="text-ivory">
                {weekday} {dateLabel}، ساعت {timeLabel}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-ivory-dim">بیمار</span>
              <span className="text-ivory">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-ivory-dim">وضعیت</span>
              <span className="text-sage-mist">
                {isSuccess ? 'تأیید شده' : 'در انتظار پرداخت'}
              </span>
            </div>
            {isSuccess && (
              <>
                <div className="flex justify-between gap-4">
                  <span className="text-ivory-dim">مبلغ پرداختی</span>
                  <span className="text-gold-soft">
                    {formatter.format(fee)} تومان
                  </span>
                </div>
                {refId && (
                  <div className="flex justify-between gap-4">
                    <span className="text-ivory-dim">کد رهگیری</span>
                    <span className="font-mono text-ivory" dir="ltr">
                      {refId}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isSuccess ? (
            <Link
              href="/"
              className="rounded-xl bg-gold px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold/90"
            >
              بازگشت به صفحهٔ اصلی
            </Link>
          ) : (
            <Link
              href={`/payment/${appointment.appointmentId}`}
              className="rounded-xl bg-gold px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold/90"
            >
              تلاش مجدد برای پرداخت
            </Link>
          )}
          <span className="flex items-center gap-1.5 text-xs text-ivory-dim">
            <Clock3 size={13} /> در صورت نیاز، نوبت را می‌توانید جابجا کنید.
          </span>
        </div>
      </div>
    </section>
  )
}
