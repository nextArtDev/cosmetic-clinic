'use client'

import { History, Edit, MoreHorizontal, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { AlertModal } from '@/components/dashboard/AlertModal'

import { useActionState } from 'react'
import { deleteUser } from '../../../lib/actions/users'
import { USER_ACTION_IDLE } from '@/lib/types'
import { UserColumn } from './columns'

interface CellActionProps {
  data: UserColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const [deleteState, deleteAction] = useActionState(
    deleteUser.bind(null, data.id),
    USER_ACTION_IDLE,
  )
  void deleteState

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={deleteAction}
      />
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">بازکردن منو</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>عملیات</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/users/${data.id}`)}
          >
            <Edit className="ml-2 h-4 w-4" /> ویرایش
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/users/${data.id}/timeline`)}
          >
            <History className="ml-2 h-4 w-4" /> تایم‌لاین
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="ml-2 h-4 w-4" /> غیرفعال کردن
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}