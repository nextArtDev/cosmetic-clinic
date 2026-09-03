/// lib/actions/booking/cancel-booking.ts
// Cancellation as a first-class action (the old project only cancelled
// implicitly inside disableSpecialDay). Two entry points, one core:
//
//   cancelBookingByPatient — owner cancels their own appointment
//   cancelBookingByAdmin   — admin cancels any appointment, with reason
//
// Standards carried over from disableSpecialDay:
//   auth guard → validation → cancel in transaction → flag paid orders for
//   refund → SMS AFTER commit (never blocks the DB work) → revalidate.

'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { currentUser } from '@/lib/auth'
import { toClinicDateISO, toClinicHHMM } from '@/lib/scheduling/tz'
import {
  smsAppointmentCancelledByClinic,
  smsBookingCancelledByPatient,
} from '../../sms'

const CANCELLABLE = ['PAYMENT_PENDING', 'BOOKING_CONFIRMED', 'CASH'] as const

interface CancelResult {
  success?: string
  errors?: { _form?: string[] }
}

async function cancelCore(opts: {
  appointmentId: string
  byAdmin: boolean
  reason?: string
}): Promise<CancelResult> {
  const appointment = await prisma.appointment.findUnique({
    where: { appointmentId: opts.appointmentId },
    include: {
      user: { select: { id: true, name: true, phoneNumber: true } },
      doctor: { select: { name: true } },
      Order: { where: { paymentStatus: 'Paid' }, select: { id: true } },
    },
  })
  if (!appointment) return { errors: { _form: ['نوبت یافت نشد!'] } }
  if (
    !CANCELLABLE.includes(appointment.status as (typeof CANCELLABLE)[number])
  ) {
    return { errors: { _form: ['این نوبت قابل لغو نیست!'] } }
  }
  if (!opts.byAdmin && appointment.appointmentStartUTC < new Date()) {
    return { errors: { _form: ['نوبت‌های گذشته قابل لغو نیستند!'] } }
  }

  const wasPaid = appointment.Order.length > 0

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { appointmentId: appointment.appointmentId },
      data: { status: 'CANCELLED' }, // frees the slot (partial unique index)
    })
    if (wasPaid) {
      // Flag for refund; actual gateway refund runs in your payment flow
      await tx.order.updateMany({
        where: {
          appointmentId: appointment.appointmentId,
          paymentStatus: 'Paid',
        },
        data: { paymentStatus: 'Refunded', notes: opts.reason ?? 'لغو نوبت' },
      })
    }
  })

  // SMS after commit — failure logged inside sms.ts, never thrown
  const phone = appointment.phoneNumber ?? appointment.user?.phoneNumber
  if (phone) {
    const settings = await prisma.appSettings.findUniqueOrThrow({
      where: { id: 'global' },
    })
    const common = {
      phoneNumber: phone,
      patientName: appointment.patientName,
      doctorName: appointment.doctor.name,
      dateLabel: toClinicDateISO(
        appointment.appointmentStartUTC,
        settings.timezone,
      ),
      timeLabel: toClinicHHMM(
        appointment.appointmentStartUTC,
        settings.timezone,
      ),
      wasPaid,
    }
    if (opts.byAdmin) {
      await smsAppointmentCancelledByClinic({ ...common, reason: opts.reason })
    } else {
      await smsBookingCancelledByPatient(common)
    }
  }

  revalidatePath('/dashboard/booking')
  revalidatePath('/user')
  return { success: 'نوبت با موفقیت لغو شد.' }
}

export async function cancelBookingByPatient(
  appointmentId: string,
): Promise<CancelResult> {
  const user = await currentUser()
  if (!user?.id)
    return { errors: { _form: ['ابتدا وارد حساب کاربری خود شوید.'] } }

  const owns = await prisma.appointment.findFirst({
    where: { appointmentId, userId: user.id },
    select: { appointmentId: true },
  })
  if (!owns) return { errors: { _form: ['شمااجازه دسترسی ندارید!'] } }

  return cancelCore({ appointmentId, byAdmin: false })
}

export async function cancelBookingByAdmin(
  appointmentId: string,
  reason?: string,
): Promise<CancelResult> {
  const user = await currentUser()
  if (!user?.id || user.role !== 'admin') {
    return { errors: { _form: ['شمااجازه دسترسی ندارید!'] } }
  }
  return cancelCore({ appointmentId, byAdmin: true, reason })
}
