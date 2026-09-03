'use client'

import { ColumnDef } from '@tanstack/react-table'

import { CellAction } from './CellAction'

export type SpecializationColumn = {
  id: string
  name: string | null
  // description: string | null
}

export const columns: ColumnDef<SpecializationColumn>[] = [
  {
    accessorKey: 'name',
    header: 'نام',
  },
  // {
  //   accessorKey: 'description',
  //   header: 'توضیحات',
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
  {
    accessorKey: 'createdAt',
    header: 'تاریخ',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
