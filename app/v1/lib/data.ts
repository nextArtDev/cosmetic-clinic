import 'server-only'
import { addDays } from 'date-fns'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import prisma from '@/lib/prisma'

export interface Department {
  id: string
  name: string
  iconName: string
}

export interface Specialization {
  id: string
  slug: string
  name: string
  shortName: string
  description: string
  iconName: string
  order: number
}

export interface Illness {
  id: string
  slug: string
  name: string
  description: string
  symptoms: string[]
  specializationSlugs: string[]
  doctorSlugs: string[]
}

export interface DoctorScheduleBlock {
  dayOfWeek: number // 0 Sun .. 6 Sat
  startTime: string
  endTime: string
}

export interface Doctor {
  profileId: string
  userId: string
  slug: string
  name: string
  title: string
  credentials: string
  brief: string
  bio: string
  departmentSlug: string
  specializationSlugs: string[]
  primarySpecializationSlug: string
  illnessSlugs: string[]
  rating: number
  reviewCount: number
  yearsExperience: number
  languages: string[]
  slotDurationMinutes: number
  consultFee: number
  schedule: DoctorScheduleBlock[]
  nextAvailable: string
}

export interface Personnel {
  id: string
  fullName: string
  position: string
  department: string
  bio: string
  order: number
}

export interface Testimonial {
  id: string
  patientName: string
  doctorSlug: string
  rating: number
  text: string
  visitReason: string
}

export interface Faq {
  id: string
  question: string
  answer: string
}

function symptomsToArray(s: string | null): string[] {
  return (s ?? '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
}

const JALALI_WEEKDAY = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
]

function nextAvailableLabel(schedule: DoctorScheduleBlock[]): string {
  if (schedule.length === 0) return 'به‌زودی'
  const now = new Date()
  for (let i = 0; i < 30; i++) {
    const day = addDays(now, i)
    const block = schedule.find((b) => b.dayOfWeek === day.getDay())
    if (!block) continue
    const weekday = JALALI_WEEKDAY[day.getDay()]
    const dateLabel = format(day, 'd MMM', { locale: faIR })
    if (i === 0) return `امروز، ساعت ${block.startTime}`
    if (i === 1) return `فردا، ساعت ${block.startTime}`
    return `${weekday} ${dateLabel} · ${block.startTime}`
  }
  return 'به‌زودی'
}

export async function getSpecializations(): Promise<Specialization[]> {
  const rows = await prisma.specialization.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  return rows.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    shortName: s.name,
    description: s.description ?? '',
    iconName: s.iconName ?? 'Stethoscope',
    order: s.order,
  }))
}

export async function getIllnesses(): Promise<Illness[]> {
  const rows = await prisma.illness.findMany({
    where: { isActive: true },
    include: {
      specializations: true,
      doctors: true,
    },
  })
  return rows.map((i) => ({
    id: i.id,
    slug: i.slug,
    name: i.name,
    description: i.description ?? '',
    symptoms: symptomsToArray(i.symptoms),
    specializationSlugs: i.specializations.map((s) => s.slug),
    doctorSlugs: i.doctors.map((d) => d.slug),
  }))
}

export async function getDoctors(): Promise<Doctor[]> {
  const rows = await prisma.doctorProfile.findMany({
    where: { isActive: true },
    include: {
      doctor: {
        include: {
          doctorScheduleBlocks: {
            where: { isActive: true },
            orderBy: { startTime: 'asc' },
          },
        },
      },
      specializations: { include: { specialization: true } },
      illnesses: true,
      department: true,
    },
  })
  const mapped = rows.map((d) => ({
    profileId: d.profileId,
    userId: d.userId,
    slug: d.slug,
    name: d.doctor.name,
    title: d.title ?? '',
    credentials: d.credentials,
    brief: d.brief,
    bio: d.bio ?? d.brief,
    departmentSlug: d.department?.iconName ?? '',
    specializationSlugs: d.specializations.map((s) => s.specialization.slug),
    primarySpecializationSlug:
      d.specializations.find((s) => s.isPrimary)?.specialization.slug ??
      d.specializations[0]?.specialization.slug ??
      '',
    illnessSlugs: d.illnesses.map((i) => i.slug),
    rating: d.rating,
    reviewCount: d.reviewCount,
    yearsExperience: d.yearsExperience,
    languages: d.languages,
    slotDurationMinutes: d.slotDurationMinutes,
    consultFee: d.consultFee,
    schedule: d.doctor.doctorScheduleBlocks.map((b) => ({
      dayOfWeek: b.dayOfWeek,
      startTime: b.startTime,
      endTime: b.endTime,
    })),
    nextAvailable: '',
  }))
  return mapped.map((d) => ({
    ...d,
    nextAvailable: nextAvailableLabel(d.schedule),
  }))
}

export async function getPersonnel(): Promise<Personnel[]> {
  const rows = await prisma.personnel.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  return rows.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    position: p.position,
    department: '',
    bio: p.bio ?? '',
    order: p.order,
  }))
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const rows = await prisma.review.findMany({
    where: { isApproved: true },
    include: { doctor: { include: { doctorProfile: true } } },
    orderBy: { createdAt: 'desc' },
    take: 12,
  })
  return rows.map((r) => ({
    id: r.id,
    patientName: 'بیمار کلینیک',
    doctorSlug: r.doctor?.doctorProfile?.slug ?? '',
    rating: r.rating,
    text: r.comment,
    visitReason: '',
  }))
}

export async function getFaqs(): Promise<Faq[]> {
  const rows = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } })
  return rows.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
  }))
}

export async function getHomeData() {
  const [specializations, doctors, illnesses, personnel, testimonials, faqs] =
    await Promise.all([
      getSpecializations(),
      getDoctors(),
      getIllnesses(),
      getPersonnel(),
      getTestimonials(),
      getFaqs(),
    ])

  return {
    specializations,
    doctors,
    illnesses,
    personnel,
    testimonials,
    faqs,
  }
}
