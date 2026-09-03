'use client'

// components/dashboard/schedule/disable-day-form.tsx
// The modern `DisableSpecialDay` — refactored for disableDoctorDay().
//
// What changed vs. your old component:
//   date sent as jalali 'yyyy/MM/dd' + day name  -> Gregorian ISO 'yyyy-MM-dd'
//        (server derives the weekday itself; jalali stays DISPLAY-ONLY —
//        your old code stored a Jalali-formatted string in the DB!)
//   full-day only                                -> optional partial window
//        (e.g. only 16:00–19:00) via DoctorLeave.startTime/endTime
//   `date <= new Date()` disabled TODAY too      -> today allowed; server
//        rejects only fully-past clinic days
//   throw/catch + generic toast                  -> structured DisableDayResult:
//        shows cancelled count, SMS sent/failed, and idempotent "already
//        disabled" as info, not error
//   unused `modal` state, dead imports           -> removed

import { FC, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format as formatJalali } from 'date-fns-jalali'
import { format } from 'date-fns'

import { CalendarIcon, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import type { DoctorOption } from './weekly-schedule-form'
import { disableDoctorDay } from '@/lib/actions/dashboard/booking/disableDay'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const formSchema = z
  .object({
    doctorId: z.string().min(1, 'دکتر را انتخاب کنید'),
    // date: z.date({  'وارد کردن روز الزامی است.' }),

    date: z.date().pipe(z.coerce.date()),
    // date: z.date(),
    partial: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    reason: z.string().max(500).optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.partial) return
    if (!HHMM_RE.test(v.startTime))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ساعت شروع را وارد کنید',
        path: ['startTime'],
      })
    if (!HHMM_RE.test(v.endTime))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ساعت پایان را وارد کنید',
        path: ['endTime'],
      })
    if (
      HHMM_RE.test(v.startTime) &&
      HHMM_RE.test(v.endTime) &&
      v.startTime >= v.endTime
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ساعت شروع باید قبل از پایان باشد',
        path: ['endTime'],
      })
  })

type FormValues = z.infer<typeof formSchema>

interface DisableDayFormProps {
  doctors: Pick<DoctorOption, 'id' | 'name'>[]
}

const DisableDayForm: FC<DisableDayFormProps> = ({ doctors }) => {
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: '',
      partial: false,
      startTime: '',
      endTime: '',
      reason: '',
    },
  })

  const date = form.watch('date')
  const partial = form.watch('partial')

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      const result = await disableDoctorDay({
        doctorId: data.doctorId,
        dateISO: format(data.date, 'yyyy-MM-dd'), // Gregorian ISO for the server
        startTime: data.partial ? data.startTime : null,
        endTime: data.partial ? data.endTime : null,
        reason: data.reason || undefined,
      })

      if (!result.ok) {
        const msgs: Record<string, string> = {
          UNAUTHORIZED: 'شما اجازه دسترسی ندارید!',
          INVALID_INPUT: 'اطلاعات فرم نامعتبر است.',
          PAST_DATE: 'این روز گذشته است و قابل غیرفعال‌سازی نیست.',
          DOCTOR_NOT_FOUND: 'دکتر یافت نشد!',
        }
        toast.error(
          msgs[result.error] ?? 'مشکلی پیش آمده لطفا دوباره امتحان کنید!',
        )
        return
      }

      if (result.alreadyDisabled) {
        toast.info('این روز قبلاً غیرفعال شده بود.')
      } else if (result.cancelled > 0) {
        toast.success(
          `روز غیرفعال شد. ${result.cancelled} نوبت لغو و به ${result.smsSent} بیمار پیامک ارسال شد.` +
            (result.smsFailed > 0 ? ` (${result.smsFailed} پیامک ناموفق)` : ''),
        )
      } else {
        toast.success('روز با موفقیت غیرفعال شد.')
      }
      form.reset()
    })
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="pt-12 space-y-10 mb-36 flex flex-col items-center"
    >
      <Controller
        control={form.control}
        name="doctorId"
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className="mx-auto w-[240px]"
          >
            <FieldLabel htmlFor="dd-doctor">نام دکتر</FieldLabel>
            <Select
              dir="rtl"
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                id="dd-doctor"
                aria-invalid={fieldState.invalid}
                onBlur={field.onBlur}
              >
                <SelectValue placeholder="دکتر را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="date"
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className="mx-auto w-[240px]"
          >
            <FieldLabel htmlFor="dd-date">غیرفعال کردن نوبت‌های روز</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dd-date"
                  variant="outline"
                  aria-invalid={fieldState.invalid}
                  className={cn(
                    'w-[240px] pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {field.value ? (
                    new Intl.DateTimeFormat('fa-IR').format(field.value)
                  ) : (
                    <span>انتخاب روز</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  // today IS selectable — the server only rejects days
                  // whose clinic-local day has fully ended
                  disabled={(d) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return d < today
                  }}
                  dir="rtl"
                />
              </PopoverContent>
            </Popover>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {date && (
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm font-semibold text-right">
              {`نوبت‌های روز ${formatJalali(date, 'yyyy/MM/dd')} ${
                partial ? 'در بازه انتخابی' : ''
              } کنسل می‌شوند.`}
            </p>

            <Controller
              control={form.control}
              name="partial"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="dd-partial">فقط بخشی از روز</FieldLabel>
                  <Switch
                    id="dd-partial"
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </Field>
              )}
            />

            {partial && (
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  control={form.control}
                  name="startTime"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="dd-start" className="text-xs">
                        از ساعت
                      </FieldLabel>
                      <Input
                        {...field}
                        id="dd-start"
                        dir="ltr"
                        type="time"
                        step={300}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="endTime"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="dd-end" className="text-xs">
                        تا ساعت
                      </FieldLabel>
                      <Input
                        {...field}
                        id="dd-end"
                        dir="ltr"
                        type="time"
                        step={300}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            )}

            <Controller
              control={form.control}
              name="reason"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="dd-reason" className="text-xs">
                    دلیل
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="dd-reason"
                    rows={2}
                    placeholder="مثلاً: مرخصی پزشک"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    در پیامک بیماران درج می‌شود
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button disabled={isPending} type="submit" className="w-full">
              {isPending ? <Loader2 className="animate-spin" /> : 'تایید'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </form>
  )
}

export default DisableDayForm
