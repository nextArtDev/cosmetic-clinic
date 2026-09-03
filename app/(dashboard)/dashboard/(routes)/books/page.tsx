import { format as formatJalali } from 'date-fns-jalali'
import prisma from '@/lib/prisma'
import { DataTable } from './components/data-table'
import { columns } from './components/columns'

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 20 // 20 is a better default for dashboards than 50

  const skip = (page - 1) * pageSize

  // Fetch appointments ordered by start time (newest first)
  const [appointments, totalCount] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        // Optional: Uncomment the next line if you ONLY want to see future/today appointments
        appointmentStartUTC: { gte: new Date() },
      },
      include: {
        doctor: { select: { name: true } },
        user: { select: { name: true, phoneNumber: true } },
        Order: { select: { paymentStatus: true }, take: 1 }, // Get latest order status
      },
      orderBy: {
        appointmentStartUTC: 'desc',
      },
      skip,
      take: pageSize,
    }),
    prisma.appointment.count(),
  ])

  const formattedData = appointments.map((apt) => ({
    id: apt.appointmentId,
    date: formatJalali(apt.appointmentStartUTC, 'yyyy/MM/dd'),
    time: formatJalali(apt.appointmentStartUTC, 'HH:mm'),
    doctorName: apt.doctor?.name || 'نامشخص',
    patientName: apt.patientName || apt.user?.name || 'مهمان',
    patientPhone: apt.phoneNumber || apt.user?.phoneNumber || '-',
    status: apt.status,
    paymentStatus: apt.Order?.[0]?.paymentStatus || 'Pending',
    createdAt: formatJalali(apt.createdAt, 'yyyy/MM/dd'),
  }))

  const isNext = totalCount > skip + appointments.length

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">مدیریت نوبت‌ها</h1>
        <p className="text-muted-foreground">
          مشاهده، جستجو و مدیریت تمام نوبت‌های رزرو شده در کلینیک.
        </p>
        <div className="h-px bg-border mt-2" />
      </div>

      <DataTable
        columns={columns}
        data={formattedData}
        pageNumber={page}
        isNext={isNext}
        pageSize={pageSize}
        totalCount={totalCount}
      />
    </main>
  )
}
