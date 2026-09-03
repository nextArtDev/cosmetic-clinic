import 'server-only'

interface SmsResult {
  ok: boolean
  error?: string
}

async function sendSms(
  phoneNumber: string,
  message: string,
): Promise<SmsResult> {
  try {
    // TODO: replace with your existing provider call, e.g.:
    // await kavenegar.Send({ receptor: phoneNumber, message })
    if (!phoneNumber) return { ok: false, error: 'NO_PHONE' }
    // ...provider call...
    return { ok: true }
  } catch (e) {
    // NEVER throw from SMS — notification failure must not roll back
    // a cancellation that already happened in the DB.
    console.error('[sms] send failed', { phoneNumber, error: e })
    return { ok: false, error: e instanceof Error ? e.message : 'UNKNOWN' }
  }
}

// ---- Templates (adjust wording / add Persian text as in your old project) ----

export function smsAppointmentCancelledByClinic(p: {
  phoneNumber: string
  patientName: string
  doctorName: string
  dateLabel: string // clinic-local, e.g. "2026-07-10"
  timeLabel: string // clinic-local, e.g. "16:30"
  reason?: string | null
  wasPaid: boolean
}) {
  const refundLine = p.wasPaid
    ? ' مبلغ پرداختی شما طی ۷۲ ساعت آینده عودت داده می‌شود.'
    : ''
  return sendSms(
    p.phoneNumber,
    `${p.patientName} عزیز، نوبت شما نزد ${p.doctorName} در تاریخ ${p.dateLabel} ساعت ${p.timeLabel} به دلیل ${p.reason ?? 'تغییر برنامه کلینیک'} لغو شد.${refundLine} برای رزرو مجدد به سایت مراجعه کنید.`,
  )
}

export function smsBookingConfirmed(p: {
  phoneNumber: string
  patientName: string
  doctorName: string
  dateLabel: string // clinic-local "2026-07-10"
  timeLabel: string // clinic-local "16:30"
}) {
  return sendSms(
    p.phoneNumber,
    `${p.patientName} عزیز، نوبت شما نزد ${p.doctorName} برای تاریخ ${p.dateLabel} ساعت ${p.timeLabel} با موفقیت ثبت شد. لطفاً ۱۵ دقیقه قبل از نوبت در کلینیک حضور داشته باشید.`,
  )
}

export function smsBookingCancelledByPatient(p: {
  phoneNumber: string
  patientName: string
  doctorName: string
  dateLabel: string
  timeLabel: string
  wasPaid: boolean
}) {
  const refundLine = p.wasPaid
    ? ' مبلغ پرداختی طبق قوانین کلینیک عودت داده می‌شود.'
    : ''
  return sendSms(
    p.phoneNumber,
    `${p.patientName} عزیز، نوبت شما نزد ${p.doctorName} در تاریخ ${p.dateLabel} ساعت ${p.timeLabel} لغو شد.${refundLine}`,
  )
}

export function smsScheduleChangedNeedsRebook(p: {
  phoneNumber: string
  patientName: string
  doctorName: string
  dateLabel: string
  timeLabel: string
}) {
  return sendSms(
    p.phoneNumber,
    `${p.patientName} عزیز، به دلیل تغییر برنامه ${p.doctorName}، نوبت ${p.dateLabel} ساعت ${p.timeLabel} شما نیاز به جابجایی دارد. لطفاً با کلینیک تماس بگیرید یا از سایت زمان جدید انتخاب کنید.`,
  )
}
