// lib/chat/tools.ts
// Server-side tools that ground the chatbot in the clinic database.
// Only public, non-personal data is exposed: services, conditions, the
// doctor's public profile, FAQs, working hours, free slots and approved
// review stats. Nothing user-identifying ever reaches the model.

import 'server-only'
import { tool } from 'ai'
import { z } from 'zod'
import { formatInTimeZone } from 'date-fns-tz'

import prisma from '@/lib/prisma'
import { getAvailableSlots } from '@/lib/scheduling/get-available-slots'
import { getAppTimeZone } from '@/lib/scheduling/tz'

const FA_WEEKDAYS = [
  'یکشنبه',
  'دوشنبه',
  'سهشنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
]

/** The single doctor's User id — the key the scheduling engine expects. */
async function getDoctorUserId(): Promise<string | null> {
  const profile = await prisma.doctorProfile.findFirst({
    where: { isActive: true },
    select: { userId: true },
    orderBy: { createdAt: 'asc' },
  })
  return profile?.userId ?? null
}

export function getChatTools() {
  const tz = getAppTimeZone()

  return {
    getServices: tool({
      description:
        'لیست خدمات و تخصصهای فعال کلینیک را با توضیح کوتاه برمیگرداند. برای هر سوال دربارهٔ خدمات یا اینکه کلینیک چه کاری انجام میدهد، این ابزار را صدا بزن.',
      inputSchema: z.object({}),
      execute: async () => {
        const services = await prisma.specialization.findMany({
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: { name: true, description: true },
        })
        return { services }
      },
    }),

    getConditions: tool({
      description:
        'لیست شرایط و بیماریهای ثبتشدهٔ کلینیک (با توضیح و علائم) را برمیگرداند. برای سوالاتی مثل «مشکل X را درمان میکنید؟» این ابزار را صدا بزن.',
      inputSchema: z.object({}),
      execute: async () => {
        const conditions = await prisma.illness.findMany({
          where: { isActive: true },
          select: { name: true, description: true, symptoms: true },
        })
        return { conditions }
      },
    }),

    getDoctorProfile: tool({
      description:
        'پروفایل عمومی پزشک (عنوان، معرفی، سابقه، زبانها، هزینهٔ ویزیت و امتیاز) را برمیگرداند.',
      inputSchema: z.object({}),
      execute: async () => {
        const profile = await prisma.doctorProfile.findFirst({
          where: { isActive: true },
          select: {
            title: true,
            brief: true,
            credentials: true,
            yearsExperience: true,
            languages: true,
            consultFee: true,
            rating: true,
            reviewCount: true,
            doctor: { select: { name: true, bio: true } },
          },
          orderBy: { createdAt: 'asc' },
        })
        if (!profile) return { error: 'پروفایل پزشک یافت نشد.' }
        return {
          name: profile.doctor.name,
          title: profile.title,
          brief: profile.brief,
          credentials: profile.credentials,
          yearsExperience: profile.yearsExperience,
          languages: profile.languages,
          consultFeeToman: profile.consultFee,
          rating: profile.rating,
          reviewCount: profile.reviewCount,
        }
      },
    }),

    getFaqs: tool({
      description:
        'سوالات متداول ثبتشده در دیتابیس کلینیک را با پاسخ آنها برمیگرداند. برای سوالات عمومی مراجعان ابتدا اینجا جستجو کن.',
      inputSchema: z.object({}),
      execute: async () => {
        const faqs = await prisma.fAQ.findMany({
          orderBy: { order: 'asc' },
          select: { question: true, answer: true },
        })
        return { faqs }
      },
    }),

    getClinicHours: tool({
      description:
        'ساعات کاری هفتگی کلینیک (بر اساس بازههای برنامهٔ پزشک)، روزهای تعطیل و مرخصیهای ۱۴ روز آینده را برمیگرداند.',
      inputSchema: z.object({}),
      execute: async () => {
        const doctorId = await getDoctorUserId()
        if (!doctorId) return { error: 'پزشک فعالی یافت نشد.' }

        const [workingDays, blocks, leaves, closures] = await Promise.all([
          prisma.workingDay.findMany({ orderBy: { dayOfWeek: 'asc' } }),
          prisma.doctorScheduleBlock.findMany({
            where: { doctorId, isActive: true },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            select: { dayOfWeek: true, startTime: true, endTime: true },
          }),
          prisma.doctorLeave.findMany({
            where: {
              doctorId,
              leaveDate: {
                gte: new Date(),
                lte: new Date(Date.now() + 14 * 86_400_000),
              },
            },
            select: { leaveDate: true, startTime: true, endTime: true },
          }),
          prisma.clinicClosure.findMany({
            where: {
              date: {
                gte: new Date(),
                lte: new Date(Date.now() + 14 * 86_400_000),
              },
            },
            select: { date: true, reason: true },
          }),
        ])

        const weekly = workingDays.map((wd) => ({
          day: FA_WEEKDAYS[wd.dayOfWeek],
          isOpen: wd.isWorkingDay,
          blocks: blocks
            .filter((b) => b.dayOfWeek === wd.dayOfWeek)
            .map((b) => `${b.startTime} تا ${b.endTime}`),
        }))

        return {
          timezone: tz,
          weekly,
          upcomingLeaves: leaves.map((l) => ({
            date: formatInTimeZone(l.leaveDate, tz, 'yyyy-MM-dd'),
            partial: l.startTime ? `${l.startTime} تا ${l.endTime}` : 'تمام روز',
          })),
          upcomingClosures: closures.map((c) => ({
            date: formatInTimeZone(c.date, tz, 'yyyy-MM-dd'),
            reason: c.reason,
          })),
        }
      },
    }),

    findAvailableSlots: tool({
      description:
        'اسلتهای آزاد یک روز مشخص (تاریخ میلادی YYYY-MM-DD، وقت کلینیک) را برمیگرداند. فقط برای دیدن ظرفیت؛ رزرو نهایی در صفحهٔ /booking انجام میشود.',
      inputSchema: z.object({
        dateISO: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ باید میلادی و به فرمت YYYY-MM-DD باشد.'),
      }),
      execute: async ({ dateISO }) => {
        const doctorId = await getDoctorUserId()
        if (!doctorId) return { error: 'پزشک فعالی یافت نشد.' }
        try {
          const slots = await getAvailableSlots(doctorId, dateISO)
          return {
            date: dateISO,
            slotCount: slots.length,
            slots: slots.slice(0, 20).map((s) => s.label),
            note:
              slots.length > 20
                ? 'فقط ۲۰ اسلات اول نمایش داده شد.'
                : undefined,
          }
        } catch {
          return { error: 'خطا در محاسبهٔ اسلاتها برای این تاریخ.' }
        }
      },
    }),

    getReviewsSummary: tool({
      description:
        'خلاصهٔ نظرات تأییدشدهٔ مراجعان (میانگین امتیاز، تعداد و چند نظر منتخب) را برمیگرداند.',
      inputSchema: z.object({}),
      execute: async () => {
        const [agg, featured] = await Promise.all([
          prisma.review.aggregate({
            where: { isApproved: true },
            _avg: { rating: true },
            _count: { rating: true },
          }),
          prisma.review.findMany({
            where: { isApproved: true, isFeatured: true },
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: { rating: true, comment: true },
          }),
        ])
        return {
          averageRating: agg._avg.rating ?? null,
          totalApproved: agg._count.rating,
          featuredComments: featured,
        }
      },
    }),
  }
}
