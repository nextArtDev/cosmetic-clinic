/**
 * /v1 (Kosar Clinic) data layer.
 *
 * Reuses the medical404 backend entirely — same Prisma schema, same slot
 * engine, same auth — but reshapes the results into the lighter component
 * contracts used by the kosar frontend. No new queries are introduced here;
 * this file is a thin adapter over the existing server data functions.
 */

import 'server-only'
import {
  getSpecializations,
  getDoctors,
  getIllnesses,
  getPersonnel,
  getTestimonials,
  getFaqs,
  type Doctor,
  type Specialization,
  type Illness,
  type Personnel,
  type Testimonial,
  type Faq,
} from '@/app/v1/lib/data'
import { cache } from 'react'

/**
 * Doctor card shape for kosar carousels/detail.
 * `id` is the slug so links look like `/v1/doctors/dr-slug`.
 */
export interface V1Doctor {
  id: string
  slug: string
  userId: string
  name: string
  title: string
  credentials: string
  brief: string
  bio: string
  rating: number
  reviewCount: number
  yearsExperience: number
  languages: string[]
  consultFee: number
  slotDurationMinutes: number
  schedule: { dayOfWeek: number; startTime: string; endTime: string }[]
  nextAvailable: string
  primarySpecializationSlug: string
  specializationSlugs: string[]
  illnessSlugs: string[]
  imageUrl: string | null
}

export interface V1Specialization {
  id: string
  slug: string
  name: string
  description: string
  iconName: string
  order: number
  imageUrl: string | null
}

export interface V1Illness {
  id: string
  slug: string
  name: string
  description: string
  symptoms: string[]
  imageUrl: string | null
}

export interface V1Personnel {
  id: string
  fullName: string
  position: string
  bio: string
  order: number
  imageUrl: string | null
}

export interface V1Testimonial {
  id: string
  patientName: string
  doctorSlug: string
  rating: number
  text: string
}

export interface V1Faq {
  id: string
  question: string
  answer: string
}

const placeholders = {
  doctor: '/v1/images/blank-profile-picture.png',
  specialization: '/v1/images/no-specialization-photo.webp',
  illness: '/v1/images/head-1.webp',
  personnel: '/v1/images/blank-profile-picture.png',
  hero: '/v1/images/head-6.webp',
}

const doctorToV1 = (d: Doctor): V1Doctor => ({
  id: d.slug,
  slug: d.slug,
  userId: d.userId,
  name: d.name,
  title: d.title,
  credentials: d.credentials,
  brief: d.brief,
  bio: d.bio,
  rating: d.rating,
  reviewCount: d.reviewCount,
  yearsExperience: d.yearsExperience,
  languages: d.languages,
  consultFee: d.consultFee,
  slotDurationMinutes: d.slotDurationMinutes,
  schedule: d.schedule,
  nextAvailable: d.nextAvailable,
  primarySpecializationSlug: d.primarySpecializationSlug,
  specializationSlugs: d.specializationSlugs,
  illnessSlugs: d.illnessSlugs,
  imageUrl: placeholders.doctor,
})

const specializationToV1 = (s: Specialization): V1Specialization => ({
  id: s.slug,
  slug: s.slug,
  name: s.name,
  description: s.description,
  iconName: s.iconName,
  order: s.order,
  imageUrl: placeholders.specialization,
})

const illnessToV1 = (i: Illness): V1Illness => ({
  id: i.slug,
  slug: i.slug,
  name: i.name,
  description: i.description,
  symptoms: i.symptoms,
  imageUrl: placeholders.illness,
})

const personnelToV1 = (p: Personnel): V1Personnel => ({
  id: p.id,
  fullName: p.fullName,
  position: p.position,
  bio: p.bio,
  order: p.order,
  imageUrl: placeholders.personnel,
})

const testimonialToV1 = (t: Testimonial): V1Testimonial => ({
  id: t.id,
  patientName: t.patientName,
  doctorSlug: t.doctorSlug,
  rating: t.rating,
  text: t.text,
})

const faqToV1 = (f: Faq): V1Faq => ({
  id: f.id,
  question: f.question,
  answer: f.answer,
})

/** Home page aggregate — all kosar landing sections in parallel. */
export const getV1HomeData = cache(async () => {
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
    specializations: specializations.map(specializationToV1),
    doctors: doctors.map(doctorToV1),
    illnesses: illnesses.map(illnessToV1),
    personnel: personnel.map(personnelToV1),
    testimonials: testimonials.map(testimonialToV1),
    faqs: faqs.map(faqToV1),
  }
})

/** Specializations with their doctors (for the kosar parallax Slider). */
export const getV1SpecializationsWithDoctors = cache(async () => {
  const [specializations, doctors] = await Promise.all([
    getSpecializations(),
    getDoctors(),
  ])
  return specializations.map((s) => ({
    ...specializationToV1(s),
    doctors: doctors
      .filter(
        (d) =>
          d.specializationSlugs.includes(s.slug) ||
          d.primarySpecializationSlug === s.slug,
      )
      .map(doctorToV1),
  }))
})

/** Doctors list + specializations (for filtering / footer). */
export const getV1DoctorsData = cache(async () => {
  const [doctors, specializations] = await Promise.all([
    getDoctors(),
    getSpecializations(),
  ])
  return {
    doctors: doctors.map(doctorToV1),
    specializations: specializations.map(specializationToV1),
  }
})

/** Single doctor by slug. */
export const getV1DoctorBySlug = cache(async (slug: string) => {
  const doctors = await getDoctors()
  const doctor = doctors.find((d) => d.slug === slug)
  if (!doctor) return null
  return doctorToV1(doctor)
})

/** Single specialization by slug. */
export const getV1SpecializationBySlug = cache(async (slug: string) => {
  const specializations = await getSpecializations()
  const spec = specializations.find((s) => s.slug === slug)
  if (!spec) return null
  return specializationToV1(spec)
})

/** Single illness by slug. */
export const getV1IllnessBySlug = cache(async (slug: string) => {
  const illnesses = await getIllnesses()
  const illness = illnesses.find((i) => i.slug === slug)
  if (!illness) return null
  return illnessToV1(illness)
})

/** Specialization with its doctors + related illnesses (for detail page). */
export const getV1SpecializationDetail = cache(
  async (slug: string) => {
    const [specializations, doctors, illnesses] = await Promise.all([
      getSpecializations(),
      getDoctors(),
      getIllnesses(),
    ])
    const spec = specializations.find((s) => s.slug === slug)
    if (!spec) return null

    const specDoctors = doctors.filter(
      (d) =>
        d.specializationSlugs.includes(slug) ||
        d.primarySpecializationSlug === slug,
    )
    const specIllnesses = illnesses.filter((i) =>
      i.specializationSlugs.includes(slug),
    )

    return {
      ...specializationToV1(spec),
      doctors: specDoctors.map(doctorToV1),
      illnesses: specIllnesses.map(illnessToV1),
    }
  },
)

/** Doctors filtered by specialization slug. */
export const getV1DoctorsBySpecialization = cache(async (slug: string) => {
  const doctors = await getDoctors()
  return doctors
    .filter(
      (d) =>
        d.specializationSlugs.includes(slug) ||
        d.primarySpecializationSlug === slug,
    )
    .map(doctorToV1)
})

/** Doctors filtered by illness slug. */
export const getV1DoctorsByIllness = cache(async (slug: string) => {
  const doctors = await getDoctors()
  return doctors.filter((d) => d.illnessSlugs.includes(slug)).map(doctorToV1)
})

export const v1Placeholders = placeholders
