'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Phone, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type BookingRow = {
  id: string
  date: string
  time: string
  doctorName: string
  patientName: string
  patientPhone: string
  status:
    | 'PAYMENT_PENDING'
    | 'BOOKING_CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW'
    | 'CASH'
  paymentStatus:
    | 'Pending'
    | 'Paid'
    | 'Failed'
    | 'Declined'
    | 'Cancelled'
    | 'Refunded'
    | 'PartiallyRefunded'
    | 'Chargeback'
  createdAt: string
}

const statusConfig = {
  PAYMENT_PENDING: {
    label: 'در انتظار پرداخت',
    variant: 'secondary' as const,
    color:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  BOOKING_CONFIRMED: {
    label: 'تایید شده',
    variant: 'default' as const,
    color:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  COMPLETED: {
    label: 'انجام شده',
    variant: 'outline' as const,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  CANCELLED: {
    label: 'لغو شده',
    variant: 'destructive' as const,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  NO_SHOW: {
    label: 'عدم حضور',
    variant: 'outline' as const,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
  CASH: {
    label: 'نقدی',
    variant: 'default' as const,
    color:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  },
}

export const columns: ColumnDef<BookingRow>[] = [
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="hover:bg-transparent px-0"
      >
        تاریخ
        <ArrowUpDown className="mr-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col font-medium">
        <span>{row.getValue('date')}</span>
        <span className="text-xs text-muted-foreground font-normal">
          {row.original.time}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'doctorName',
    header: 'پزشک',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.getValue('doctorName')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'patientName',
    header: 'بیمار',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue('patientName')}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Phone className="h-3 w-3" />
          {row.original.patientPhone}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'وضعیت نوبت',
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof statusConfig
      const config = statusConfig[status] || statusConfig.PAYMENT_PENDING
      return (
        <Badge
          variant={config.variant}
          className={cn('font-normal', config.color)}
        >
          {config.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'تاریخ ثبت',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.getValue('createdAt')}
      </span>
    ),
  },
]
