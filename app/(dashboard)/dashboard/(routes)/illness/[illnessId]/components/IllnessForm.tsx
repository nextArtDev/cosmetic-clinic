'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  DoctorProfile,
  Illness,
  Image,
  Specialization,
} from '@/lib/generated/prisma'
import { toast } from 'sonner'
import { Trash } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useActionState, useState, useTransition } from 'react'
import { Controller, Resolver, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AlertModal } from '@/components/dashboard/AlertModal'

import InputFileUpload from '@/components/dashboard/file-upload/InputFileUpload'

import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@/components/shared/multi-select'

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { createIllnessSchema } from '@/lib/schemas/dashboard'
import {
  createIllness,
  deleteIllness,
  editIllness,
} from '@/lib/actions/dashboard/illness'

type IllnessFormValues = z.infer<typeof createIllnessSchema>

interface IllnessFormProps {
  initialData:
    | (Illness & {
        images: Image[]
        specializations: Specialization[]
        doctors: { doctor: { name: string; id: string } }[]
      })
    | null
  specialization: Specialization[]
  doctor: { id: string; name: string }[]
}

function applyServerErrors(
  form: ReturnType<typeof useForm<IllnessFormValues>>,
  res: unknown,
) {
  const errors = (res as { errors?: Record<string, unknown> })?.errors ?? {}
  const fieldErrors = errors ?? {}

  let focused = false
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (!Array.isArray(messages) || messages.length === 0) continue

    // skip non-field keys
    if (key === '_form') continue

    form.setError(
      key as keyof IllnessFormValues,
      {
        type: 'custom',
        message: (messages as string[]).join(' و '),
      },
      { shouldFocus: !focused },
    )
    focused = true
  }

  if (errors?._form) {
    toast.error((errors._form as string[]).join(' و '))
  }
}

export default function IllnessForm({
  initialData,
  specialization,
  doctor,
}: IllnessFormProps) {
  const path = usePathname()

  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const action = initialData ? 'ذخیره تغییرات' : 'ایجاد'

  const defaultValues = initialData
    ? {
        name: initialData.name,
        description: initialData.description || '',
        specializationId: initialData.specializations?.map((s) => s.id) || [],
        doctorId: initialData.doctors?.map((w) => w.doctor.id) || [],
        images: initialData?.images || [],
      }
    : {
        name: '',
        description: '',
        specializationId: [],
        doctorId: [],
        images: [],
      }

  const form = useForm<IllnessFormValues>({
    resolver: zodResolver(createIllnessSchema) as Resolver<IllnessFormValues>,
    defaultValues,
  })

  const onSubmit = async (data: IllnessFormValues) => {
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('description', data.description || '')

    if (data.specializationId && data.specializationId.length > 0) {
      for (let i = 0; i < data.specializationId.length; i++) {
        formData.append('specializationId', data.specializationId[i])
      }
    }
    if (data.doctorId && data.doctorId.length > 0) {
      for (let i = 0; i < data.doctorId.length; i++) {
        formData.append('doctorId', data.doctorId[i])
      }
    }
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('images', data.images[i] as string | Blob)
      }
    }

    try {
      startTransition(async () => {
        if (initialData) {
          const res = await editIllness(
            formData,
            initialData.id as string,
            path,
          )
          applyServerErrors(form, res)
        } else {
          const res = await createIllness(formData, path)
          applyServerErrors(form, res)
        }
      })
    } catch {
      toast.error('مشکلی پیش آمده، لطفا دوباره امتحان کنید!')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleteState, deleteAction] = useActionState(
    deleteIllness.bind(null, path, initialData?.id as string),
    {
      errors: {},
    },
  )

  const specializationOptions = specialization.map((s) => ({
    label: s.name,
    value: s.id,
  }))
  const doctorOptions = doctor.map((d) => ({
    label: d.name,
    value: d.id,
  }))

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={deleteAction}
        isPending={isPending}
      />
      <div className="flex items-center justify-between">
        {initialData && (
          <Button
            disabled={isPending}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full "
      >
        <InputFileUpload
          unoptimized={true}
          initialDataImages={initialData?.images || []}
          name="images"
          label="تصویر بیماری"
        />

        <FieldGroup className="md:grid md:grid-cols-3 gap-8 space-y-8">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>نام بیماری</FieldLabel>
                <Input
                  disabled={isPending}
                  placeholder="نام بیماری"
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
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>توضیحات بیماری</FieldLabel>
                <Textarea
                  disabled={isPending}
                  placeholder="توضیحات بیماری"
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
            name="specializationId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>تخصص(های) مربوط</FieldLabel>
                <MultiSelector
                  onValuesChange={field.onChange}
                  values={field.value}
                  options={specializationOptions}
                >
                  <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder="تخصص(های) مربوط به بیماری را انتخاب کنید." />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      {specialization.map((specializationItem) => (
                        <MultiSelectorItem
                          key={specializationItem.name}
                          value={specializationItem.id}
                        >
                          <span>{specializationItem.name}</span>
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

          <Controller
            control={form.control}
            name="doctorId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>دکتر(های) معالج</FieldLabel>
                <MultiSelector
                  onValuesChange={field.onChange}
                  values={field.value}
                  options={doctorOptions}
                >
                  <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder="دکتر(های) مربوط به بیماری را انتخاب کنید." />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      {doctor.map((doctorItem) => (
                        <MultiSelectorItem
                          key={doctorItem.name}
                          value={doctorItem.id}
                        >
                          <span>{doctorItem.name}</span>
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
        </FieldGroup>

        <Button disabled={isPending} className="ml-auto" type="submit">
          {action}
        </Button>
      </form>
    </>
  )
}
