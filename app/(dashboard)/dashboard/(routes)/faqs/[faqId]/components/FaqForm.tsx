'use client'
import { zodResolver } from '@hookform/resolvers/zod'

import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Loader2, Trash } from 'lucide-react'
import { FC, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AlertModal } from '../../../../../../../components/dashboard/AlertModal'

import { createFaqSchema } from '@/lib/schemas/dashboard'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { createFaq, deleteFaq, editFaq } from '@/lib/actions/dashboard/faq'
import { FAQ } from '@/generated/prisma/client'

type FaqFormValues = z.infer<typeof createFaqSchema>

interface FaqFormProps {
  initialData: FAQ | null
}

const FaqForm: FC<FaqFormProps> = ({ initialData }) => {
  const path = usePathname()

  const [open, setOpen] = useState(false)

  const [isPending, startTransition] = useTransition()

  const action = initialData ? 'ذخیره تغییرات' : 'ایجاد'

  const defaultValues = initialData
    ? {
        ...initialData,
      }
    : {
        question: '',
        answer: '',
      }

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(createFaqSchema),
    defaultValues,
  })

  const onSubmit = async (data: FaqFormValues) => {
    const formData = new FormData()

    formData.append('question', data.question)
    formData.append('answer', data.answer)
    // console.log({ data })
    try {
      if (initialData) {
        startTransition(async () => {
          try {
            const res = await editFaq(formData, initialData.id as string, path)

            if (res?.errors?.question) {
              form.setError('question', {
                type: 'custom',
                message: res?.errors.question?.join(' و '),
              })
            } else if (res.errors?.answer) {
              form.setError('answer', {
                type: 'custom',
                message: res?.errors.answer?.join(' و '),
              })
            } else if (res?.errors?._form) {
              toast.error(res?.errors._form?.join(' و '))
            }
          } catch (error) {
            if (
              !(
                error instanceof Error &&
                error.message.includes('NEXT_REDIRECT')
              )
            ) {
              toast.error('مشکلی پیش آمده.')
            }
          }
        })
      } else {
        startTransition(async () => {
          try {
            const res = await createFaq(formData, path)

            if (res?.errors?.question) {
              form.setError('question', {
                type: 'custom',
                message: res?.errors.question?.join(' و '),
              })
            } else if (res.errors?.answer) {
              form.setError('answer', {
                type: 'custom',
                message: res?.errors.answer?.join(' و '),
              })
            } else if (res?.errors?._form) {
              toast.error(res?.errors._form?.join(' و '))
            }
          } catch (error) {
            if (
              !(
                error instanceof Error &&
                error.message.includes('NEXT_REDIRECT')
              )
            ) {
              toast.error('مشکلی پیش آمده.')
            }
          }
        })
      }
    } catch {
      toast.error('مشکلی پیش آمده، لطفا دوباره امتحان کنید!')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleteState, deleteAction] = useActionState(
    deleteFaq.bind(null, path, initialData?.id as string),
    {
      errors: {},
    },
  )
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        // onConfirm={onDelete}
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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-rows-2 gap-8">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سوال</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} placeholder="سوال" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>جواب</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} placeholder="جواب" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button disabled={isPending} className="ml-auto" type="submit">
            {isPending ? <Loader2 className="animate-spin" /> : action}
          </Button>
        </form>
      </Form>
    </>
  )
}

export default FaqForm
