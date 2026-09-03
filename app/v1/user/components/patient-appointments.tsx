'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CalendarCheck, CalendarX2, Inbox, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { cancelBookingByPatient } from '@/lib/actions/dashboard/booking/cancel-booking'

export type AppointmentDTO = {
  appointmentId: string
  doctorName: string
  weekday: string
  dateLabel: string
  timeLabel: string
  patientName: string
  status: string
  statusLabel: string
  paid: boolean
  cancellable: boolean
}

const STATUS_STYLE: Record<string, string> = {
  PAYMENT_PENDING: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  BOOKING_CONFIRMED: 'border-sage/40 bg-sage/10 text-sage-mist',
  COMPLETED: 'border-sage/40 bg-sage/10 text-sage-mist',
  CANCELLED: 'border-glass-border bg-muted/30 text-ivory-dim',
  NO_SHOW: 'border-glass-border bg-muted/30 text-ivory-dim',
  CASH: 'border-gold/40 bg-gold/10 text-gold-soft',
}

function Row({
  a,
  onCancel,
}: {
  a: AppointmentDTO
  onCancel: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-glass-border p-5 transition-colors hover:border-gold/30 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sage-bright/30 to-sage/10 text-sage-mist">
          <CalendarCheck size={18} />
        </span>
        <div>
          <p className="text-sm font-medium text-ivory">{a.doctorName}</p>
          <p className="mt-1 text-xs text-ivory-dim">
            {a.weekday} {a.dateLabel}، ساعت {a.timeLabel}
          </p>
          <p className="mt-0.5 text-xs text-ivory-dim/70">
            بیمار: {a.patientName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs',
            STATUS_STYLE[a.status] ?? STATUS_STYLE.CANCELLED,
          )}
        >
          {a.paid && <Lock size={11} />}
          {a.statusLabel}
        </span>
        {a.cancellable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(a.appointmentId)}
            className="gap-1.5 text-red-300 hover:bg-red-500/10 hover:text-red-200"
          >
            <CalendarX2 size={14} /> لغو نوبت
          </Button>
        )}
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-glass-border p-8 text-center text-sm text-ivory-dim">
      <Inbox size={18} className="mx-auto mb-2 opacity-60" />
      {text}
    </div>
  )
}

export function PatientAppointments({
  upcoming,
  history,
}: {
  upcoming: AppointmentDTO[]
  history: AppointmentDTO[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleCancel(appointmentId: string) {
    startTransition(async () => {
      const res = await cancelBookingByPatient(appointmentId)
      if (res.errors?._form?.[0]) {
        toast.error(res.errors._form[0])
        return
      }
      toast.success(res.success ?? 'نوبت لغو شد.')
      router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-xl text-ivory">نوبت‌های در انتظار</h2>
        <p className="mt-1 text-sm text-ivory-dim">
          نوبت‌های آینده یا در انتظار پرداخت شما.
        </p>
        <div className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <Empty text="نوبت فعالی ندارید." />
          ) : (
            upcoming.map((a) => (
              <Row key={a.appointmentId} a={a} onCancel={handleCancel} />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl text-ivory">تاریخچهٔ نوبت‌ها</h2>
        <p className="mt-1 text-sm text-ivory-dim">
          نوبت‌های انجام‌شده یا لغو شدهٔ قبلی شما.
        </p>
        <div className="mt-4 space-y-3">
          {history.length === 0 ? (
            <Empty text="هنوز سابقه‌ای ثبت نشده است." />
          ) : (
            history.map((a) => (
              <Row key={a.appointmentId} a={a} onCancel={handleCancel} />
            ))
          )}
        </div>
      </section>

      {pending && (
        <p className="flex items-center gap-2 text-xs text-ivory-dim">
          <Loader2 size={14} className="animate-spin" /> در حال لغو نوبت...
        </p>
      )}
    </div>
  )
}
