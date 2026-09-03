'use client'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Loader2, Trash } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { Controller, FieldPath, useForm } from 'react-hook-form'

import { AlertModal } from '@/components/dashboard/AlertModal'

import {
  createUser,
  deleteUser,
  editUser,
} from '@/app/(dashboard)/dashboard/lib/actions/users'
import {
  UserFormInput,
  UserFormValues,
  userFormSchema,
} from '@/app/(dashboard)/dashboard/lib/schemas/users'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { USER_ACTION_IDLE, UserActionState } from '@/lib/types'
import { useActionState } from 'react'
import { toast } from 'sonner'

export interface UserFormInitialData {
  id: string
  name: string
  email: string
  phoneNumber: string
  bio: string
  gender: string
  address: string
  isActive: boolean
}

interface UserFormProps {
  initialData: UserFormInitialData | null
}

function buildFormData(values: UserFormValues): FormData {
  const fd = new FormData()
  fd.set('name', values.name)
  fd.set('email', values.email)
  fd.set('phoneNumber', values.phoneNumber)
  fd.set('bio', values.bio ?? '')
  fd.set('gender', values.gender ?? '')
  fd.set('address', values.address ?? '')
  fd.set('isActive', String(values.isActive))
  return fd
}

export default function UserForm({ initialData }: UserFormProps) {
  const isEdit = !!initialData
  const userId = initialData?.id

  const [isPending, startTransition] = useTransition()

  const form = useForm<UserFormInput, unknown, UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          email: initialData.email,
          phoneNumber: initialData.phoneNumber,
          bio: initialData.bio,
          gender: initialData.gender,
          address: initialData.address,
          isActive: initialData.isActive,
        }
      : {
          name: '',
          email: '',
          phoneNumber: '',
          bio: '',
          gender: '',
          address: '',
          isActive: true,
        },
  })

  function applyServerErrors(state: UserActionState) {
    if (state.status !== 'error') return

    if (state.formError) {
      toast.error(state.formError)
    }

    let focused = false
    for (const [key, messages] of Object.entries(state.fieldErrors ?? {})) {
      form.setError(
        key as FieldPath<UserFormInput>,
        {
          type: 'server',
          message: messages.join(' و '),
        },
        { shouldFocus: !focused },
      )
      focused = true
    }

    if (!state.formError && !state.fieldErrors) {
      toast.error('خطای ناشناخته در سرور رخ داد.')
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const action = isEdit ? editUser.bind(null, userId!) : createUser
      const state = await action(USER_ACTION_IDLE, buildFormData(values))
      applyServerErrors(state)
    })
  })

  const [deleteState, deleteAction, deleteIsPending] = useActionState(
    isEdit ? deleteUser.bind(null, userId!) : async () => USER_ACTION_IDLE,
    USER_ACTION_IDLE,
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
          <div className="grid gap-6 md:grid-cols-3">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="user-name">
                    نام و نام خانوادگی <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <Input
                    id="user-name"
                    disabled={busy}
                    placeholder="نام بیمار"
                    aria-invalid={fieldState.invalid}
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
                  <FieldLabel htmlFor="user-email">
                    ایمیل <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <Input
                    id="user-email"
                    dir="ltr"
                    type="email"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    disabled={busy || isEdit}
                    {...field}
                  />
                  <FieldDescription>
                    ایمیل پس از ایجاد قابل تغییر نیست.
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
                  <FieldLabel htmlFor="user-phone">
                    شماره موبایل <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <Input
                    id="user-phone"
                    dir="ltr"
                    inputMode="tel"
                    placeholder="09123456789"
                    aria-invalid={fieldState.invalid}
                    disabled={busy || isEdit}
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
              name="gender"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="user-gender">جنسیت</FieldLabel>
                  <Input
                    id="user-gender"
                    placeholder="زن / مرد"
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
              name="address"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="user-address">آدرس</FieldLabel>
                  <Input
                    id="user-address"
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
              name="isActive"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Switch
                    id="user-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={busy}
                  />
                  <FieldLabel htmlFor="user-active">فعال</FieldLabel>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="bio"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="md:col-span-3">
                  <FieldLabel htmlFor="user-bio">یادداشت</FieldLabel>
                  <Textarea
                    id="user-bio"
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
          </div>
          <Button type="submit" disabled={busy} className="ml-auto">
            {isPending && <Loader2 className="ml-2 size-4 animate-spin" />}
            {isEdit ? 'ذخیره تغییرات' : 'ایجاد بیمار'}
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
        aria-label="حذف بیمار"
      >
        <Trash className="size-4" />
      </Button>
    </>
  )
}