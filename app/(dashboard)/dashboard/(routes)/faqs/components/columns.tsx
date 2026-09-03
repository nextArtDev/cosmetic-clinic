'use client'

import { ColumnDef } from '@tanstack/react-table'

import { CellAction } from './CellAction'

export type FaqColumn = {
  id: string
  question: string | null
}

export const columns: ColumnDef<FaqColumn>[] = [
  {
    accessorKey: 'question',
    header: 'سوال',
  },

  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
