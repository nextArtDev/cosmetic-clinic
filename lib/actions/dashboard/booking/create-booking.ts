// lib/actions/booking/create-booking.ts
// Refactor of the old `createBooking`. Everything you had is preserved,
// plus the holes are closed:
//
//   OLD                                      NEW
//   ─────────────────────────────────────    ─────────────────────────────────────
//   zod on dob/time                          zod on the whole payload (+ patient info)
//   currentUser() guard                      same (better-auth session)
//   doctor exists check                      doctor + profile.isActive check
//   findFirst availability→timeSlot          isSlotAvailable() — full engine pass:
//                                            working day, closure, leave, override,
//                                            lead time, advance window, taken slots
//   isBookedBefore findFirst  ⚠ race         partial UNIQUE index → P2002 catch.
//   (also only blocked the SAME user         Two users clicking the same slot at the
//    rebooking; another user could           same millisecond: exactly one wins.
//    double-book the slot)
//   bookedDay.create                         appointment.create — PAYMENT_PENDING
//                                            with reservationExpiresAt hold, or CASH
//   SMS then redirect                        SMS only for CASH (online-paid bookings
//                                            get SMS after payment verification)
//   redirect('/user')                        redirect: payment gateway or /user

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { addMinutes } from 'date-fns'
import { z } from 'zod'
import prisma from '@/lib/prisma'
// import { currentUser } from '@/lib/auth'
// import { isSlotAvailable } from '@/lib/scheduling/get-available-slots'
import { toClinicHHMM } from '@/lib/scheduling/tz'
import { smsBookingConfirmed } from '../../sms'
import { isSlotAvailable } from '@/lib/scheduling/get-available-slots'
import { currentUser } from '@/lib/auth'

const createBookingSchema = z.object({
  doctorId: z.string().min(1),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ نامعتبر است'),
  // The exact UTC instant of the chosen slot, as returned by getAvailableSlots.
  // Sending the instant (not "HH:MM") means no re-parsing and no tz drift.
  slotStartUTC: z.coerce.date(),
  patientType: z.enum(['MYSELF', 'SOMEONE_ELSE']),
  patientName: z.string().min(2, 'نام بیمار را وارد کنید'),
  patientRelation: z.string().optional(),
  patientDateOfBirth: z.coerce.date().optional(),
  phoneNumber: z.string().optional(),
  reasonForVisit: z.string().max(2000).optional(),
  additionalNotes: z.string().max(2000).optional(),
  paymentMethod: z.enum(['ONLINE', 'CASH']).default('ONLINE'),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

/**
 * Which frontend surface initiated the booking. Determines where the user is
 * sent afterwards: the home flow uses root-level routes (/payment/...,
 * /appointments/...), the v1 flow keeps /v1-prefixed ones.
 */
export type BookingFlow = 'home' | 'v1'

interface CreateBookingFormState {
  errors: {
    dateISO?: string[]
    slotStartUTC?: string[]
    patientName?: string[]
    _form?: string[]
  }
}

export async function createBooking(
  input: CreateBookingInput,
  path: string,
  flow: BookingFlow = 'v1',
): Promise<CreateBookingFormState> {
  // 1) Auth — patients must be logged in (same rule as before)
  const user = await currentUser()
  if (!user?.id) {
    return {
      errors: {
        _form: ['شمااجازه دسترسی ندارید، به حساب کاربری خود وارد شوید.'],
      },
    }
  }

  // 2) Validate payload
  const parsed = createBookingSchema.safeParse(input)
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten()
        .fieldErrors as CreateBookingFormState['errors'],
    }
  }
  const data = parsed.data

  let redirectTo: string
  try {
    // 3) Doctor must exist and be active
    const [settings, doctorUser, profile] = await Promise.all([
      prisma.appSettings.findUniqueOrThrow({ where: { id: 'global' } }),
      prisma.user.findUnique({
        where: { id: data.doctorId },
        select: { id: true, name: true },
      }),
      prisma.doctorProfile.findUnique({ where: { userId: data.doctorId } }),
    ])
    if (!doctorUser || !profile?.isActive) {
      return { errors: { _form: ['این نوبت در دسترس نیست!'] } }
    }

    // 4) Business-rule check via the slot engine (replaces the old
    //    availability→timeSlot→isBookedBefore chain in one call)
    //    Pass the current user so they can complete their own PAYMENT_PENDING hold.
    const available = await isSlotAvailable(
      data.doctorId,
      data.dateISO,
      data.slotStartUTC,
      user.id,
    )
    if (!available) {
      return { errors: { _form: ['این نوبت قبلا رزرو شده است!'] } }
    }

    const duration = profile.slotDurationMinutes ?? settings.defaultSlotDuration
    const isCash = data.paymentMethod === 'CASH'

    // 5) Insert. The partial unique index
    //    (doctorId, appointmentStartUTC) WHERE status NOT IN ('CANCELLED','NO_SHOW')
    //    is the race referee — a concurrent duplicate throws P2002.
    //    Expired PAYMENT_PENDING holds on this slot are cancelled first so
    //    they don't collide with the index.
    const appointment = await prisma.$transaction(async (tx) => {
      await tx.appointment.updateMany({
        where: {
          doctorId: data.doctorId,
          appointmentStartUTC: data.slotStartUTC,
          status: 'PAYMENT_PENDING',
          reservationExpiresAt: { lt: new Date() },
        },
        data: { status: 'CANCELLED' },
      })

      return tx.appointment.create({
        data: {
          doctorId: data.doctorId,
          userId: user.id,
          patientType: data.patientType,
          patientName: data.patientName,
          patientRelation: data.patientRelation,
          patientDateOfBirth: data.patientDateOfBirth,
          phoneNumber: data.phoneNumber ?? user.phoneNumber,
          reasonForVisit: data.reasonForVisit,
          additionalNotes: data.additionalNotes,
          appointmentStartUTC: data.slotStartUTC,
          appointmentEndUTC: addMinutes(data.slotStartUTC, duration),
          paymentMethod: data.paymentMethod,
          status: isCash ? 'CASH' : 'PAYMENT_PENDING',
          reservationExpiresAt: isCash
            ? null
            : addMinutes(new Date(), settings.slotReservationDuration),
        },
      })
    })

    // 6) SMS — cash bookings are confirmed immediately. Online bookings get
    //    their SMS from the payment-verification action, never here (a hold
    //    is not a booking). Fire AFTER the DB write; failure never throws.
    if (isCash && user.phoneNumber && user.name) {
      await smsBookingConfirmed({
        phoneNumber: user.phoneNumber,
        patientName: user.name,
        doctorName: doctorUser.name,
        dateLabel: data.dateISO,
        timeLabel: toClinicHHMM(data.slotStartUTC, settings.timezone),
      })
    }

    const base = flow === 'home' ? '' : '/v1'
    redirectTo = isCash
      ? `${base}/appointments/${appointment.appointmentId}?status=cash`
      : `${base}/payment/${appointment.appointmentId}`
  } catch (err: unknown) {
    // Race lost: someone booked this exact slot between check and insert
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === 'P2002'
    ) {
      return {
        errors: {
          _form: [
            'این نوبت همین الان توسط شخص دیگری رزرو شد، لطفاً زمان دیگری انتخاب کنید.',
          ],
        },
      }
    }
    if (err instanceof Error) return { errors: { _form: [err.message] } }
    return { errors: { _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'] } }
  }

  revalidatePath(path)
  redirect(redirectTo) // NEVER inside try/catch — redirect() throws by design
}
