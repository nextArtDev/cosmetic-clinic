'use client'

import { Plus } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { DataTable } from '@/components/dashboard/DataTable'
import { Heading } from '@/components/dashboard/Heading'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { columns, PersonnelColumn } from './columns'
// import { ApiList } from '@/components/dashboard/ApiList'

interface PersonnelClientProps {
  data: PersonnelColumn[]
}

export const PersonnelClient: React.FC<PersonnelClientProps> = ({ data }) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`پرسنل (${data.length})`}
          description="اطلاعات پرسنل را مدیریت کنید."
        />
        <Link
          href={`/dashboard/personnels/new`}
          className={cn(buttonVariants())}
        >
          <Plus className="ml-2 h-4 w-4" /> اضافه کردن
        </Link>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Separator />
      {/* <ApiList entityName="doctors" entityIdName="doctorId" /> */}
    </>
  )
}
