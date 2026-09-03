'use client'

// components/dashboard/schedule/weekly-schedule-form.tsx
// The modern `AvailabilityTable` — refactored for saveWeeklySchedule().
//
// What changed vs. your old component:
//   one startTime/endTime per day       -> MULTIPLE blocks per day (useFieldArray)
//   `selected` switch per day           -> a day is "off" when it has 0 blocks
//   global `slicer` select              -> optional per-block slot duration
//                                          (falls back to DoctorProfile.slotDurationMinutes)
//   TimeValue objects + string glueing  -> plain "HH:MM" strings end-to-end
//                                          (`${hour}:${minute}` produced "9:5" — a bug;
//                                          <Input type="time"> always gives "09:05")
//   fire-and-forget await + toast       -> structured result handling: warnings,
//                                          HAS_ORPHANS -> confirm dialog -> resubmit
//                                          with orphanPolicy 'keep' | 'cancel'
//   Doctor model                        -> User + DoctorProfile (pass a slim DTO)

import { FC, useState, useTransition } from 'react'
import {
  useForm,
  useFieldArray,
  Control,
  useWatch,
  Controller,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Plus,
  Trash2,
  Clock,
  CalendarDays,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import {
  saveWeeklySchedule,
  type OrphanInfo,
  type SaveWeeklyScheduleInput,
} from '@/lib/actions/dashboard/booking/save-weekly-schedule'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'

// ---------------------------------------------------------------------------
// Types & schema (client-side mirror of the server zod — server re-validates)
// ---------------------------------------------------------------------------

export interface DoctorOption {
  id: string
  name: string
  defaultSlotDuration: number
}

export interface ExistingBlock {
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDurationMinutes: number | null
}

const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const blockSchema = z
  .object({
    startTime: z.string().regex(HHMM_RE, 'ساعت شروع را وارد کنید'),
    endTime: z.string().regex(HHMM_RE, 'ساعت پایان را وارد کنید'),
    slotDuration: z.string(),
  })
  .refine((b) => b.startTime < b.endTime, {
    message: 'ساعت شروع باید قبل از پایان باشد',
    path: ['endTime'],
  })

const formSchema = z.object({
  doctorId: z.string().min(1, 'دکتر را انتخاب کنید'),
  days: z
    .array(z.object({ blocks: z.array(blockSchema).max(6) }))
    .length(7)
    .superRefine((days, ctx) => {
      days.forEach((day, dayIdx) => {
        const sorted = [...day.blocks].sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        )
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i].startTime < sorted[i - 1].endTime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'بازه‌های زمانی این روز با هم تداخل دارند',
              path: [dayIdx, 'blocks'],
            })
          }
        }
      })
    }),
})

type FormValues = z.infer<typeof formSchema>

const SLOT_DURATIONS = [2, 5, 7, 10, 15, 20, 30, 45, 60]

const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5]
const DAY_LABELS: Record<number, string> = {
  6: 'شنبه',
  0: 'یکشنبه',
  1: 'دوشنبه',
  2: 'سه‌شنبه',
  3: 'چهارشنبه',
  4: 'پنجشنبه',
  5: 'جمعه',
}

function defaultsFrom(existing?: ExistingBlock[]): FormValues['days'] {
  const days: FormValues['days'] = Array.from({ length: 7 }, () => ({
    blocks: [],
  }))
  for (const b of existing ?? []) {
    days[b.dayOfWeek].blocks.push({
      startTime: b.startTime,
      endTime: b.endTime,
      slotDuration: b.slotDurationMinutes ? String(b.slotDurationMinutes) : '',
    })
  }
  return days
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface WeeklyScheduleFormProps {
  doctors: DoctorOption[]
  initialBlocks?: ExistingBlock[]
  initialDoctorId?: string
}

const WeeklyScheduleForm: FC<WeeklyScheduleFormProps> = ({
  doctors,
  initialBlocks,
  initialDoctorId,
}) => {
  const [isPending, startTransition] = useTransition()
  const [orphans, setOrphans] = useState<OrphanInfo[] | null>(null)
  const [pendingPayload, setPendingPayload] =
    useState<SaveWeeklyScheduleInput | null>(null)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: initialDoctorId ?? '',
      days: defaultsFrom(initialBlocks),
    },
  })

  const doctorId = form.watch('doctorId')
  const selectedDoctor = doctors.find((d) => d.id === doctorId)
  const hasAnyBlock = form.watch('days').some((d) => d.blocks.length > 0)

  function toPayload(
    data: FormValues,
    orphanPolicy: 'reject' | 'keep' | 'cancel',
  ): SaveWeeklyScheduleInput {
    return {
      doctorId: data.doctorId,
      orphanPolicy,
      days: data.days
        .map((day, dayOfWeek) => ({
          dayOfWeek,
          blocks: day.blocks.map((b) => ({
            startTime: b.startTime,
            endTime: b.endTime,
            slotDurationMinutes: b.slotDuration ? Number(b.slotDuration) : null,
          })),
        }))
        .filter((d) => d.blocks.length > 0),
    }
  }

  function submit(payload: SaveWeeklyScheduleInput) {
    startTransition(async () => {
      const result = await saveWeeklySchedule(payload)

      if (!result.ok) {
        if (result.error === 'HAS_ORPHANS') {
          setOrphans(result.orphans ?? [])
          setPendingPayload(payload)
          return
        }
        const msgs: Record<string, string> = {
          UNAUTHORIZED: 'شما اجازه دسترسی ندارید!',
          INVALID_INPUT: 'اطلاعات فرم نامعتبر است.',
          DOCTOR_NOT_FOUND: 'دکتر یافت نشد!',
        }
        toast.error(
          msgs[result.error] ?? 'مشکلی پیش آمده لطفا دوباره امتحان کنید!',
        )
        return
      }

      result.warnings.forEach((w) => toast.warning(w))
      if (result.cancelled > 0) {
        toast.info(
          `${result.cancelled} نوبت لغو شد و به ${result.smsSent} بیمار پیامک ارسال شد.`,
        )
      }
      toast.success('برنامه هفتگی با موفقیت ذخیره شد.')
      router.push('/dashboard/booking')
    })
  }

  const onSubmit = (data: FormValues) => submit(toPayload(data, 'reject'))

  function resolveOrphans(policy: 'keep' | 'cancel') {
    if (!pendingPayload) return
    setOrphans(null)
    submit({ ...pendingPayload, orphanPolicy: policy })
    setPendingPayload(null)
  }

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-3xl mx-auto pb-28"
      >
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            برنامه هفتگی نوبت‌دهی
          </h1>
          <p className="text-muted-foreground text-sm">
            بازه‌های کاری هر روز هفته را برای پزشک تعیین کنید. تغییرات بلافاصله
            بر روی نوبت‌های آینده تأثیر می‌گذارد.
          </p>
        </div>

        {/* Doctor Selection Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              انتخاب پزشک
            </CardTitle>
            <CardDescription>
              برنامه هفتگی برای کدام پزشک تنظیم می‌شود؟
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              control={form.control}
              name="doctorId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Select
                    dir="rtl"
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="ws-doctor"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      className="w-full"
                    >
                      <SelectValue placeholder="لطفاً یک پزشک را انتخاب کنید" />
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
            {selectedDoctor && (
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-md border border-primary/10">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  بازه پیش‌فرض این پزشک{' '}
                  <strong className="text-foreground">
                    {selectedDoctor.defaultSlotDuration} دقیقه
                  </strong>{' '}
                  است. شما می‌توانید برای هر بازه کاری به صورت جداگانه این مقدار
                  را تغییر دهید.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Days Schedule */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              روزهای هفته
            </h2>
          </div>
          <div className="grid gap-4">
            {WEEK_ORDER.map((dayOfWeek) => (
              <DayRow
                key={dayOfWeek}
                control={form.control}
                dayOfWeek={dayOfWeek}
                label={DAY_LABELS[dayOfWeek]}
                defaultSlotDuration={selectedDoctor?.defaultSlotDuration}
              />
            ))}
          </div>
        </div>

        {/* Sticky Footer Action */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 z-50">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground hidden sm:flex items-center gap-1.5">
              {hasAnyBlock ? (
                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  برنامه آماده ذخیره‌سازی است
                </span>
              ) : (
                <span>هنوز بازه کاری اضافه نکرده‌اید</span>
              )}
            </div>
            <Button
              disabled={!hasAnyBlock || isPending}
              className="w-full sm:w-auto min-w-[200px] h-11 text-base shadow-lg gap-2"
              type="submit"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? 'در حال ذخیره...' : 'ذخیره برنامه هفتگی'}
            </Button>
          </div>
        </div>
      </form>

      {/* Orphan confirmation Dialog */}
      <AlertDialog
        open={orphans !== null}
        onOpenChange={(o) => !o && setOrphans(null)}
      >
        <AlertDialogContent dir="rtl" className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              تداخل با نوبت‌های رزرو شده
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              تعداد <strong>{orphans?.length}</strong> نوبت رزروشده با برنامه
              جدید تداخل دارند و جایگاهی ندارند. لطفاً تعیین کنید با این نوبت‌ها
              چه کاری انجام شود:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ScrollArea className="max-h-60 rounded-md border bg-muted/30 p-3 my-2">
            <ul className="space-y-2">
              {orphans?.map((o) => (
                <li
                  key={o.appointmentId}
                  className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0"
                >
                  <span className="font-medium">{o.patientName}</span>
                  <span
                    dir="ltr"
                    className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-md border"
                  >
                    {o.dateLabel} — {o.timeLabel}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollArea>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              className="w-full sm:w-auto"
              onClick={() => setPendingPayload(null)}
            >
              انصراف از تغییرات
            </AlertDialogCancel>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => resolveOrphans('keep')}
              >
                حفظ نوبت‌ها
              </Button>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => resolveOrphans('cancel')}
              >
                لغو نوبت‌ها + پیامک
              </Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ---------------------------------------------------------------------------
// One weekday row sub-component
// ---------------------------------------------------------------------------

interface DayRowProps {
  control: Control<FormValues>
  dayOfWeek: number
  label: string
  defaultSlotDuration?: number
}

const DayRow: FC<DayRowProps> = ({
  control,
  dayOfWeek,
  label,
  defaultSlotDuration,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `days.${dayOfWeek}.blocks`,
  })
  const blocks = useWatch({ control, name: `days.${dayOfWeek}.blocks` })
  const isOff = (blocks?.length ?? 0) === 0

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isOff ? 'bg-muted/30 border-dashed' : 'bg-card shadow-sm',
      )}
    >
      <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">{label}</CardTitle>
          {isOff ? (
            <Badge variant="secondary" className="text-xs">
              تعطیل
            </Badge>
          ) : (
            <Badge
              variant="default"
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
            >
              {fields.length} بازه کاری
            </Badge>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant={isOff ? 'default' : 'outline'}
          className="h-8 gap-1 text-xs"
          onClick={() =>
            append({ startTime: '', endTime: '', slotDuration: '' })
          }
        >
          <Plus className="h-3.5 w-3.5" />
          {isOff ? 'افزودن ساعت کاری' : 'بازه جدید'}
        </Button>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        {isOff ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/10 mx-4 mb-4">
            <Clock className="h-8 w-8 mb-2 opacity-30" />
            <p>برای این روز ساعت کاری تعریف نشده است.</p>
            <Button
              type="button"
              variant="link"
              className="mt-1 h-auto p-0 text-primary"
              onClick={() =>
                append({ startTime: '', endTime: '', slotDuration: '' })
              }
            >
              افزودن اولین بازه کاری
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((rowField, idx) => {
              const idBase = `ws-d${dayOfWeek}-b${idx}`
              return (
                <FieldGroup
                  key={rowField.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-muted/20 p-3 rounded-lg border border-border/50 transition-colors hover:bg-muted/40"
                >
                  <Controller
                    control={control}
                    name={`days.${dayOfWeek}.blocks.${idx}.startTime`}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="col-span-1 sm:col-span-4"
                      >
                        <FieldLabel
                          htmlFor={`${idBase}-start`}
                          className="text-xs flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" /> شروع
                        </FieldLabel>
                        <Input
                          {...field}
                          id={`${idBase}-start`}
                          dir="ltr"
                          type="time"
                          step={300}
                          className="font-mono text-sm"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    control={control}
                    name={`days.${dayOfWeek}.blocks.${idx}.endTime`}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="col-span-1 sm:col-span-4"
                      >
                        <FieldLabel
                          htmlFor={`${idBase}-end`}
                          className="text-xs flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" /> پایان
                        </FieldLabel>
                        <Input
                          {...field}
                          id={`${idBase}-end`}
                          dir="ltr"
                          type="time"
                          step={300}
                          className="font-mono text-sm"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    control={control}
                    name={`days.${dayOfWeek}.blocks.${idx}.slotDuration`}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="col-span-1 sm:col-span-3"
                      >
                        <FieldLabel
                          htmlFor={`${idBase}-dur`}
                          className="text-xs"
                        >
                          مدت هر نوبت
                        </FieldLabel>
                        <Select
                          dir="rtl"
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id={`${idBase}-dur`}
                            aria-invalid={fieldState.invalid}
                            className="text-sm"
                          >
                            <SelectValue
                              placeholder={
                                defaultSlotDuration
                                  ? `پیش‌فرض (${defaultSlotDuration} دقیقه)`
                                  : 'انتخاب کنید'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {SLOT_DURATIONS.map((m) => (
                              <SelectItem key={m} value={String(m)}>
                                {m} دقیقه
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
                  <div className="col-span-1 sm:col-span-1 flex justify-end sm:justify-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-9 w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 sm:w-9"
                      onClick={() => remove(idx)}
                      title="حذف این بازه"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:mr-2 text-xs">
                        حذف
                      </span>
                    </Button>
                  </div>
                </FieldGroup>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WeeklyScheduleForm
