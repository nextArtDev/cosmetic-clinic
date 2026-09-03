'use server'

import { revalidatePath } from 'next/cache'
import ZarinPalCheckout from 'zarinpal-checkout'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import { AppointmentStatus } from '@/lib/generated/prisma'
import { smsBookingConfirmed } from './sms'
import { toClinicHHMM, getAppTimeZone } from '@/lib/scheduling/tz'

// ---------------------------------------------------------------------------
// Zarinpal payment flow for clinic-404.
//
// createBooking() inserts an Appointment as PAYMENT_PENDING (with a
// reservationExpiresAt hold) and redirects to /payment/:appointmentId. On that
// page we lazily create the Order row (amount = doctor consult fee) and start a
// Zarinpal session. The gateway redirects back to /api/payment/callback, which
// verifies (under a distributed lock + replay protection) and — on success —
// flips the Order to Paid, attaches PaymentDetails, marks the Appointment
// BOOKING_CONFIRMED and sends the confirmation SMS.
// ---------------------------------------------------------------------------

const PAYMENT_STATUS = {
  SUCCESS: 100,
  OK: 'OK',
} as const

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'شما اجازه دسترسی ندارید!',
  ORDER_NOT_FOUND: 'سفارش در دسترس نیست!',
  INVALID_PAYMENT_RESPONSE: 'پاسخ درگاه پرداخت معتبر نیست!',
  PAYMENT_FAILED: 'پرداخت با خطا مواجه شده است!',
  PAYMENT_CANCELLED: 'پرداخت توسط شما لغو شد.',
  PAYMENT_VERIFY_FAILED: 'پرداخت تایید نشد.',
  GENERIC_ERROR: 'مشکلی پیش آمده، لطفا دوباره امتحان کنید!',
} as const

const createZarinpalInstance = () => {
  const apiKey = process.env.ZARINPAL_KEY
  if (!apiKey) {
    throw new Error('ZARINPAL_KEY environment variable is not set')
  }
  return ZarinPalCheckout.create(apiKey, process.env.NODE_ENV !== 'production')
}

const callbackURL = (
  appointmentId: string,
  orderId: string,
  flow?: 'home' | 'v1',
) => {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const params = new URLSearchParams({ appointmentId, orderId })
  if (flow === 'home') params.set('flow', 'home')
  return `${base}/api/payment/callback?${params.toString()}`
}

export interface PaymentRequestResult {
  status: number
  authority: string
  url: string
}

export interface PaymentFormState {
  errors?: { _form?: string[] }
  payment?: PaymentRequestResult
}

/** Lazily create the Order for an appointment (idempotent). */
async function getOrCreateOrder(
  appointmentId: string,
  tx: typeof prisma,
): Promise<{ orderId: string; amount: number }> {
  const existing = await tx.order.findFirst({
    where: { appointmentId, paymentStatus: { not: 'Paid' } },
    select: { id: true, amount: true },
  })
  if (existing) return { orderId: existing.id, amount: existing.amount }

  const appointment = await tx.appointment.findUnique({
    where: { appointmentId },
    include: { doctor: { include: { doctorProfile: true } } },
  })
  if (!appointment?.doctor) {
    throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND)
  }
  const fee = appointment.doctor.doctorProfile?.consultFee ?? 0
  const order = await tx.order.create({
    data: {
      appointmentId,
      doctorId: appointment.doctorId,
      amount: fee,
      currency: 'IRR',
      paymentStatus: 'Pending',
    },
    select: { id: true, amount: true },
  })
  return { orderId: order.id, amount: order.amount }
}

export async function zarinpalPayment(
  appointmentId: string,
  flow?: 'home' | 'v1',
): Promise<PaymentFormState> {
  const user = await getCurrentUser()
  if (!user?.id) {
    return { errors: { _form: [ERROR_MESSAGES.UNAUTHORIZED] } }
  }

  try {
    await checkRateLimit(user.id)

    const { orderId, amount } = await getOrCreateOrder(appointmentId, prisma)

    const zarinpal = createZarinpalInstance()
    const payment = (await zarinpal.PaymentRequest({
      Amount: Math.round(amount),
      CallbackURL: callbackURL(appointmentId, orderId, flow),
      Description: `نوبت کلینیک دکتر نگین فضلی — ${appointmentId}`,
      Mobile: user.phoneNumber ?? undefined,
    })) as PaymentRequestResult

    if (payment?.status !== PAYMENT_STATUS.SUCCESS) {
      return { errors: { _form: [ERROR_MESSAGES.PAYMENT_FAILED] } }
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { authority: payment.authority },
      }),
      prisma.paymentDetails.upsert({
        where: { orderId },
        update: {
          status: payment.status.toString(),
          Authority: payment.authority,
        },
        create: {
          orderId,
          userId: user.id,
          status: payment.status.toString(),
          Authority: payment.authority,
        },
      }),
    ])

    return { payment }
  } catch (error) {
    console.error('Payment request error:', error)
    return {
      errors: {
        _form: [
          error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC_ERROR,
        ],
      },
    }
  }
}

export interface PaymentApprovalResult {
  success?: boolean
  alreadyPaid?: boolean
  errors?: { _form?: string[] }
}

export async function zarinpalPaymentApproval({
  appointmentId,
  orderId,
  Authority,
  Status,
}: {
  appointmentId: string
  orderId: string
  Authority: string
  Status: string
}): Promise<PaymentApprovalResult> {
  await cleanupExpiredLocks()
  const lockAcquired = await acquirePaymentLock(orderId, Authority)
  if (!lockAcquired) {
    return { errors: { _form: ['پردازش پرداخت در حال انجام است.'] } }
  }

  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return { errors: { _form: [ERROR_MESSAGES.UNAUTHORIZED] } }
    }
    await checkRateLimit(user.id)

    const order = await prisma.order.findFirst({
      where: { id: orderId, appointmentId },
    })
    if (!order) {
      return { errors: { _form: [ERROR_MESSAGES.ORDER_NOT_FOUND] } }
    }
    if (order.paymentStatus === 'Paid') {
      return { success: true, alreadyPaid: true }
    }

    const attemptOk = await validatePaymentAttempt(
      orderId,
      Authority,
      order.amount,
    )
    if (!attemptOk) {
      return { errors: { _form: ['درخواست پرداخت نامعتبر است.'] } }
    }

    if (Status === 'OK' && Authority) {
      const zarinpal = createZarinpalInstance()
      const verification = (await zarinpal.PaymentVerification({
        Amount: Math.round(order.amount),
        Authority,
      })) as { status: number; refId: number }

      if (verification.status === 100) {
        await updateOrderToPaid({
          orderId,
          appointmentId,
          paymentResult: {
            id: verification.refId.toString(),
            status: 'OK',
            authority: Authority,
            fee: order.amount.toString(),
          },
        })
        return { success: true }
      }

      await prisma.paymentAttempt.update({
        where: { orderId_authority: { orderId, authority: Authority } },
        data: { status: 'FAILED' },
      })
      return { errors: { _form: [ERROR_MESSAGES.PAYMENT_VERIFY_FAILED] } }
    }

    return { errors: { _form: [ERROR_MESSAGES.PAYMENT_CANCELLED] } }
  } catch (error) {
    console.error('Payment approval error:', error)
    return { errors: { _form: [ERROR_MESSAGES.GENERIC_ERROR] } }
  } finally {
    await releasePaymentLock(orderId)
    revalidatePath(`/v1/appointments/${appointmentId}`)
    revalidatePath(`/appointments/${appointmentId}`)
  }
}

/**
 * No-webhook reconciliation: if a user paid at Zarinpal but never returned to
 * our callback (closed the tab, lost the redirect), a Pending order that already
 * holds an `authority` can be healed by verifying server-side and marking Paid.
 * Returns true when the order transitioned to Paid. Idempotent and lock-guarded,
 * so it can race the callback safely. Call it when loading a Pending order that
 * has an authority, and/or from a cron sweeping all pending orders.
 */
export async function reconcilePendingZarinpalPayment(
  appointmentId: string,
): Promise<{ reconciled: boolean }> {
  const order = await prisma.order.findFirst({
    where: { appointmentId, paymentStatus: { not: 'Paid' } },
    include: { paymentDetails: true },
  })
  if (!order || order.paymentStatus === 'Paid') return { reconciled: false }
  const authority = order.paymentDetails?.Authority
  if (!authority) return { reconciled: false }

  await cleanupExpiredLocks()
  if (!(await acquirePaymentLock(order.id, authority))) {
    return { reconciled: false }
  }

  try {
    // Re-check under the lock (a callback may have won the race).
    const fresh = await prisma.order.findFirst({ where: { id: order.id } })
    if (!fresh || fresh.paymentStatus === 'Paid') return { reconciled: false }

    const attemptOk = await validatePaymentAttempt(
      order.id,
      authority,
      order.amount,
    )
    if (!attemptOk) return { reconciled: false }

    const zarinpal = createZarinpalInstance()
    const verification = (await zarinpal.PaymentVerification({
      Amount: Math.round(order.amount),
      Authority: authority,
    })) as { status: number; refId: number }

    // 100 = verified now; 101 = already verified earlier (idempotent).
    if (verification.status !== 100 && verification.status !== 101) {
      return { reconciled: false }
    }

    await updateOrderToPaid({
      orderId: order.id,
      appointmentId,
      paymentResult: {
        id: verification.refId.toString(),
        status: 'OK',
        authority,
        fee: order.amount.toString(),
      },
    })
    return { reconciled: true }
  } catch (error) {
    console.error('Payment reconciliation error:', error)
    return { reconciled: false }
  } finally {
    await releasePaymentLock(order.id)
  }
}

async function updateOrderToPaid({
  orderId,
  appointmentId,
  paymentResult,
}: {
  orderId: string
  appointmentId: string
  paymentResult: { id: string; status: string; authority: string; fee: string }
}) {
  const settings = await prisma.appSettings.findUnique({
    where: { id: 'global' },
  })
  const tz = settings?.timezone ?? getAppTimeZone()

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId },
      include: { appointment: { select: { userId: true } } },
    })
    if (!order) throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND)
    if (order.paymentStatus === 'Paid') return

    await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'Paid', paidAt: new Date() },
    })
    await tx.paymentDetails.upsert({
      where: { orderId },
      update: {
        status: paymentResult.status,
        Authority: paymentResult.authority,
        amount: Number(paymentResult.fee),
        transactionId: paymentResult.id,
      },
      create: {
        orderId,
        userId: order.appointment?.userId ?? '',
        status: paymentResult.status,
        Authority: paymentResult.authority,
        amount: Number(paymentResult.fee),
        transactionId: paymentResult.id,
      },
    })

    const appointment = await tx.appointment.update({
      where: { appointmentId },
      data: {
        paymentResult: {
          id: paymentResult.id,
          status: paymentResult.status,
          authority: paymentResult.authority,
        },
        paidAt: new Date(),
        status: AppointmentStatus.BOOKING_CONFIRMED,
        reservationExpiresAt: null,
      },
      include: {
        doctor: { select: { name: true } },
        user: { select: { name: true, phoneNumber: true } },
      },
    })

    // SMS only fires after the money actually clears.
    const phone = appointment.phoneNumber ?? appointment.user?.phoneNumber
    if (phone) {
      await smsBookingConfirmed({
        phoneNumber: phone,
        patientName: appointment.user?.name ?? appointment.patientName,
        doctorName: appointment.doctor.name,
        dateLabel: appointment.appointmentStartUTC.toISOString().slice(0, 10),
        timeLabel: toClinicHHMM(appointment.appointmentStartUTC, tz),
      })
    }
  })
}

// ---- Distributed lock / replay protection (kept from medical) ----

async function acquirePaymentLock(orderId: string, authority: string) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
  try {
    await prisma.paymentLock.create({ data: { orderId, authority, expiresAt } })
    return true
  } catch {
    return false
  }
}

async function releasePaymentLock(orderId: string) {
  try {
    await prisma.paymentLock.delete({ where: { orderId } })
  } catch {
    /* noop */
  }
}

async function cleanupExpiredLocks() {
  await prisma.paymentLock.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
}

async function validatePaymentAttempt(
  orderId: string,
  authority: string,
  amount: number,
) {
  const existing = await prisma.paymentAttempt.findUnique({
    where: { orderId_authority: { orderId, authority } },
  })
  if (existing) {
    if (existing.status === 'SUCCESS' || existing.status === 'USED')
      return false
    await prisma.paymentAttempt.update({
      where: { id: existing.id },
      data: { status: 'PENDING', amount },
    })
  } else {
    await prisma.paymentAttempt.create({
      data: { orderId, authority, amount, status: 'PENDING' },
    })
  }
  return true
}

export async function checkRateLimit(userId: string) {
  const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60)
  const count = await prisma.paymentRateLimit.count({
    where: { userId, createdAt: { gte: oneHourAgo } },
  })
  if (count >= 100) {
    throw new Error(
      'تعداد درخواست‌ها بیش از حد مجاز است، لطفا دوباره تلاش کنید.',
    )
  }
  await prisma.paymentRateLimit.create({ data: { userId } })
}
