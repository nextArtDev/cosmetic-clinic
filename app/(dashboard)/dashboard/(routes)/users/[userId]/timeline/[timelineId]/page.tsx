import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

import { Heading } from '@/components/dashboard/Heading'
import { Separator } from '@/components/ui/separator'
import { History } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import TimelineForm, {
  TimelineEntry,
} from '../components/timeline-form'

const EditTimelinePage = async ({
  params,
}: {
  params: Promise<{ userId: string; timelineId: string }>
}) => {
  const { userId, timelineId } = await params

  const entry = await prisma.timeLine.findUnique({
    where: { id: timelineId },
    select: { id: true, userId: true, date: true, description: true, isEspecial: true },
  })

  if (!entry || entry.userId !== userId) notFound()

  const initial: TimelineEntry = {
    id: entry.id,
    date: entry.date,
    description: entry.description,
    isEspecial: entry.isEspecial,
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="ویرایش تایم‌لاین"
            description="جزئیات این رکورد درمانی را اصلاح کنید."
          />
          <Link
            href={`/dashboard/users/${userId}/timeline`}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <History className="ml-2 size-4" /> بازگشت به تایم‌لاین
          </Link>
        </div>
        <Separator />
        <TimelineForm userId={userId} initial={initial} />
      </div>
    </div>
  )
}

export default EditTimelinePage