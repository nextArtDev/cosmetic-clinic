'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useTransition } from 'react'
import { Controller, FieldPath, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  createTimeline,
  editTimeline,
} from '@/app/(dashboard)/dashboard/lib/actions/users'
import {
  TimelineFormInput,
  TimelineFormValues,
  timelineFormSchema,
} from '@/app/(dashboard)/dashboard/lib/schemas/users'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { TIMELINE_ACTION_IDLE, TimelineActionState } from '@/lib/types'

export interface TimelineEntry {
  id: string
  date: string
  description: string
  isEspecial: boolean
}

function buildFormData(values: TimelineFormValues): FormData {
  const fd = new FormData()
  fd.set('date', values.date)
  fd.set('description', values.description)
  fd.set('isEspecial', String(values.isEspecial))
  return fd
}

export default function TimelineForm({
  userId,
  initial,
}: {
  userId: string
  initial: TimelineEntry | null
}) {
  const isEdit = !!initial
  const [isPending, startTransition] = useTransition()

  const form = useForm<TimelineFormInput, unknown, TimelineFormValues>({
    resolver: zodResolver(timelineFormSchema),
    defaultValues: initial
      ? {
          date: initial.date,
          description: initial.description,
          isEspecial: initial.isEspecial,
        }
      : { date: '', description: '', isEspecial: false },
  })

  function applyServerErrors(state: TimelineActionState) {
    if (state.status !== 'error') return
    if (state.formError) toast.error(state.formError)
    for (const [key, messages] of Object.entries(state.fieldErrors ?? {})) {
      form.setError(key as FieldPath<TimelineFormInput>, {
        type: 'server',
        message: messages.join(' و '),
      })
    }
    if (!state.formError && !state.fieldErrors) {
      toast.error('خطای ناشناخته در سرور رخ داد.')
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const action = isEdit
        ? editTimeline.bind(null, initial!.id, userId)
        : createTimeline.bind(null, userId)
      const state = await action(TIMELINE_ACTION_IDLE, buildFormData(values))
      applyServerErrors(state)
    })
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup className="w-full space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Controller
            control={form.control}
            name="date"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="timeline-date">
                  تاریخ <span className="text-rose-500">*</span>
                </FieldLabel>
                <Input
                  id="timeline-date"
                  dir="rtl"
                  placeholder="مثلاً ۱۴۰۴/۰۵/۱۲"
                  aria-invalid={fieldState.invalid}
                  disabled={isPending}
                  {...field}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="isEspecial"
            render={({ field }) => (
              <Field orientation="horizontal">
                <Switch
                  id="timeline-special"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
                <FieldLabel htmlFor="timeline-special">ویژه</FieldLabel>
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="md:col-span-2">
                <FieldLabel htmlFor="timeline-description">
                  شرح درمان <span className="text-rose-500">*</span>
                </FieldLabel>
                <Textarea
                  id="timeline-description"
                  aria-invalid={fieldState.invalid}
                  disabled={isPending}
                  {...field}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending} className="ml-auto">
          {isPending && <Loader2 className="ml-2 size-4 animate-spin" />}
          {isEdit ? 'ذخیره تغییرات' : 'افزودن به تایم‌لاین'}
        </Button>
      </FieldGroup>
    </form>
  )
}