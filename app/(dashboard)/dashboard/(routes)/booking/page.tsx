import { notFound } from 'next/navigation'
import { CalendarDays, Ban } from 'lucide-react'

import { currentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

import WeeklyScheduleForm from './components/weekly-schedule-form'
import DisableDayForm from './components/qdisable-day-form'

export default async function BookingManagementPage() {
  // Optional: Add auth check if needed
  // const user = await currentUser()
  // if (!user) return notFound()

  const doctorsProfile = await prisma.doctorProfile.findMany({
    include: {
      doctor: true,
    },
    orderBy: {
      doctor: {
        name: 'asc',
      },
    },
  })

  const doctors = doctorsProfile.map((d) => ({
    id: d.doctor.id,
    name: d.doctor.name,
    defaultSlotDuration: d.slotDurationMinutes,
  }))

  if (doctors.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">پزشکی یافت نشد</h2>
          <p className="text-muted-foreground">
            لطفاً ابتدا پروفایل پزشکان را در سیستم ایجاد کنید.
          </p>
        </div>
      </main>
    )
  }
  const initialBlocks = await prisma.doctorScheduleBlock.findMany({
    where: { doctorId: doctors[0].id },
    select: {
      dayOfWeek: true,
      startTime: true,
      endTime: true,
      slotDurationMinutes: true,
    },
  })
  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8 space-y-2 text-center md:text-right">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          مدیریت نوبت‌دهی
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          برنامه هفتگی پزشکان را تنظیم کنید یا در صورت نیاز، روز یا بازه‌ای خاص
          را غیرفعال نمایید.
        </p>
      </div>

      {/* Tabs Container */}
      <Tabs dir="rtl" defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-muted/50">
          <TabsTrigger
            value="weekly"
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <CalendarDays className="h-4 w-4" />
            <span>برنامه هفتگی</span>
          </TabsTrigger>
          <TabsTrigger
            value="disable"
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Ban className="h-4 w-4" />
            <span>غیرفعال‌سازی روز</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Weekly Schedule */}
        <TabsContent
          value="weekly"
          className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
        >
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="">
              <WeeklyScheduleForm
                doctors={doctors}
                initialBlocks={initialBlocks} // Replace with actual fetch if you have an edit mode
                initialDoctorId={doctors[0].id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Disable Day */}
        <TabsContent
          value="disable"
          className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
        >
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className=" ">
              <DisableDayForm doctors={doctors} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
