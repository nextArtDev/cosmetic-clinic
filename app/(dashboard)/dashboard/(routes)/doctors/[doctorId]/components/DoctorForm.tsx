'use client'

// components/dashboard/doctors/doctor-form.tsx
// The modern DoctorForm.
//
// What changed vs. the old component:
//   deprecated Form/FormField/FormItem/FormControl -> Field/FieldLabel/FieldError
//                                                     + <Controller> directly
//   60-line if/else chain mapping server errors    -> one applyServerErrors() loop
//   `error.message.includes('NEXT_REDIRECT')`      -> gone; the action redirects
//                                                     itself and never throws here
//   manual FormData building field-by-field        -> buildFormData() helper
//   `FC<Props>` + separate create/edit branches    -> one action via .bind()
//   open_time TagsInput («سه‌شنبه 12 تا 14»)        -> removed; availability is
//                                                     structured, edited in the
//                                                     weekly-schedule form
//   delete via useActionState with untyped bind    -> typed useActionState + toast

import { useActionState, useEffect, useState, useTransition } from 'react'
import { useForm, Controller, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CalendarClock, Loader2, Trash } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@/components/shared/multi-select'
import { AlertModal } from '@/components/dashboard/AlertModal'
import ImageUploadField from './image-upload-field'
import {
  doctorFormSchema,
  type DoctorFormInput,
  type DoctorFormValues,
} from '@/app/(dashboard)/dashboard/lib/schemas/doctor'
import {
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '@/app/(dashboard)/dashboard/lib/actions/doctor'
import { DOCTOR_ACTION_IDLE, type DoctorActionState } from '@/lib/types'

// ---------------------------------------------------------------------------

export interface DoctorFormInitialData {
  userId: string
  name: string
  email: string
  phoneNumber: string | null
  brief: string
  credentials: string
  departmentId: string | null
  slotDurationMinutes: number
  isActive: boolean
  specializationIds: string[]
  primarySpecializationId: string | null
  illnessIds: string[]
  images: { id: string; url: string }[]
}

interface Option {
  id: string
  name: string
}

interface DoctorFormProps {
  initialData: DoctorFormInitialData | null
  specializations: Option[]
  illnesses: Option[]
  departments: Option[]
}

// ---------------------------------------------------------------------------

function buildFormData(values: DoctorFormValues): FormData {
  const fd = new FormData()
  fd.set('name', values.name)
  fd.set('email', values.email)
  fd.set('phoneNumber', values.phoneNumber ?? '')
  fd.set('credentials', values.credentials)
  fd.set('brief', values.brief)
  fd.set('departmentId', values.departmentId ?? '')
  fd.set('primarySpecializationId', values.primarySpecializationId ?? '')
  fd.set('slotDurationMinutes', String(values.slotDurationMinutes))
  fd.set('isActive', String(values.isActive))
  for (const id of values.specializationIds) fd.append('specializationIds', id)
  for (const id of values.illnessIds) fd.append('illnessIds', id)
  for (const id of values.keepImageIds) fd.append('keepImageIds', id)
  for (const file of values.images) fd.append('images', file)
  return fd
}

export default function DoctorForm({
  initialData,
  specializations,
  illnesses,
  departments,
}: DoctorFormProps) {
  const isEdit = initialData !== null
  const [isPending, startTransition] = useTransition()

  const form = useForm<DoctorFormInput, unknown, DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          email: initialData.email,
          phoneNumber: initialData.phoneNumber ?? '',
          brief: initialData.brief,
          credentials: initialData.credentials,
          departmentId: initialData.departmentId ?? '',
          specializationIds: initialData.specializationIds,
          primarySpecializationId: initialData.primarySpecializationId ?? '',
          illnessIds: initialData.illnessIds,
          slotDurationMinutes: initialData.slotDurationMinutes,
          isActive: initialData.isActive,
          images: [],
          keepImageIds: initialData.images.map((i) => i.id),
        }
      : {
          name: '',
          email: '',
          phoneNumber: '',
          brief: '',
          credentials: '',
          departmentId: '',
          specializationIds: [],
          primarySpecializationId: '',
          illnessIds: [],
          slotDurationMinutes: 30,
          isActive: true,
          images: [],
          keepImageIds: [],
        },
  })

  /** ONE loop replaces the old per-field if/else chain. Unknown keys
   *  (e.g. server-only checks) fall through to a toast. */
  function applyServerErrors(state: DoctorActionState) {
    if (state.status !== 'error') return
    let focused = false
    for (const [key, messages] of Object.entries(state.fieldErrors ?? {})) {
      form.setError(
        key as FieldPath<DoctorFormInput>,
        {
          type: 'server',
          message: messages.join(' و '),
        },
        { shouldFocus: !focused },
      )
      focused = true
    }
    if (state.formError) toast.error(state.formError)
  }

  const onSubmit = form.handleSubmit((values) => {
    // console.log(form.watch('images'))
    // console.log(values, 'OK auth')
    startTransition(async () => {
      const action = isEdit
        ? updateDoctor.bind(null, initialData.userId)
        : createDoctor
      // On success the action redirects — this line only "returns" on error.
      const state = await action(DOCTOR_ACTION_IDLE, buildFormData(values))
      applyServerErrors(state)
    })
  })

  // Delete flow — proper useActionState (React 19), typed end-to-end.
  const [deleteState, deleteAction, deleteIsPending] = useActionState(
    isEdit
      ? deleteDoctor.bind(null, initialData.userId)
      : async () => DOCTOR_ACTION_IDLE,
    DOCTOR_ACTION_IDLE,
  )
  useEffect(() => {
    if (deleteState.status === 'error' && deleteState.formError) {
      toast.error(deleteState.formError)
    }
  }, [deleteState])

  const busy = isPending || deleteIsPending
  const specializationIds = form.watch('specializationIds')

  return (
    <>
      {isEdit && (
        <>
          <div className="flex items-center justify-between">
            <FieldDescription className="flex items-center gap-2">
              <CalendarClock className="size-4" />
              روز و ساعت حضور در{' '}
              <Link
                href={`/dashboard/doctors/${initialData.userId}/schedule`}
                className="underline underline-offset-4"
              >
                برنامه هفتگی دکتر
              </Link>{' '}
              تنظیم می‌شود.
            </FieldDescription>
            <AlertModalTrigger disabled={busy} deleteAction={deleteAction} />
          </div>
          <Separator className="my-4" />
        </>
      )}

      <form onSubmit={onSubmit} noValidate>
        <FieldGroup className="w-full space-y-8">
          <ImageUploadField
            control={form.control}
            name="images"
            keepName="keepImageIds"
            label="تصویر دکتر"
            existingImages={initialData?.images ?? []}
            disabled={busy}
          />

          <div className="grid gap-6 md:grid-cols-3">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="doctor-name">
                    نام و نام خانوادگی دکتر{' '}
                    <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <Input
                    id="doctor-name"
                    placeholder="مثلاً دکتر سارا محمدی"
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
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="doctor-email">
                    ایمیل <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <Input
                    id="doctor-email"
                    dir="ltr"
                    type="email"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    disabled={busy || isEdit}
                    {...field}
                  />
                  <FieldDescription>
                    حساب کاربری دکتر با این ایمیل ساخته می‌شود.
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
                  <FieldLabel htmlFor="doctor-phone">شماره موبایل</FieldLabel>
                  <Input
                    id="doctor-phone"
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
              name="credentials"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="doctor-credentials">
                    عنوان و مدرک <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <Input
                    id="doctor-credentials"
                    placeholder="مثلاً متخصص قلب و عروق، فلوشیپ اکو"
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
              name="departmentId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="doctor-department">بخش</FieldLabel>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={busy}
                  >
                    <SelectTrigger
                      id="doctor-department"
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
            />

            <Controller
              control={form.control}
              name="slotDurationMinutes"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="doctor-slot">
                    مدت هر نوبت (دقیقه)
                  </FieldLabel>
                  <Input
                    id="doctor-slot"
                    dir="ltr"
                    type="number"
                    min={5}
                    max={180}
                    step={5}
                    aria-invalid={fieldState.invalid}
                    disabled={busy}
                    {...field}
                    value={field.value ?? 30}
                  />
                  <FieldDescription>
                    قابل بازنویسی در هر بازه‌ی برنامه هفتگی.
                  </FieldDescription>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="specializationIds"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="md:col-span-2"
                >
                  <FieldLabel htmlFor="doctor-specializations">
                    تخصص <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    options={specializations.map((s) => ({
                      label: s.name,
                      value: s.id,
                    }))}
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput
                        id="doctor-specializations"
                        aria-invalid={fieldState.invalid}
                        placeholder="تخصص(های) دکتر را انتخاب کنید."
                      />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        {specializations.map((s) => (
                          <MultiSelectorItem key={s.id} value={s.id}>
                            {s.name}
                          </MultiSelectorItem>
                        ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            {specializationIds.length > 1 && (
              <Controller
                control={form.control}
                name="primarySpecializationId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="doctor-primary-spec">
                      تخصص اصلی
                    </FieldLabel>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      disabled={busy}
                    >
                      <SelectTrigger
                        id="doctor-primary-spec"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="تخصص اصلی روی کارت دکتر" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations
                          .filter((s) => specializationIds.includes(s.id))
                          .map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            )}

            <Controller
              control={form.control}
              name="illnessIds"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="md:col-span-2"
                >
                  <FieldLabel htmlFor="doctor-illnesses">
                    بیماری‌های تحت درمان
                  </FieldLabel>
                  <MultiSelector
                    values={field.value ?? []}
                    onValuesChange={field.onChange}
                    options={illnesses.map((i) => ({
                      label: i.name,
                      value: i.id,
                    }))}
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput
                        id="doctor-illnesses"
                        placeholder="مثلاً میگرن، دیابت…"
                      />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        {illnesses.map((i) => (
                          <MultiSelectorItem key={i.id} value={i.id}>
                            {i.name}
                          </MultiSelectorItem>
                        ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                  <FieldDescription>
                    برای جستجوی «چه دکتری X را درمان می‌کند؟»
                  </FieldDescription>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="brief"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="doctor-brief">
                  معرفی کوتاه <span className="text-rose-500">*</span>
                </FieldLabel>
                <Textarea
                  id="doctor-brief"
                  rows={4}
                  placeholder="چند جمله درباره سوابق و رویکرد درمانی دکتر…"
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
                  id="doctor-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={busy}
                />
                <FieldLabel htmlFor="doctor-active">
                  فعال (قابل رزرو برای بیماران)
                </FieldLabel>
              </Field>
            )}
          />

          <Button type="submit" disabled={busy} className="ml-auto">
            {isPending && <Loader2 className="ml-2 size-4 animate-spin" />}
            {isEdit ? 'ذخیره تغییرات' : 'ایجاد دکتر'}
          </Button>
        </FieldGroup>
      </form>
    </>
  )
}

// ---------------------------------------------------------------------------
// Local trigger keeps AlertModal open/close state out of the form component.

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
        aria-label="حذف دکتر"
      >
        <Trash className="size-4" />
      </Button>
    </>
  )
}
