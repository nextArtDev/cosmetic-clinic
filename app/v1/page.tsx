import type { Metadata } from 'next'
import { getHomeData } from './lib/data'
import { Hero } from './components/sections/hero'
import { StatsStrip } from './components/sections/stats-strip'
import { SpecializationsGrid } from './components/sections/specializations-grid'
import { DoctorsShowcase } from './components/sections/doctors-showcase'
import { IllnessesGrid } from './components/sections/illnesses-grid'
import { Testimonials } from './components/sections/testimonials'
import { FaqAccordion } from './components/sections/faq-accordion'
import { CtaBanner } from './components/sections/cta-banner'

export const metadata: Metadata = {
  title: 'کلینیک ۴۰۴ — نوبت‌دهی آنلاین پزشکی',
  description:
    'کلینیک تخصصی ۴۰۴؛ رزرو نوبت آنلاین از پزشکان متخصص قلب، پوست، اطفال، ارتوپدی و داخلی. بدون نیاز به معرفی‌نامه.',
}

export default async function HomePage() {
  const data = await getHomeData()
  const avgRating =
    data.doctors.length > 0
      ? data.doctors.reduce((sum, d) => sum + d.rating, 0) / data.doctors.length
      : 4.9

  return (
    <>
      <Hero featured={data.doctors[0]} doctorCount={data.doctors.length} avgRating={avgRating} />
      <StatsStrip
        doctorCount={data.doctors.length}
        personnelCount={data.personnel.length}
        illnessCount={data.illnesses.length}
        avgRating={avgRating}
      />
      <SpecializationsGrid specializations={data.specializations} doctors={data.doctors} />
      <DoctorsShowcase doctors={data.doctors} specializations={data.specializations} />
      <IllnessesGrid illnesses={data.illnesses} />
      <Testimonials testimonials={data.testimonials} doctors={data.doctors} />
      <FaqAccordion faqs={data.faqs} />
      <CtaBanner />
    </>
  )
}
