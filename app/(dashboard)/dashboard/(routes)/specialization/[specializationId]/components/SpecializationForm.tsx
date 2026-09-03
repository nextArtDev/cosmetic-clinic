'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Trash } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { FC, useState, useTransition, useActionState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'

import { AlertModal } from '@/components/dashboard/AlertModal'
import InputFileUpload from '@/components/dashboard/file-upload/InputFileUpload'
import {
  createSpecialization,
  deleteSpecialization,
  editSpecialization,
} from '@/app/(dashboard)/dashboard/lib/actions/specialization'
import { Image, Specialization } from '@/lib/generated/prisma'
import { createSpecializationSchema } from '@/app/(dashboard)/dashboard/lib/schemas'

// 1. Extract Input and Output types from the Zod schema
type FormInput = z.input<typeof createSpecializationSchema>
type FormOutput = z.output<typeof createSpecializationSchema>

interface SpecializationFormProps {
  initialData: (Specialization & { images: Image[] }) | null
}

const SpecializationForm: FC<SpecializationFormProps> = ({ initialData }) => {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const action = initialData ? 'ذخیره تغییرات' : 'ایجاد'

  // 2. Strictly type defaultValues and map images to match the schema exactly
  const defaultValues: FormInput = initialData
    ? {
        name: initialData.name!,
        description: initialData.description || '',
        images: (initialData.images || []).map((img) => ({ url: img.url })),
      }
    : {
        name: '',
        description: '',
        images: [],
      }

  // 3. Provide all three generic arguments to useForm
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createSpecializationSchema),
    defaultValues,
  })

  // 4. Wrap useActionState in an arrow function to satisfy React 19 types
  type DeleteState = Awaited<ReturnType<typeof deleteSpecialization>>

  const [deleteState, deleteAction] = useActionState(
    // Bind the extra arguments.
    // null is for the 'this' context.
    // React 19 will automatically pass (state, formData) as the last two arguments.
    deleteSpecialization.bind(null, path, initialData?.id as string),
    { errors: {} } as DeleteState,
  )

  const onSubmit = async (data: FormOutput) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description || '')

    if (data.images && data.images.length > 0) {
      for (const img of data.images) {
        if (img instanceof File) {
          formData.append('images', img)
        } else if (typeof img === 'string') {
          formData.append('images', img)
        } else if (typeof img === 'object' && img.url) {
          formData.append('images', img.url)
        }
      }
    }

    startTransition(async () => {
      try {
        // Pass { errors: {} } as the first argument to satisfy the new state parameter
        const res = initialData
          ? await editSpecialization(
              { errors: {} },
              formData,
              initialData.id as string,
              //  path,
            )
          : await createSpecialization({ errors: {} }, formData)

        if (res?.errors?.name) {
          form.setError('name', {
            type: 'custom',
            message: res.errors.name.join(' و '),
          })
        } else if (res?.errors?.images) {
          form.setError('images', {
            type: 'custom',
            message: res.errors.images.join(' و '),
          })
        } else if (res?.errors?._form) {
          toast.error(res.errors._form.join(' و '))
        }
      } catch (error) {
        if (
          !(error instanceof Error && error.message.includes('NEXT_REDIRECT'))
        ) {
          toast.error('مشکلی پیش آمده.')
        }
      }
    })
  }
  const isSubmitting = form.formState.isSubmitting || isPending

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

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <InputFileUpload
            unoptimized={true}
            initialDataImages={initialData?.images || []}
            name="images"
            label="تصویر تخصص"
          />

          <div className="md:grid md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                نام تخصص <span className="text-rose-500">*</span>
              </label>
              <Input
                id="name"
                disabled={isSubmitting}
                placeholder="نام تخصص"
                aria-invalid={!!form.formState.errors.name}
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                توضیحات تخصص
              </label>
              <Input
                id="description"
                disabled={isSubmitting}
                placeholder="توضیحات تخصص"
                aria-invalid={!!form.formState.errors.description}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
          </div>

          <Button disabled={isSubmitting} className="w-fit ml-auto">
            {isSubmitting ? (
              <Loader className="animate-spin w-full h-full" />
            ) : (
              action
            )}
          </Button>
        </form>
      </FormProvider>
    </>
  )
}

export default SpecializationForm
