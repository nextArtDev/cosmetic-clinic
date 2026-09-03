'use client'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Loader2, Trash } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { Controller, FieldPath, useForm } from 'react-hook-form'

import { AlertModal } from '../../../../../../../components/dashboard/AlertModal'

import {
  createPersonnel,
  deletePersonnel,
  editPersonnel,
} from '@/app/(dashboard)/dashboard/lib/actions/personnel'
import {
  PersonnelFormInput,
  personnelFormSchema,
  PersonnelFormValues,
} from '@/app/(dashboard)/dashboard/lib/schemas/personnels'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { PERSONNEL_ACTION_IDLE, PersonnelActionState } from '@/lib/types'
import { useActionState } from 'react'
import { toast } from 'sonner'
import ImageUploadField from '../../../doctors/[doctorId]/components/image-upload-field'
import { Calendar } from '@/components/ui/calendar'

export interface PersonnelFormInitialData {
  userId: string | null

  fullName: string
  email: string | null
  phoneNumber: string | null
  bio: string | null
  position: string | null
  // departmentId: string | null
  isActive: boolean
  order: number | 0
  hiredAt: string | null
  images: { id: string; url: string }[]
}
// interface Option {
//   id: string
//   name: string
// }

interface PersonnelFormProps {
  initialData: PersonnelFormInitialData | null
  // departments: Option[] | []
}

function buildFormData(values: PersonnelFormValues): FormData {
  const fd = new FormData()

  fd.set('fullName', values.fullName)
  fd.set('email', values.email)
  fd.set('phoneNumber', values.phoneNumber ?? '')
  fd.set('bio', values.bio)
  fd.set('position', values.position ?? '')
  // fd.set('departmentId', values.departmentId ?? '')
  fd.set('order', String(values.order ?? 0))
  fd.set('isActive', String(values.isActive))
  if (values.hiredAt) {
    fd.set('hiredAt', values.hiredAt)
  }
  for (const id of values.keepImageIds) fd.append('keepImageIds', id)
  for (const file of values.images) fd.append('images', file)
  return fd
}

export default function PersonnelForm({
  initialData,
  // departments,
}: PersonnelFormProps) {
  console.log(initialData, 'OK  ')
  const isEdit = !!initialData?.phoneNumber

  const userId = initialData?.userId

  const [isPending, startTransition] = useTransition()

  const form = useForm<PersonnelFormInput, unknown, PersonnelFormValues>({
    resolver: zodResolver(personnelFormSchema),
    defaultValues: initialData
      ? {
          fullName: initialData.fullName ?? '',
          email: initialData.email ?? '',
          phoneNumber: initialData.phoneNumber ?? '',
          bio: initialData.bio ?? '',
          position: initialData.position ?? '',
          // departmentId: initialData.departmentId ?? '',
          isActive: initialData.isActive,
          order: initialData.order ?? 0,
          hiredAt: initialData.hiredAt ?? undefined,
          images: [],
          keepImageIds: initialData.images.map((i) => i.id),
        }
      : {
          fullName: '',
          email: '',
          phoneNumber: '',
          bio: '',
          position: '',
          // departmentId: '',
          isActive: true,
          order: 0,
          hiredAt: undefined,
          images: [],
        },
  })

  function applyServerErrors(state: PersonnelActionState) {
    if (state.status !== 'error') return

    // 1. Show the general form error at the top of the screen
    if (state.formError) {
      toast.error(state.formError)
    }

    // 2. Apply field-specific errors under the inputs
    let focused = false
    for (const [key, messages] of Object.entries(state.fieldErrors ?? {})) {
      form.setError(
        key as FieldPath<PersonnelFormInput>,
        {
          type: 'server',
          message: messages.join(' و '),
        },
        { shouldFocus: !focused },
      )
      focused = true
    }

    // 3. If it's an error but there's no specific message, show a fallback
    if (!state.formError && !state.fieldErrors) {
      toast.error('خطای ناشناخته در سرور رخ داد.')
    }
  }
  const onSubmit = form.handleSubmit((values) => {
    // console.log(form.watch('images'))

    startTransition(async () => {
      const action = isEdit
        ? editPersonnel.bind(null, userId!)
        : createPersonnel
      // On success the action redirects — this line only "returns" on error.
      const state = await action(PERSONNEL_ACTION_IDLE, buildFormData(values))
      applyServerErrors(state)
    })
  })

  // Delete flow — proper useActionState (React 19), typed end-to-end.
  const [deleteState, deleteAction, deleteIsPending] = useActionState(
    isEdit
      ? deletePersonnel.bind(null, userId!)
      : async () => PERSONNEL_ACTION_IDLE,
    PERSONNEL_ACTION_IDLE,
  )
  useEffect(() => {
    if (deleteState.status === 'error' && deleteState.formError) {
      toast.error(deleteState.formError)
    }
  }, [deleteState])

  const busy = isPending || deleteIsPending

  return (
    <>
      {isEdit && (
        <>
          <div className="flex items-center justify-between">
            <AlertModalTrigger disabled={busy} deleteAction={deleteAction} />
          </div>
          <Separator className="my-4" />
        </>
      )}

      <Separator />
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup className="w-full space-y-8">
          <ImageUploadField
            control={form.control}
            name="images"
            keepName="keepImageIds"
            label="تصویر پرسنل"
            existingImages={initialData?.images ?? []}
            disabled={busy}
          />
          <div className="grid gap-6 md:grid-cols-3">
            <Controller
              control={form.control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="personnel-name">
                    نام و نام خانوادگی پرسنل{' '}
                    <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <Input
                    disabled={isPending}
                    placeholder="نام کاربری "
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
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="personnel-email">
                    ایمیل <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <Input
                    id="personnel-email"
                    dir="ltr"
                    type="email"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    disabled={busy || isEdit}
                    {...field}
                  />
                  <FieldDescription>
                    حساب کاربری پرسنل با این ایمیل ساخته می‌شود.
                  </FieldDescription>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="phoneNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="personnel-phone">
                    شماره موبایل
                  </FieldLabel>
                  <Input
                    id="personnel-phone"
                    dir="ltr"
                    inputMode="tel"
                    placeholder="09123456789"
                    aria-invalid={fieldState.invalid}
                    disabled={busy}
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
              name="order"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="personnel-order">مرتبه</FieldLabel>
                  <Input
                    id="personnel-order"
                    type="number" // Forces numeric keyboard
                    dir="ltr"
                    inputMode="decimal"
                    placeholder="2"
                    aria-invalid={fieldState.invalid}
                    disabled={busy}
                    // Explicitly handle string <-> number conversion
                    value={field.value as number | undefined}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? 0 : Number(e.target.value),
                      )
                    }
                  />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="bio"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="personnel-bio">
                    بیوگرافی مختصر{' '}
                  </FieldLabel>
                  <Textarea
                    id="personnel-bio"
                    // placeholder=""
                    aria-invalid={fieldState.invalid}
                    disabled={busy}
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
              name="position"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="personnel-position">
                    موقعیت شغلی{' '}
                  </FieldLabel>
                  <Input
                    id="personnel-position"
                    // placeholder=""
                    aria-invalid={fieldState.invalid}
                    disabled={busy}
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
              name="hiredAt"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="personnel-hiredAt">
                    زمان استخدام
                  </FieldLabel>
                  <Calendar
                    id="personnel-hiredAt"
                    mode="single"
                    // Map RHF's value to Calendar's selected
                    selected={field.value ? new Date(field.value) : undefined}
                    // Map Calendar's onSelect to RHF's onChange (convert Date to ISO string)
                    onSelect={(date) => {
                      if (!date) return field.onChange(null)
                      const val =
                        date instanceof Date ? date.toISOString() : date
                      field.onChange(val)
                    }}
                    aria-invalid={fieldState.invalid}
                    disabled={busy}
                  />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
            {/* <Controller
              control={form.control}
              name="departmentId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="personnel-department">بخش</FieldLabel>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={busy}
                  >
                    <SelectTrigger
                      id="personnel-department"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="انتخاب بخش" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            /> */}
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Switch
                    id="personnel-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={busy}
                  />
                  <FieldLabel htmlFor="personnel-active">فعال</FieldLabel>
                </Field>
              )}
            />
          </div>
          <Button type="submit" disabled={busy} className="ml-auto">
            {isPending && <Loader2 className="ml-2 size-4 animate-spin" />}
            {isEdit ? 'ذخیره تغییرات' : 'ایجاد پرسنل'}
          </Button>
        </FieldGroup>
      </form>
    </>
  )
}

function AlertModalTrigger({
  disabled,
  deleteAction,
}: {
  disabled: boolean
  deleteAction: (fd: FormData) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={deleteAction}
        isPending={disabled}
      />
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-label="حذف پرسنل"
      >
        <Trash className="size-4" />
      </Button>
    </>
  )
}
