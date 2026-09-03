import type { Metadata } from 'next'
import { getDoctors } from '../lib/data'
import { fetchBookingWindow } from '@/lib/actions/home/booking/get-slots'
import { getCurrentUser } from '@/lib/auth-helpers'
import { PageHeader } from '../components/layout/page-header'
import { BookingForm } from './booking-form'

export const metadata: Metadata = {
  title: 'رزرو نوبت | کلینیک ۴۰۴',
  description:
    'نوبت خود را از پزشکان متخصص کلینیک ۴۰۴ رزرو کنید؛ انتخاب پزشک، زمان و پرداخت آنلاین در چند دقیقه.',
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ doctor?: string }>
}) {
  const { doctor } = await searchParams
  const [doctors, window, user] = await Promise.all([
    getDoctors(),
    fetchBookingWindow(),
    getCurrentUser(),
  ])
  const initialDoctor =
    typeof doctor === 'string'
      ? doctors.find((d) => d.slug === doctor)
      : undefined

  return (
    <>
      <PageHeader
        eyebrow="رزرو نوبت"
        title="نوبت خود را رزرو کنید."
        description="چهار گام کوتاه — انتخاب پزشک، زمان، مشخصات بیمار و تأیید. پرداخت از طریق درگاه امن انجام می‌شود."
      />
      <section className="px-6 pb-28">
        <BookingForm
          doctors={doctors}
          initialDoctorId={initialDoctor?.userId}
          closedDates={window.closedDates}
          holidays={window.holidays}
          maxAdvanceBookingDays={window.maxAdvanceBookingDays}
          loggedIn={Boolean(user)}
        />
      </section>
    </>
  )
}
