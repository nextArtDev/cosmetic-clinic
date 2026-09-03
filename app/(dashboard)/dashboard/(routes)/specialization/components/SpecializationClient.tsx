'use client'

import { Plus } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { DataTable } from '@/components/dashboard/DataTable'
import { Heading } from '@/components/dashboard/Heading'

import Link from 'next/link'
import { SpecializationColumn, columns } from './columns'
import { cn } from '@/lib/utils'
// import { ApiList } from '@/components/dashboard/ApiList'

interface SpecializationClientProps {
  data: SpecializationColumn[]
}

export const SpecializationClient: React.FC<SpecializationClientProps> = ({
  data,
}) => {
  return (
    <>
      <div className="flex items-center gap-1 flex-wrap justify-between">
        <Heading
          title={`تخصص (${data.length})`}
          description="اطلاعات تخصصها را مدیریت کنید."
        />
        <Link
          href={`/dashboard/specialization/new`}
          className={cn(buttonVariants({ size: 'sm' }))}
        >
          <Plus className="ml-2 h-4 w-4" /> اضافه کردن
        </Link>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Separator />
      {/* <ApiList entityName="specializations" entityIdName="specializationId" /> */}
    </>
  )
}
