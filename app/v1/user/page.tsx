import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import prisma from '@/lib/prisma'
import { currentUser } from '@/lib/auth'
import { getAppTimeZone, toClinicHHMM, toClinicDateISO } from '@/lib/scheduling/tz'
import { PageHeader } from '../components/layout/page-header'
import { ProfileCard } from './components/profile-card'
import { PatientAppointments } from './components/patient-appointments'
import { PatientTimeline } from './components/patient-timeline'

export const metadata: Metadata = {
  title: 'حساب کاربری من | کلینیک ۴۰۴',
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

// Machine status -> Persian label shown to the patient.
const STATUS_LABEL: Record<string, string> = {
  PAYMENT_PENDING: 'در انتظار پرداخت',
  BOOKING_CONFIRMED: 'تأیید شده',
  COMPLETED: 'انجام شده',
  CANCELLED: 'لغو شده',
  NO_SHOW: 'عدم حضور',
  CASH: 'نقدی',
}

// Statuses the patient is allowed to cancel from their own page.
const CANCELLABLE = new Set(['PAYMENT_PENDING', 'BOOKING_CONFIRMED', 'CASH'])

export default async function UserAccountPage() {
  const sessionUser = await currentUser()
  if (!sessionUser?.id) redirect('/signin?callbackUrl=/user')

  const tz = getAppTimeZone()

  const profile = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      bio: true,
      gender: true,
      address: true,
      image: true,
      dateOfBirth: true,
      createdAt: true,
    },
  })
  if (!profile) redirect('/signin?callbackUrl=/user')

  const [appointments, timeline] = await Promise.all([
    prisma.appointment.findMany({
      where: { userId: profile.id },
      include: {
        doctor: { select: { name: true } },
        Order: { select: { paymentStatus: true } },
      },
      orderBy: { appointmentStartUTC: 'desc' },
    }),
    prisma.timeLine.findMany({
      where: { userId: profile.id },
      include: { images: { select: { url: true } } },
      orderBy: { created_at: 'desc' },
    }),
  ])

  const now = new Date()

  const appointmentDTOs = appointments.map((a) => {
    const dateISO = toClinicDateISO(a.appointmentStartUTC, tz)
    const weekday = JALALI_WEEKDAY[new Date(`${dateISO}T00:00:00Z`).getUTCDay()]
    const dateLabel = format(
      new Date(`${dateISO}T00:00:00Z`),
      'd MMMM yyyy',
      { locale: faIR },
    )
    const paid = a.Order.some((o) => o.paymentStatus === 'Paid')
    const cancellable =
      CANCELLABLE.has(a.status) && a.appointmentStartUTC > now
    return {
      appointmentId: a.appointmentId,
      doctorName: a.doctor.name,
      weekday,
      dateLabel,
      timeLabel: toClinicHHMM(a.appointmentStartUTC, tz),
      patientName: a.patientName,
      status: a.status,
      statusLabel: STATUS_LABEL[a.status] ?? a.status,
      paid,
      cancellable,
    }
  })

  const upcoming = appointmentDTOs.filter(
    (a) => a.cancellable || a.status === 'PAYMENT_PENDING',
  )
  const history = appointmentDTOs.filter((a) => !upcoming.includes(a))

  return (
    <>
      <PageHeader
        eyebrow="پروفایل بیمار"
        title={
          <>
            صفحهٔ شخصی <span className="italic text-sage-mist">{profile.name}</span>
          </>
        }
        description="نوبت‌های خود را مشاهده کنید، به‌موقع لغو کنید و روند درمانی‌تان را در تایم‌لاین پیگیری کنید."
      />

      <div className="mx-auto max-w-5xl px-6 pb-28">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[22rem_1fr]">
          <ProfileCard profile={profile} />
          <PatientAppointments upcoming={upcoming} history={history} />
        </div>

        <div className="mt-10">
          <PatientTimeline entries={timeline} />
        </div>
      </div>
    </>
  )
}
