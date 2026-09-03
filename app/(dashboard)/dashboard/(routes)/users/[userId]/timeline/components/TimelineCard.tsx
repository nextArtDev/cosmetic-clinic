'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Pencil, Star, Trash } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { AlertModal } from '@/components/dashboard/AlertModal'
import { cn } from '@/lib/utils'
import { deleteTimeline } from '@/app/(dashboard)/dashboard/lib/actions/users'
import { TIMELINE_ACTION_IDLE } from '@/lib/types'

export interface TimelineCardEntry {
  id: string
  date: string
  description: string
  isEspecial: boolean
  images: { url: string }[]
}

export function TimelineCard({
  userId,
  entry,
}: {
  userId: string
  entry: TimelineCardEntry
}) {
  const [open, setOpen] = useState(false)
  const [deleteState, deleteAction] = useActionState(
    deleteTimeline.bind(null, entry.id, userId),
    TIMELINE_ACTION_IDLE,
  )
  void deleteState

  return (
    <div className="relative rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-colors duration-300 hover:border-primary/40 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              entry.isEspecial
                ? 'bg-amber-100 text-amber-700'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <Star size={18} />
          </div>
          <p className="text-sm font-medium">ثبت درمان / ویزیت</p>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href={`/dashboard/users/${userId}/timeline/${entry.id}`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
            aria-label="ویرایش"
          >
            <Pencil className="size-4" />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(true)}
            aria-label="حذف"
          >
            <Trash className="size-4" />
          </Button>
        </div>
      </div>

      {entry.isEspecial && (
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
          <Star size={10} className="fill-amber-500 text-amber-500" />
          درمان ویژه
        </span>
      )}

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {entry.description}
      </p>

      {entry.images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {entry.images.map((img, i) => (
            <Image
              key={i}
              src={img.url}
              alt="مستند درمانی"
              width={96}
              height={72}
              className="h-18 w-24 rounded-xl border object-cover"
            />
          ))}
        </div>
      )}

      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={deleteAction}
      />
    </div>
  )
}
