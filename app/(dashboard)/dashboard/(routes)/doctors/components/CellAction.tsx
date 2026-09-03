'use client'

// import axios from 'axios'
import { Edit, MoreHorizontal, Trash } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { DoctorColumn } from './columns'
// import { toast } from '@/components/ui/use-toast'

import { AlertModal } from '@/components/dashboard/AlertModal'

import { useActionState } from 'react'
import { deleteDoctor } from '../../../lib/actions/doctor'
import { DOCTOR_ACTION_IDLE } from '@/lib/types'

interface CellActionProps {
  data: DoctorColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const path = usePathname()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleteState, deleteAction] = useActionState(
    deleteDoctor.bind(null, data?.id as string),
    DOCTOR_ACTION_IDLE,
  )

  // const onCopy = (id: string) => {
  //   navigator.clipboard.writeText(id)
  //   toast.success('ID کپی شد')
  // }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={deleteAction}
        isPending={isPending}
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
            onClick={() => router.push(`/dashboard/doctors/${data.id}`)}
          >
            <Edit className="ml-2 h-4 w-4" /> آپدیت
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="ml-2 h-4 w-4" /> حذف
          </DropdownMenuItem>
          {/* <DropdownMenuItem onClick={() => onCopy(`${data.id}`)}>
            <Copy className="ml-2 h-4 w-4" /> کپی ID
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
