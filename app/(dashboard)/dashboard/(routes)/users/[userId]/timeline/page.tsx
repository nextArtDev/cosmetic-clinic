import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

import { Heading } from '@/components/dashboard/Heading'
import { Separator } from '@/components/ui/separator'
import { Timeline } from '@/components/timeline/timeline'

import TimelineForm from './components/timeline-form'
import { TimelineCard } from './components/TimelineCard'

const UserTimelinePage = async ({
  params,
}: {
  params: Promise<{ userId: string }>
}) => {
  const userId = (await params).userId

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  })
  if (!user) notFound()

  const timeLines = await prisma.timeLine.findMany({
    where: { userId },
    // Newest first, matching the public /user visits timeline.
    orderBy: { date: 'desc' },
    select: {
      id: true,
      date: true,
      description: true,
      isEspecial: true,
      images: { select: { url: true } },
    },
  })

  const entries = timeLines.map((t) => ({
    id: t.id,
    date: t.date,
    description: t.description,
    isEspecial: t.isEspecial,
    images: t.images.filter((i) => i.url).map((i) => ({ url: i.url })),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title={`تایم‌لاین ${user.name}`}
          description="سوابق درمانی بیمار را مدیریت کنید."
        />
        <Separator />
        <TimelineForm userId={userId} initial={null} />
        <Separator />

        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            هنوز رکوردی برای این بیمار ثبت نشده است — از فرم بالا اولین
            مرحلهٔ درمان را اضافه کنید.
          </div>
        ) : (
          <Timeline
            variant="light"
            showHeader={false}
            data={entries.map((e) => ({
              id: e.id,
              title: e.date,
              content: <TimelineCard key={e.id} userId={userId} entry={e} />,
            }))}
          />
        )}
      </div>
    </div>
  )
}

export default UserTimelinePage
