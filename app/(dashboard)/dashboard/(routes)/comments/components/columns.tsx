'use client'

import { ColumnDef } from '@tanstack/react-table'

import { CellAction } from './CellAction'
// import { useActionState } from 'react'
// import { shouldPublishedComment } from '@/lib/actions/dashboard/comments'
// import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import PublishedButton from './PublishedButton'

export type CommentColumn = {
  id: string
  name: string | null
  shouldBePublished: boolean
  comment: string | null
}

export const Columns: ColumnDef<CommentColumn>[] = [
  {
    accessorKey: 'name',
    header: 'نام',
  },
  {
    accessorKey: 'comment',
    header: 'کامنت',
    cell: ({ row }) => {
      return (
        <article className="max-w-sm:max-w-sm text-sm px-2 line-clamp-3">
          {row.original.comment}
        </article>
      )
    },
  },
  {
    accessorKey: 'shouldBePublished',
    header: 'انتشار',
    cell: ({ row }) => {
      const { id, shouldBePublished } = row.original
      return (
        <PublishedButton
          id={id}
          shouldBePublished={shouldBePublished}
          // pathname={pathname}
        />
      )
    },
  },
  {
    accessorKey: 'createdAt',
    // header: 'تاریخ',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          تاریخ
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
