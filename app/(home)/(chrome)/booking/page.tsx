import type { Metadata } from 'next'
import { ViewTransition } from 'react'
import { getDoctors } from '@/app/v1/lib/data'
import { fetchBookingWindow } from '@/lib/actions/home/booking/get-slots'
import { getCurrentUser } from '@/lib/auth-helpers'
import { BookingWizard } from '@/components/Home/booking/booking-wizard'
import { FlowShell } from '@/components/Home/booking/flow-shell'

export const metadata: Metadata = {
  title: 'رزرو نوبت | کلینیک دکتر شبنم فضلی',
  description:
    'نوبت خود را از پزشکان متخصص کلینیک رزرو کنید؛ انتخاب پزشک، زمان و پرداخت آنلاین در چند دقیقه.',
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
    <ViewTransition
      name="page"
      share="page-wipe"
      enter="page-wipe"
      exit="page-wipe"
      default="none"
    >
      <FlowShell
        eyebrow="رزرو نوبت آنلاین"
        title="نوبت خود را رزرو کنید."
        description="چهار گام کوتاه — انتخاب پزشک، زمان، مشخصات بیمار و تأیید. پرداخت از طریق درگاه امن انجام می‌شود."
      >
        <BookingWizard
          doctors={doctors.map((d) => ({
            userId: d.userId,
            name: d.name,
            title: d.title,
            consultFee: d.consultFee,
          }))}
          initialDoctorId={initialDoctor?.userId}
          closedDates={window.closedDates}
          holidays={window.holidays}
          maxAdvanceBookingDays={window.maxAdvanceBookingDays}
          loggedIn={Boolean(user)}
        />
      </FlowShell>
    </ViewTransition>
  )
}
