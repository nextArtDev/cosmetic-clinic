'use client'

import { FC, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format as formatJalali } from 'date-fns-jalali'
import { format } from 'date-fns'

import {
  CalendarIcon,
  Loader2,
  Clock,
  AlertTriangle,
  FileText,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
    doctorId: z.string().min(1, 'لطفاً پزشک را انتخاب کنید'),
    // date: z.date({ required_error: 'انتخاب روز الزامی است' }),
    date: z.date().pipe(z.coerce.date()),

    partial: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    reason: z
      .string()
      .max(500, 'دلیل نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد')
      .optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.partial) return

    if (!v.startTime || !HHMM_RE.test(v.startTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ساعت شروع را به درستی وارد کنید',
        path: ['startTime'],
      })
    }
    if (!v.endTime || !HHMM_RE.test(v.endTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ساعت پایان را به درستی وارد کنید',
        path: ['endTime'],
      })
    }
    if (
      v.startTime &&
      v.endTime &&
      HHMM_RE.test(v.startTime) &&
      HHMM_RE.test(v.endTime) &&
      v.startTime >= v.endTime
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ساعت شروع باید قبل از ساعت پایان باشد',
        path: ['endTime'],
      })
    }
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
        dateISO: format(data.date, 'yyyy-MM-dd'),
        startTime: data.partial ? data.startTime : null,
        endTime: data.partial ? data.endTime : null,
        reason: data.reason?.trim() || undefined,
      })

      if (!result.ok) {
        const msgs: Record<string, string> = {
          UNAUTHORIZED: 'شما اجازه دسترسی به این بخش را ندارید.',
          INVALID_INPUT: 'اطلاعات وارد شده نامعتبر است.',
          PAST_DATE: 'این روز در گذشته است و قابل غیرفعال‌سازی نیست.',
          DOCTOR_NOT_FOUND: 'پزشک مورد نظر یافت نشد.',
        }
        toast.error(
          msgs[result.error] ?? 'خطایی رخ داده است. لطفاً دوباره تلاش کنید.',
        )
        return
      }

      if (result.alreadyDisabled) {
        toast.info('این روز قبلاً برای این پزشک غیرفعال شده بود.')
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
      className="max-w-2xl mx-auto space-y-6 pb-12"
    >
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          غیرفعال‌سازی روز کاری
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          در صورت مرخصی یا تعطیلی پزشک، می‌توانید یک روز یا بازه زمانی خاص را
          غیرفعال کنید. نوبت‌های رزرو شده در این بازه به صورت خودکار لغو و به
          بیماران اطلاع‌رسانی می‌شود.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">اطلاعات پایه</CardTitle>
          <CardDescription>
            پزشک و تاریخ مورد نظر را انتخاب کنید.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor Selection */}
            <Controller
              control={form.control}
              name="doctorId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="dd-doctor">نام پزشک</FieldLabel>
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
                      <SelectValue placeholder="انتخاب پزشک..." />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Date Selection */}
            <Controller
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="dd-date">تاریخ غیرفعال‌سازی</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="dd-date"
                        variant="outline"
                        aria-invalid={fieldState.invalid}
                        className={cn(
                          'w-full justify-start text-right font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          formatJalali(field.value, 'yyyy/MM/dd')
                        ) : (
                          <span>انتخاب تاریخ</span>
                        )}
                        <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      dir="rtl"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(d) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return d < today
                        }}
                        dir="rtl"
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Conditional Details Section */}
          {date && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="h-px bg-border" />

              <Alert
                variant={partial ? 'default' : 'destructive'}
                className={cn(
                  'transition-colors',
                  partial
                    ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800'
                    : '',
                )}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {partial ? 'غیرفعال‌سازی بخشی از روز' : 'غیرفعال‌سازی کل روز'}
                </AlertTitle>
                <AlertDescription>
                  {partial
                    ? `نوبت‌های روز ${formatJalali(date, 'yyyy/MM/dd')} در بازه زمانی انتخابی لغو خواهند شد.`
                    : `تمامی نوبت‌های روز ${formatJalali(date, 'yyyy/MM/dd')} برای این پزشک لغو خواهد شد.`}
                </AlertDescription>
              </Alert>

              <Controller
                control={form.control}
                name="partial"
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30 transition-colors hover:bg-muted/50">
                    <div className="space-y-0.5">
                      <FieldLabel
                        htmlFor="dd-partial"
                        className="text-base cursor-pointer"
                      >
                        غیرفعال‌سازی فقط بخشی از روز
                      </FieldLabel>
                      <FieldDescription>
                        در صورت فعال‌سازی، فقط بازه زمانی مشخص شده غیرفعال
                        می‌شود.
                      </FieldDescription>
                    </div>
                    <Switch
                      id="dd-partial"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </div>
                )}
              />

              {partial && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/20">
                  <Controller
                    control={form.control}
                    name="startTime"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="dd-start"
                          className="text-xs flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" /> از ساعت
                        </FieldLabel>
                        <Input
                          {...field}
                          id="dd-start"
                          dir="ltr"
                          type="time"
                          step={300}
                          className="font-mono"
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
                        <FieldLabel
                          htmlFor="dd-end"
                          className="text-xs flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" /> تا ساعت
                        </FieldLabel>
                        <Input
                          {...field}
                          id="dd-end"
                          dir="ltr"
                          type="time"
                          step={300}
                          className="font-mono"
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
                    <FieldLabel
                      htmlFor="dd-reason"
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" /> دلیل غیرفعال‌سازی
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="dd-reason"
                      rows={3}
                      placeholder="مثلاً: مرخصی استعلاجی، تعطیلی اضطراری مطب، ..."
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      این متن عیناً در پیامک اطلاع‌رسانی به بیماران درج خواهد
                      شد.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 border-t bg-muted/10">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto order-2 sm:order-1"
            onClick={() => form.reset()}
            disabled={isPending}
          >
            پاک کردن فرم
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto order-1 sm:order-2 gap-2"
            disabled={isPending || !date}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? 'در حال ثبت...' : 'ثبت و غیرفعال‌سازی'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

export default DisableDayForm
