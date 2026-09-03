'use client'

import { Plus } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { DataTable } from '@/components/dashboard/DataTable'
import { Heading } from '@/components/dashboard/Heading'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { columns, UserColumn } from './columns'

interface UsersClientProps {
  data: UserColumn[]
}

export const UsersClient: React.FC<UsersClientProps> = ({ data }) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`بیماران (${data.length})`}
          description="بیماران و سوابق درمانی آن‌ها را مدیریت کنید."
        />
        <Link href={`/dashboard/users/new`} className={cn(buttonVariants())}>
          <Plus className="ml-2 h-4 w-4" /> اضافه کردن
        </Link>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Separator />
    </>
  )
}