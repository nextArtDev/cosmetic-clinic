'use client'

import { ColumnDef } from '@tanstack/react-table'

import { CellAction } from './CellAction'

export type UserColumn = {
  id: string
  name: string
  email: string
  phone: string
  isActive: boolean
}

export const columns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: 'name',
    header: 'نام',
  },
  {
    accessorKey: 'email',
    header: 'ایمیل',
  },
  {
    accessorKey: 'phone',
    header: 'شماره موبایل',
  },
  {
    accessorKey: 'isActive',
    header: 'وضعیت',
    cell: ({ row }) => (
      <span className={row.original.isActive ? 'text-emerald-600' : 'text-rose-600'}>
        {row.original.isActive ? 'فعال' : 'غیرفعال'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]