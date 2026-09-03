'use client'

import { Plus } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { DataTable } from '@/components/dashboard/DataTable'
import { Heading } from '@/components/dashboard/Heading'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { IllnessColumn, columns } from './columns'
// import { ApiList } from '@/components/dashboard/ApiList'

interface IllnessesClientProps {
  data: IllnessColumn[]
  pageNumber: number
  isNext: boolean
}

export const IllnessesClient: React.FC<IllnessesClientProps> = ({
  data,
  isNext,
  pageNumber,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`بیماریها (${data.length})`}
          description="اطلاعات بیماری‌ها را مدیریت کنید."
        />
        <Link href={`/dashboard/illness/new`} className={cn(buttonVariants())}>
          <Plus className="ml-2 h-4 w-4" /> اضافه کردن
        </Link>
      </div>
      <Separator />
      <DataTable
        searchKey="name"
        columns={columns}
        data={data}
        pageNumber={pageNumber}
        isNext={isNext}
      />

      {/* <ApiList entityName="illnesses" entityIdName="illnessId" /> */}
    </>
  )
}
