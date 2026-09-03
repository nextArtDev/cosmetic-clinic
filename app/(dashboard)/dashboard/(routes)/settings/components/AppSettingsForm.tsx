'use client'

import { useState, useTransition } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { AppSettings } from '@/lib/actions/dashboard/settings/get-app-settings'
import { updateAppSettings } from '@/lib/actions/dashboard/settings/update-app-settings'

const schema = z.object({
  timezone: z.string().min(1).max(100),
  defaultSlotDuration: z.coerce.number<number>().int().int().min(2).max(120),
  slotReservationDuration: z.coerce.number<number>().int().int().min(1).max(60),
  maxAdvanceBookingDays: z.coerce.number<number>().int().int().min(1).max(365),
  minLeadTimeMinutes: z.coerce.number<number>().int().int().min(0).max(1440),
})

type FormValues = z.infer<typeof schema>

export default function AppSettingsForm({
  initialValues,
}: {
  initialValues: AppSettings
}) {
  const [pending, startTransition] = useTransition()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      timezone: initialValues.timezone ?? 'Asia/Tehran',
      defaultSlotDuration: initialValues.defaultSlotDuration,
      slotReservationDuration: initialValues.slotReservationDuration,
      maxAdvanceBookingDays: initialValues.maxAdvanceBookingDays,
      minLeadTimeMinutes: initialValues.minLeadTimeMinutes,
    },
  })

  const onSubmit = (values: FormValues) => {
    setSubmitError(null)
    startTransition(async () => {
      const res = await updateAppSettings(values)
      if (!res.ok) {
        toast.error(res.error)
        setSubmitError(res.error)
        return
      }
      toast.success('تنظیمات با موفقیت ذخیره شد.')
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>پارامترهای زمان‌بندی و رزرو</CardTitle>
        <CardDescription>
          این مقادیر سراسری هستند و روی محاسبه زمان‌های قابل رزرو و قوانین رزرو
          تاثیر می‌گذارند.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field className="grid gap-2">
              <FieldLabel>Timezone (IANA)</FieldLabel>
              <Input
                dir="ltr"
                placeholder="Asia/Tehran"
                {...form.register('timezone')}
                aria-invalid={!!form.formState.errors.timezone}
              />
              {form.formState.errors.timezone?.message && (
                <FieldError
                  errors={[{ message: form.formState.errors.timezone.message }]}
                />
              )}
            </Field>
          </FieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>مدت پیش‌فرض هر نوبت (دقیقه)</FieldLabel>
              <Input type="number" {...form.register('defaultSlotDuration')} />
              {form.formState.errors.defaultSlotDuration?.message && (
                <FieldError
                  errors={[
                    {
                      message:
                        form.formState.errors.defaultSlotDuration.message,
                    },
                  ]}
                />
              )}
            </Field>

            <Field>
              <FieldLabel>مدت زمان رزرو (دقیقه)</FieldLabel>
              <Input
                type="number"
                {...form.register('slotReservationDuration')}
              />
              {form.formState.errors.slotReservationDuration?.message && (
                <FieldError
                  errors={[
                    {
                      message:
                        form.formState.errors.slotReservationDuration.message,
                    },
                  ]}
                />
              )}
            </Field>

            <Field>
              <FieldLabel>حداکثر فاصله رزرو (روز)</FieldLabel>
              <Input
                type="number"
                {...form.register('maxAdvanceBookingDays')}
              />
              {form.formState.errors.maxAdvanceBookingDays?.message && (
                <FieldError
                  errors={[
                    {
                      message:
                        form.formState.errors.maxAdvanceBookingDays.message,
                    },
                  ]}
                />
              )}
            </Field>

            <Field>
              <FieldLabel>حداقل زمان فاصله از الان (دقیقه)</FieldLabel>
              <Input type="number" {...form.register('minLeadTimeMinutes')} />
              {form.formState.errors.minLeadTimeMinutes?.message && (
                <FieldError
                  errors={[
                    {
                      message: form.formState.errors.minLeadTimeMinutes.message,
                    },
                  ]}
                />
              )}
            </Field>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending} className="min-w-[220px]">
              {pending ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </Button>

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
