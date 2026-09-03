'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { CalendarIcon, Search, X } from 'lucide-react'
import { format } from 'date-fns-jalali'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import Pagination from '@/components/shared/Pagination' // Assuming you have this custom component

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageNumber: number
  isNext: boolean
  pageSize: number
  totalCount: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageNumber,
  isNext,
  pageSize,
  totalCount,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  const router = useRouter()
  const searchParams = useSearchParams()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const handlePageSizeChange = (newPageSize: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pageSize', newPageSize)
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      table
        .getColumn('date')
        ?.setFilterValue(format(selectedDate, 'yyyy/MM/dd'))
    } else {
      table.getColumn('date')?.setFilterValue(undefined)
    }
  }

  const clearFilters = () => {
    table.resetColumnFilters()
    setDate(undefined)
  }

  const hasActiveFilters = table.getState().columnFilters.length > 0

  return (
    <div className="space-y-4" dir="rtl">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-sm w-full">
          <Search className="h-4 w-4 text-muted-foreground absolute mr-3" />
          <Input
            placeholder="جستجو در نام بیمار یا پزشک..."
            value={
              (table.getColumn('patientName')?.getFilterValue() as string) ??
              (table.getColumn('doctorName')?.getFilterValue() as string) ??
              ''
            }
            onChange={(event) => {
              // Search across both patient and doctor names
              const value = event.target.value
              table.getColumn('patientName')?.setFilterValue(value)
              table.getColumn('doctorName')?.setFilterValue(value)
            }}
            className="pl-3 pr-9 h-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select
            value={
              (table.getColumn('status')?.getFilterValue() as string) ?? 'all'
            }
            onValueChange={(value) => {
              if (value === 'all') {
                table.getColumn('status')?.setFilterValue(undefined)
              } else {
                table.getColumn('status')?.setFilterValue([value])
              }
            }}
          >
            <SelectTrigger className="h-10 w-[160px]">
              <SelectValue placeholder="وضعیت نوبت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="PAYMENT_PENDING">در انتظار پرداخت</SelectItem>
              <SelectItem value="BOOKING_CONFIRMED">تایید شده</SelectItem>
              <SelectItem value="COMPLETED">انجام شده</SelectItem>
              <SelectItem value="CANCELLED">لغو شده</SelectItem>
              <SelectItem value="NO_SHOW">عدم حضور</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-10 w-[160px] justify-start text-right font-normal',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                {date ? format(date, 'yyyy/MM/dd') : <span>انتخاب تاریخ</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                autoFocus
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 px-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 ml-2" />
              حذف فیلترها
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-right font-semibold text-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="transition-colors hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-40 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Search className="h-8 w-8 opacity-20" />
                        <p>هیچ نوبتی با این مشخصات یافت نشد.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-sm text-muted-foreground">
          نمایش{' '}
          <span className="font-medium text-foreground">{data.length}</span> از{' '}
          <span className="font-medium text-foreground">{totalCount}</span> نوبت
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              تعداد در صفحه:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Pagination
            className="!text-primary"
            pageNumber={pageNumber}
            isNext={isNext}
          />
        </div>
      </div>
    </div>
  )
}
