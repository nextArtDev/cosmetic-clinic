/**
 * Seed — single plastic-surgery doctor ("دکتر شبنمنفضلی").
 *
 * Seeds everything the scheduling engine (`lib/scheduling/get-available-slots.ts`)
 * and the public site need:
 *   - AppSettings + WorkingDay (booking policy & open days)
 *   - Doctor user (role admin → dashboard access) + DoctorProfile
 *   - Specializations / Illnesses catalog + joins
 *   - Weekly DoctorScheduleBlock rows (slots are computed at read time)
 *   - A few past + upcoming appointments (visits), Orders and a treatment TimeLine
 *   - Approved reviews
 *   - FAQs shown on the public /faq page
 *
 * Run with:  bun run db:seed   (or: bun --bun run prisma db seed)
 */
import 'dotenv/config'
import { randomUUID } from 'crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma'
import { clinicTimeToUTC } from '../lib/scheduling/tz'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const TZ = process.env.APP_TIMEZONE || 'Asia/Tehran'
const SLOT_MIN = 30
const FEE = 500000 // Toman

// ---- Stable ids (rerunning the seed stays idempotent) ---------------------
const DOCTOR_ID = 'usr_dr_fazeli'
const DOCTOR_SLUG = 'dr-sharam-fazeli'
const PATIENT_ID = 'usr_patient_ali'
const PATIENT_MARYAM = 'usr_patient_maryam'
const PATIENT_REZA = 'usr_patient_reza'

// Extra mock reviewers so the public testimonials carousel has enough cards.
const EXTRA_REVIEWERS = [
  {
    id: 'usr_patient_sara',
    name: 'سارا احمدی',
    email: 'sara.ahmadi@example.com',
    phone: '+989120000005',
  },
  {
    id: 'usr_patient_nima',
    name: 'نیما قاسمی',
    email: 'nima.ghasemi@example.com',
    phone: '+989120000006',
  },
  {
    id: 'usr_patient_shirin',
    name: 'شیرین مرادی',
    email: 'shirin.moradi@example.com',
    phone: '+989120000007',
  },
  {
    id: 'usr_patient_farhad',
    name: 'فرهاد کاظمی',
    email: 'farhad.kazemi@example.com',
    phone: '+989120000008',
  },
  {
    id: 'usr_patient_elham',
    name: 'الهام نوری',
    email: 'elham.nouri@example.com',
    phone: '+989120000009',
  },
] as const

/** days ago the review was written — drives Persian relative date labels */
const MOCK_REVIEWS: Array<{
  authorId: string
  rating: number
  title: string
  comment: string
  daysAgo: number
  isFeatured?: boolean
}> = [
  {
    authorId: PATIENT_ID,
    rating: 5,
    title: 'رینوپلاستی',
    comment:
      'دکتر  فضلی قبل از عمل همه مراحل را با دقت توضیح دادند و نتیجه عمل بینی دقیقاً همان چیزی شد که انتظار داشتم. پیگیری بعد از عمل هم عالی بود.',
    daysAgo: 2,
    isFeatured: true,
  },
  {
    authorId: PATIENT_MARYAM,
    rating: 5,
    title: 'تزریق بوتاکس و ژل',
    comment:
      'جلسه تزریق بوتاکس و ژل بسیار راحت بود و نتیجه طبیعی شد. محیط کلینیک تمیز و تیم ایشان خوش‌برخورد است.',
    daysAgo: 5,
  },
  {
    authorId: PATIENT_REZA,
    rating: 4,
    title: 'رزرو آنلاین',
    comment:
      'نوبت‌گیری آنلاین خیلی راحت بود و دقیقاً در ساعت مقرر پذیرش شدم. فقط کمی برای هماهنگی عمل منتظر بودم.',
    daysAgo: 12,
  },
  {
    authorId: 'usr_patient_sara',
    rating: 5,
    title: 'فیس‌لیفت',
    comment:
      'از اولین مشاوره تا دوران نقاهت، هر مرحله با حرفه‌ای‌گری و مراقبت صمیمانه همراه بود. نتیجه لیفت صورتم به‌زیبایی ظریف و طبیعی است.',
    daysAgo: 3,
    isFeatured: true,
  },
  {
    authorId: 'usr_patient_nima',
    rating: 5,
    title: 'لیپوساکشن',
    comment:
      'بعد از سال‌ها دست‌وپنجه نرم کردن با چربی موضعی، بالاخره نتیجه‌ای گرفتن که واقعاً می‌شد دید. خط فکم دوباره کش آمده است.',
    daysAgo: 9,
  },
  {
    authorId: 'usr_patient_shirin',
    rating: 5,
    title: 'بلفاروپلاستی',
    comment:
      'از جراحی پلک می‌ترسیدم، اما دکتر  فضلی باعث شد احساس امنیت کنم. نتیجه ده سال از چهره‌ام کم کرد، در حالی که کاملاً خودم باقی ماندم.',
    daysAgo: 16,
    isFeatured: true,
  },
  {
    authorId: 'usr_patient_farhad',
    rating: 4,
    title: 'ابدومینوپلاستی',
    comment:
      'جراحی شکم دقیق و بدون عجله انجام شد. جای بخیه تقریباً نامرئی است و تیم پیگیری بعد از عمل هر هفته حال من را می‌پرسیدند.',
    daysAgo: 25,
  },
  {
    authorId: 'usr_patient_elham',
    rating: 5,
    title: 'لیفت ابرو',
    comment:
      'لیفت ابرو ظریف اما متحول‌کننده بود. احساس می‌کنم استراحت‌کرده و شاداب هستم؛ تنها پشیمانی‌ام این است که زودتر انجامش ندادم.',
    daysAgo: 41,
  },
]

/** Clinic-local "YYYY-MM-DD" + "HH:MM" -> exact UTC instant. */
function slotStart(dateISO: string, hhmm: string): Date {
  return clinicTimeToUTC(dateISO, hhmm, TZ)
}
function slotEnd(start: Date): Date {
  return new Date(start.getTime() + SLOT_MIN * 60 * 1000)
}

async function main() {
  console.log('🌱 Seeding cosmetic-clinic (Dr شرام  فضلی)…')

  // ---- 1. Booking policy & open days --------------------------------------
  await prisma.appSettings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      timezone: TZ,
      defaultSlotDuration: SLOT_MIN,
      slotReservationDuration: 10,
      maxAdvanceBookingDays: 60,
      minLeadTimeMinutes: 15,
    },
  })

  // Friday (dayOfWeek = 5) is the clinic's day off.
  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
    await prisma.workingDay.upsert({
      where: { dayOfWeek },
      update: { isWorkingDay: dayOfWeek !== 5 },
      create: { dayOfWeek, isWorkingDay: dayOfWeek !== 5 },
    })
  }

  // ---- 2. Users ------------------------------------------------------------
  const doctor = await prisma.user.upsert({
    where: { id: DOCTOR_ID },
    update: { phoneNumber: '+989120000001' },
    create: {
      id: DOCTOR_ID,
      name: 'دکتر شبنمینضلی',
      email: 'dr.fazeli@cosmetic-clinic.local',
      phoneNumber: '+989120000001',
      role: 'admin',
      emailVerified: true,
      phoneNumberVerified: true,
      isActive: true,
      bio: 'فوق تخصص جراحی پلاستیک، زیبایی و ترمیمی.',
    },
  })

  const patient = await prisma.user.upsert({
    where: { id: PATIENT_ID },
    update: { phoneNumber: '+989120000002' },
    create: {
      id: PATIENT_ID,
      name: 'علی رضایی',
      email: 'ali.rezaei@example.com',
      phoneNumber: '+989120000002',
      role: 'user',
      emailVerified: true,
      phoneNumberVerified: true,
      isActive: true,
      gender: 'male',
      dateOfBirth: new Date('1991-04-17T00:00:00Z'),
      address: 'تهران، خیابان ولیعصر',
      bio: 'بیمار نمونه جهت دموی تایم‌لاین ویزیت‌ها.',
    },
  })

  await prisma.user.upsert({
    where: { id: PATIENT_MARYAM },
    update: { phoneNumber: '+989120000003' },
    create: {
      id: PATIENT_MARYAM,
      name: 'مریم کریمی',
      email: 'maryam.karimi@example.com',
      phoneNumber: '+989120000003',
      role: 'user',
      emailVerified: true,
      phoneNumberVerified: true,
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { id: PATIENT_REZA },
    update: { phoneNumber: '+989120000004' },
    create: {
      id: PATIENT_REZA,
      name: 'رضا موسوی',
      email: 'reza.mousavi@example.com',
      phoneNumber: '+989120000004',
      role: 'user',
      emailVerified: true,
      phoneNumberVerified: true,
      isActive: true,
    },
  })

  // ---- 3. Doctor profile ----------------------------------------------------
  await prisma.doctorProfile.upsert({
    where: { userId: DOCTOR_ID },
    update: {},
    create: {
      userId: DOCTOR_ID,
      slug: DOCTOR_SLUG,
      title: 'فوق تخصص جراحی پلاستیک، زیبایی، ترمیمی',
      brief:
        'جراحی بینی، فیس‌لیفت، لیپوساکشن، پروتز و جراحی سینه؛ رزرو نوبت آنلاین در چند دقیقه.',
      bio: 'دکتر شبنمشینلی، فوق تخصص جراحی پلاستیک، زیبایی و ترمیمی، با بیش از ده‌سال تجربه در جراحی‌های رینوپلاستی، فیس‌لیفت، لیپوساکشن، پروتز سینه و چانه و گونه و خدمات سرپایی (تزریق ژل، بوتاکس و مزوتراپی) است. رویکرد ایشان بر نتیجه طبیعی، ایمنی بیمار و مشاوره دقیق پیش از عمل و اجرای پروتکل استاندارد است.',
      credentials: 'فوق تخصص جراحی پلاستیک، زیبایی و ترمیمی',
      rating: 4.9,
      reviewCount: 3,
      yearsExperience: 18,
      languages: ['فارسی', 'انگلیسی'],
      consultFee: FEE,
      slotDurationMinutes: SLOT_MIN,
      isActive: true,
    },
  })

  // ---- 4. Catalog: specializations (procedures) & illnesses (concerns) -------
  const specializations = [
    {
      slug: 'rhinoplasty',
      name: 'جراحی بینی (رینوپلاستی)',
      description: 'جراحی زیبایی و اصلاحی بینی برای بهبود فرم و تنفس',
      iconName: 'rhinoplasty',
      order: 1,
    },
    {
      slug: 'facelift',
      name: 'جراحی لیفت صورت (فیس‌لیفت)',
      description: 'رفع شلی و چین‌های صورت برای جوان‌نمایی طبیعی',
      iconName: 'facelift',
      order: 2,
    },
    {
      slug: 'chin-liposuction',
      name: 'لیپوساکشن غبغب',
      description: 'حذف چربی غبغب برای کش‌آمدگی خط فک',
      iconName: 'chin',
      order: 3,
    },
    {
      slug: 'breast-implant',
      name: 'جراحی پروتز سینه',
      description: 'افزایش حجم سینه با پروتز و نتیجه طبیعی',
      iconName: 'breast',
      order: 4,
    },
    {
      slug: 'liposuction',
      name: 'لیپوساکشن',
      description: 'کاهش چربی موضعی با لیپوساکشن ایمن',
      iconName: 'liposuction',
      order: 5,
    },
    {
      slug: 'abdominoplasty',
      name: 'جراحی شکم (ابدومینوپلاستی)',
      description: 'اصلاح شلی و چربی شکم برای فرم‌گیری مجدد',
      iconName: 'abdomen',
      order: 6,
    },
    {
      slug: 'brow-lift',
      name: 'جراحی لیفت ابرو',
      description: 'افزایش ارتفاع ابرو و کاهش چین‌های پیشانی',
      iconName: 'brow',
      order: 7,
    },
    {
      slug: 'chin-cheek-implant',
      name: 'پروتز چانه و گونه',
      description: 'ایستادگی و هارمونی زاویه صورت با پروتز چانه و گونه',
      iconName: 'implant',
      order: 8,
    },
    {
      slug: 'mastopexy',
      name: 'جراحی سینه (ماموپلاستی)',
      description: 'تنظیم اندازه و فرم سینه (افزایش، جابه‌جایی، کوچک‌سازی)',
      iconName: 'breast',
      order: 9,
    },
    {
      slug: 'blepharoplasty',
      name: 'عمل پلک (بلفاروپلاستی)',
      description: 'رفع شلی و چربی پلک بالا و پایین',
      iconName: 'eye',
      order: 10,
    },
    {
      slug: 'non-surgical',
      name: 'خدمات سرپایی (ژل، بوتاکس، مزو)',
      description: 'تزریق ژل، بوتاکس و مزوتراپی برای نتیجه سریع و سرپایی',
      iconName: 'injection',
      order: 11,
    },
  ]

  const createdSpecs: Record<string, string> = {}
  for (const s of specializations) {
    const row = await prisma.specialization.upsert({
      where: { slug: s.slug },
      update: {},
      create: { ...s },
    })
    createdSpecs[s.slug] = row.id
  }

  const illnesses = [
    {
      slug: 'double-chin',
      name: 'غبغب',
      description: 'تجمع چربی ذقن که خط فک را نامنظم می‌کند',
      symptoms: 'دو ردیف چربی زیر فک، فرم نامتقارن زاویه صورت',
    },
    {
      slug: 'facial-sagging',
      name: 'افتادگی و شلی صورت',
      description: 'کاهش سفتی پوست و افتادگی بافت صورت با گذشت زمان',
      symptoms: 'شلی صورت و خط جویدنی، افتادگی ابرو و پلک',
    },
    {
      slug: 'localized-fat',
      name: 'چربی موضعی',
      description: 'چربی‌های مقاوم که با رژیم و ورزش حذف نمی‌شوند',
      symptoms: 'تجمع چربی شکم، پهلو یا غبغب',
    },
    {
      slug: 'breast-asymmetry',
      name: 'نامتقارنی سینه',
      description: 'تفاوت اندازه یا فرم دو سینه',
      symptoms: 'تفاوت سایز، افتادگی یا شکل نامتقارن سینه',
    },
  ]

  const createdIllnesses: Record<string, string> = {}
  for (const i of illnesses) {
    const row = await prisma.illness.upsert({
      where: { slug: i.slug },
      update: {},
      create: { ...i },
    })
    createdIllnesses[i.slug] = row.id
  }

  // ---- 5. Doctor ↔ catalog joins ----------------------------------------------
  const profile = await prisma.doctorProfile.findUniqueOrThrow({
    where: { userId: DOCTOR_ID },
    select: { profileId: true },
  })

  const specJoins = specializations.map((s, idx) => ({
    slug: s.slug,
    isPrimary: idx === 0,
  }))
  for (const j of specJoins) {
    await prisma.doctorSpecialization.upsert({
      where: {
        doctorProfileId_specializationId: {
          doctorProfileId: profile.profileId,
          specializationId: createdSpecs[j.slug],
        },
      },
      update: {},
      create: {
        doctorProfileId: profile.profileId,
        specializationId: createdSpecs[j.slug],
        isPrimary: j.isPrimary,
      },
    })
  }

  await prisma.doctorProfile.update({
    where: { userId: DOCTOR_ID },
    data: {
      illnesses: {
        connect: Object.values(createdIllnesses).map((id) => ({ id })),
      },
    },
  })

  // ---- 6. Weekly schedule blocks (the slot engine reads these) ------------------
  await prisma.doctorScheduleBlock.deleteMany({
    where: { doctorId: DOCTOR_ID },
  })

  const WEEKLY_BLOCKS: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
  }> = []
  for (const dayOfWeek of [0, 1, 2, 3, 4, 6]) {
    WEEKLY_BLOCKS.push(
      { dayOfWeek, startTime: '09:00', endTime: '13:00' },
      { dayOfWeek, startTime: '16:00', endTime: '20:00' },
    )
  }
  await prisma.doctorScheduleBlock.createMany({
    data: WEEKLY_BLOCKS.map((b) => ({
      doctorId: DOCTOR_ID,
      dayOfWeek: b.dayOfWeek,
      startTime: b.startTime,
      endTime: b.endTime,
      slotDurationMinutes: SLOT_MIN,
      isActive: true,
    })),
  })

  // ---- 7. Appointments (visits) + Orders ----------------------------------------
  // PaymentDetails carries a RESTRICT FK onto orders, so child payment rows
  // must be cleared before the orders/appointments themselves.
  const existingOrderIds = (
    await prisma.order.findMany({
      where: { doctorId: DOCTOR_ID },
      select: { id: true },
    })
  ).map((o) => o.id)
  await prisma.paymentDetails.deleteMany({
    where: { orderId: { in: existingOrderIds } },
  })
  await prisma.paymentAttempt.deleteMany({
    where: { orderId: { in: existingOrderIds } },
  })
  await prisma.paymentLock.deleteMany({
    where: { orderId: { in: existingOrderIds } },
  })
  await prisma.appointment.deleteMany({ where: { doctorId: DOCTOR_ID } })
  await prisma.order.deleteMany({ where: { doctorId: DOCTOR_ID } })

  const visit = (
    dateISO: string,
    time: string,
    data: {
      patientName: string
      reasonForVisit: string
      status: 'COMPLETED' | 'BOOKING_CONFIRMED' | 'CANCELLED'
      paid?: boolean
      patientId?: string
      phoneNumber?: string
    },
  ) => {
    const start = slotStart(dateISO, time)
    const end = slotEnd(start)
    const appointmentId = randomUUID()
    return {
      appointmentId,
      doctorId: DOCTOR_ID,
      userId: data.patientId ?? PATIENT_ID,
      patientType: 'MYSELF' as const,
      patientName: data.patientName,
      phoneNumber: data.phoneNumber ?? '+989120000002',
      reasonForVisit: data.reasonForVisit,
      appointmentStartUTC: start,
      appointmentEndUTC: end,
      paymentMethod: data.paid ? 'ONLINE' : 'CASH',
      paidAt: data.paid
        ? new Date(start.getTime() - 3 * 24 * 60 * 60 * 1000)
        : null,
      status: data.status,
      order: data.paid
        ? {
            id: randomUUID(),
            amount: FEE,
            currency: 'IRT',
            paymentStatus: 'Paid' as const,
            paidAt: new Date(start.getTime() - 3 * 24 * 60 * 60 * 1000),
          }
        : undefined,
    }
  }

  const visits = [
    visit('2026-04-08', '10:00', {
      patientName: 'علی رضایی',
      reasonForVisit: 'مشاوره و معاینه اولیه جراحی بینی',
      status: 'COMPLETED',
      paid: true,
    }),
    visit('2026-06-10', '11:00', {
      patientName: 'علی رضایی',
      reasonForVisit: 'عمل رینوپلاستی',
      status: 'COMPLETED',
      paid: true,
    }),
    visit('2026-07-02', '17:00', {
      patientName: 'علی رضایی',
      reasonForVisit: 'ویزیت کنترلی و برداشتن بخیه‌ها',
      status: 'COMPLETED',
      paid: true,
    }),
    visit('2026-08-12', '10:00', {
      patientName: 'علی رضایی',
      reasonForVisit: 'مشاوره لیپوساکشن غبغب',
      status: 'BOOKING_CONFIRMED',
      paid: true,
    }),
    visit('2026-08-26', '18:00', {
      patientName: 'مریم کریمی',
      reasonForVisit: 'تزریق بوتاکس و ژل',
      status: 'BOOKING_CONFIRMED',
      paid: true,
      patientId: PATIENT_MARYAM,
      phoneNumber: '+989120000033',
    }),
  ]

  for (const v of visits) {
    const { order, ...appointment } = v
    await prisma.appointment.create({ data: appointment })
    if (order) {
      await prisma.order.create({
        data: {
          ...order,
          appointmentId: v.appointmentId,
          doctorId: DOCTOR_ID,
        },
      })
    }
  }

  // ---- 8. Treatment timeline (patient record) --------------------------------
  const existingTimelineIds = (
    await prisma.timeLine.findMany({
      where: { userId: PATIENT_ID },
      select: { id: true },
    })
  ).map((t) => t.id)
  await prisma.image.deleteMany({
    where: { timeLineId: { in: existingTimelineIds } },
  })
  await prisma.timeLine.deleteMany({ where: { userId: PATIENT_ID } })

  const timelineRows: Array<{
    date: string
    description: string
    isEspecial?: boolean
  }> = [
    {
      date: '2026-03-28',
      description:
        'مشاوره اولیه انجام شد؛ عکاسی و طراحی فرم نهایی بینی و تهیه طرح درمان.',
    },
    {
      date: '2026-04-08',
      description: 'بررسی نهایی و تصمیم‌گیری جهت انجام جراحی بینی.',
    },
    {
      date: '2026-06-10',
      description: 'عمل رینوپلاستی در اتاق عمل به انجام رسید و بیمار مرخص شد.',
      isEspecial: true,
    },
    {
      date: '2026-07-02',
      description: 'ویزیت کنترلی، برداشتن بخیه‌ها و بررسی روند التیام.',
    },
  ]

  for (const row of timelineRows) {
    await prisma.timeLine.create({
      data: {
        date: row.date,
        description: row.description,
        isEspecial: row.isEspecial ?? false,
        userId: PATIENT_ID,
      },
    })
  }

  // ---- 9. Reviews --------------------------------------------------------------------
  // Extra mock reviewers (needed as Review.authorId is a required FK).
  for (const r of EXTRA_REVIEWERS) {
    await prisma.user.upsert({
      where: { id: r.id },
      update: { phoneNumber: r.phone },
      create: {
        id: r.id,
        name: r.name,
        email: r.email,
        phoneNumber: r.phone,
        role: 'user',
        emailVerified: true,
        phoneNumberVerified: true,
        isActive: true,
      },
    })
  }

  await prisma.review.deleteMany({ where: { doctorId: DOCTOR_ID } })
  await prisma.review.deleteMany({ where: { doctorId: null } })

  const now = Date.now()
  await prisma.review.createMany({
    data: MOCK_REVIEWS.map((r) => ({
      authorId: r.authorId,
      doctorId: DOCTOR_ID,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isApproved: true,
      isFeatured: r.isFeatured ?? false,
      createdAt: new Date(now - r.daysAgo * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - r.daysAgo * 24 * 60 * 60 * 1000),
    })),
  })

  // ---- 10. FAQs --------------------------------------------------------------
  await prisma.fAQ.deleteMany({})

  const FAQS: Array<{ question: string; answer: string }> = [
    {
      question: 'چطور میتوانم نوبت ویزیت را رزرو کنم؟',
      answer:
        'از طریق صفحه «رزرو نوبت» در سایت، تخصص موردنظر را انتخاب کنید، روز و ساعت دلخواه را برگزینید و پس از پرداخت هزینه مشاوره، نوبت شما قطعی میشود. بلافاصله پیامک تأیید برای شما ارسال خواهد شد.',
    },
    {
      question: 'هزینه مشاوره چقدر است و چگونه پرداخت میشود؟',
      answer:
        'هزینه ویزیت و مشاوره ۵۰۰٬۰۰۰ تومان است که هنگام رزرو نوبت بهصورت آنلاین پرداخت میشود. در صورت لغو نوبت تا ۴۸ ساعت قبل از ویزیت، مبلغ بهطور کامل بازگشت داده میشود.',
    },
    {
      question: 'آیا مشاوره پیش از جراحی ضروری است؟',
      answer:
        'بله. در جلسه مشاوره، معاینه انجام میشود، انتظارات شما بررسی میگردد و نتیجه طبیعی و قابلدستیابی با شما طراحی میشود. هیچ جراحی بدون مشاوره و طرح درمان مشخص انجام نمیشود.',
    },
    {
      question: 'دوره نقاهت بعد از رینوپلاستی چقدر است؟',
      answer:
        'بیشتر بیماران پس از ۷ تا ۱۰ روز به کار و فعالیت روزانه بازمیگردند. ورم اصلی بینی طی هفتههای اول فروکش میکند و فرم نهایی بینی معمولاً بین ۶ ماه تا یک سال بعد از عمل مشخص میشود.',
    },
    {
      question: 'عمل بینی با بیحسی انجام میشود یا بیهوشی؟',
      answer:
        'رینوپلاستی معمولاً با بیهوشی عمومی و در اتاق عمل مجهز انجام میشود. بسته به نوع جراحی و صلاحدید پزشک، روش بیهوشی در جلسه مشاوره به شما توضیح داده میشود.',
    },
    {
      question: 'نتیجه تزریق بوتاکس و ژل چقدر ماندگار است؟',
      answer:
        'اثر بوتاکس حدود ۴ تا ۶ ماه و فیلر (ژل) بین ۱۲ تا ۱۸ ماه ماندگار است. ماندگاری به نواحی تزریق، متابولیسم بدن و سبک زندگی بستگی دارد.',
    },
    {
      question: 'لیپوساکشن جایگزین لاغری است؟',
      answer:
        'خیر. لیپوساکشن برای حذف چربیهای موضعی مقاوم طراحی شده است، نه کاهش وزن کلی. بهترین نتیجه در افرادی دیده میشود که وزن نزدیک به تعادل دارند و سبک زندگی سالمی دارند.',
    },
    {
      question: 'اگر نوبت رزرو شده را نتوانم حضور پیدا کنم چه کنم؟',
      answer:
        'تا ۴۸ ساعت قبل از ویزیت میتوانید از طریق تماس تلفنی یا پاسخ به پیامک تأیید، نوبت خود را جابهجا یا لغو کنید. لغو در کمتر از این بازه ممکن است مشمول عدم بازگشت هزینه مشاوره شود.',
    },
    {
      question: 'آیا خدمات سرپایی (بوتاکس، ژل، مزو) در همان جلسه انجام میشود؟',
      answer:
        'بله. پس از مشاوره و بررسی شرایط پوست، در صورت عدم وجود منع مصرف، تزریق در همان جلسه انجام میشود و کل فرآیند معمولاً کمتر از ۴۵ دقیقه طول میکشد.',
    },
    {
      question: 'آیا جراحیهای زیبایی برای همه مناسب هستند؟',
      answer:
        'هر جراحی شرطها و ملاحظات خاص خود را دارد. سلامت عمومی، انتظارات واقعبینانه و سبک زندگی شما در جلسه مشاوره ارزیابی میشود و در صورت عدم تناسب، روشهای جایگزین پیشنهاد خواهد شد.',
    },
  ]

  await prisma.fAQ.createMany({
    data: FAQS.map((f, idx) => ({
      question: f.question,
      answer: f.answer,
      order: idx + 1,
    })),
  })

  const summary = {
    doctor: doctor.name,
    patient: patient.name,
    specializations: Object.keys(createdSpecs).length,
    illnesses: Object.keys(createdIllnesses).length,
    weeklyBlocks: WEEKLY_BLOCKS.length,
    appointments: visits.length,
    timelineEntries: timelineRows.length,
    reviews: MOCK_REVIEWS.length,
    faqs: FAQS.length,
  }
  console.log('✅ Seed complete:', summary)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
