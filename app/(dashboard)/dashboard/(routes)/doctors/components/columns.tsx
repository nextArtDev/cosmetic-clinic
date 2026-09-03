'use client'

import { ColumnDef } from '@tanstack/react-table'

import { CellAction } from './CellAction'

export type DoctorColumn = {
  id: string
  name: string | null
  // phone: string | null
  // price: number
  description: string | null
  // main_image: string | null
  // open_time: string | null
  // close_time: string | null
}

export const columns: ColumnDef<DoctorColumn>[] = [
  {
    accessorKey: 'name',
    header: 'نام',
  },
  // {
  //   accessorKey: 'phone',
  //   header: 'شماره تماس',
  // },
  {
    accessorKey: 'description',
    header: 'تخصص',
  },
  // {
  //   accessorKey: 'website',
  //   header: 'وبسایت',
  // },

  // {
  //   accessorKey: 'main_image',
  //   header: 'عکس اصلی',
  // },
  // {
  //   accessorKey: 'open_time',
  //   header: 'زمان شروع',
  // },
  // {
  //   accessorKey: 'close_time',
  //   header: 'زمان پایان',
  // },
  //   {
  //     accessorKey: 'category',
  //     header: 'دسته‌بندی',
  //   },
  //   {
  //     accessorKey: 'size',
  //     header: 'سایز',
  //   },
  //   {
  //     accessorKey: 'color',
  //     header: 'رنگ',
  //     cell: ({ row }) => (
  //       <div className="flex items-center gap-x-2">
  //         {row.original.color}
  //         <div
  //           className="h-6 w-6 rounded-full border"
  //           style={{ backgroundColor: row.original.color }}
  //         />
  //       </div>
  //     ),
  //   },
  // {
  //   accessorKey: 'createdAt',
  //   header: 'تاریخ',
  // },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
