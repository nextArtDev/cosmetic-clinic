import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowUpRight,
  CalendarCheck,
  Clock3,
  GraduationCap,
  Languages,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatter } from '@/lib/utils'
import { Badge } from '../../components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '../../components/motion/reveal'
import { GsapSheen } from '../../components/motion/gsap-sheen'
import {
  getDoctors,
  getIllnesses,
  getSpecializations,
  getTestimonials,
} from '../../lib/data'
import { initials } from '../../lib/utils'

const DAYS = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
]

export async function generateStaticParams() {
  const doctors = await getDoctors()
  return doctors.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const doctors = await getDoctors()
  const doctor = doctors.find((d) => d.slug === slug)
  if (!doctor) return {}
  return {
    title: `${doctor.name} | کلینیک ۴۰۴`,
    description: doctor.brief,
  }
}

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [doctors, specializations, illnesses, testimonials] =
    await Promise.all([
      getDoctors(),
      getSpecializations(),
      getIllnesses(),
      getTestimonials(),
    ])

  const doctor = doctors.find((d) => d.slug === slug)
  if (!doctor) notFound()

  const primarySpec =
    specializations.find((s) => s.slug === doctor.primarySpecializationSlug) ??
    specializations.find((s) => s.slug === doctor.specializationSlugs[0]) ??
    null
  const otherSpecs = specializations.filter(
    (s) =>
      doctor.specializationSlugs.includes(s.slug) &&
      s.slug !== doctor.primarySpecializationSlug,
  )
  const relatedIllnesses = illnesses.filter((i) =>
    doctor.illnessSlugs.includes(i.slug),
  )
  const doctorTestimonials = testimonials.filter(
    (t) => t.doctorSlug === doctor.slug,
  )

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden pt-40 pb-20 md:pt-48">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 right-1/4 h-[28rem] w-[28rem] rounded-full bg-sage/20 blur-[140px]" />
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <Link
              href="/doctors"
              className="text-xs text-ivory-dim hover:text-ivory"
            >
              → بازگشت به فهرست پزشکان
            </Link>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
            <Reveal>
              <div className="flex items-center gap-6">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sage-bright/40 to-sage/20 font-display text-3xl text-ivory">
                  {initials(doctor.name)}
                </div>
                <div>
                  <h1 className="font-display text-4xl text-ivory md:text-5xl">
                    {doctor.name}
                  </h1>
                  <p className="mt-2 text-ivory-dim">{doctor.title}</p>
                  <div className="mt-3 flex items-center gap-1 text-sm text-gold-soft">
                    <Star size={14} className="fill-gold-soft text-gold-soft" />
                    {doctor.rating} · {doctor.reviewCount} نظر بیماران
                  </div>
                </div>
              </div>

              <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-sage-mist">
                {doctor.brief}
              </p>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory-dim">
                {doctor.bio}
              </p>

              {(primarySpec || otherSpecs.length > 0) && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {primarySpec && (
                    <Link href={`/v1/specializations/${primarySpec.slug}`}>
                      <Badge variant="sage">{primarySpec.name}</Badge>
                    </Link>
                  )}
                  {otherSpecs.map((s) => (
                    <Link key={s.slug} href={`/specializations/${s.slug}`}>
                      <Badge variant="sage">{s.name}</Badge>
                    </Link>
                  ))}
                </div>
              )}

              <Separator className="my-10" />

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                <div>
                  <GraduationCap className="text-gold-soft" size={20} />
                  <p className="mt-3 text-sm text-ivory">
                    {doctor.credentials}
                  </p>
                  <p className="text-xs text-ivory-dim">مدارک و اعتبارات</p>
                </div>
                <div>
                  <Clock3 className="text-gold-soft" size={20} />
                  <p className="mt-3 text-sm text-ivory">
                    {doctor.yearsExperience} سال
                  </p>
                  <p className="text-xs text-ivory-dim">سابقهٔ بالینی</p>
                </div>
                <div>
                  <Languages className="text-gold-soft" size={20} />
                  <p className="mt-3 text-sm text-ivory">
                    {doctor.languages.join('، ')}
                  </p>
                  <p className="text-xs text-ivory-dim">زبان‌های گفت‌وگو</p>
                </div>
              </div>
            </Reveal>

            {/* Booking widget */}
            <Reveal delay={0.15}>
              <div className="glass-panel relative sticky top-28 p-7">
                <GsapSheen />
                <div className="relative flex items-center justify-between">
                  <span className="font-mono text-[0.65rem] text-sage-mist">
                    هزینهٔ مشاوره
                  </span>
                  <span className="text-lg font-display text-gold-soft">
                    {formatter.format(doctor.consultFee)} تومان
                  </span>
                </div>

                <div className="relative mt-5">
                  <p className="text-2xl font-display text-ivory">
                    {doctor.nextAvailable}
                  </p>
                  <p className="mt-1 text-xs text-ivory-dim">
                    {doctor.slotDurationMinutes} دقیقه · اولین نوبت خالی
                  </p>
                </div>

                <div className="relative mt-6 hairline" />

                {doctor.schedule.length > 0 && (
                  <div className="relative mt-6">
                    <p className="font-mono text-[0.65rem] text-sage-mist">
                      برنامهٔ هفتگی
                    </p>
                    <table className="mt-3 w-full text-sm">
                      <thead>
                        <tr className="border-b border-glass-border text-xs text-ivory-dim">
                          <th className="pb-2 text-right font-normal">روز</th>
                          <th className="pb-2 text-right font-normal">ساعت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctor.schedule.map((block) => (
                          <tr
                            key={`${block.dayOfWeek}-${block.startTime}`}
                            className="border-b border-glass-border/50"
                          >
                            <td className="py-2 text-ivory-dim">
                              {DAYS[block.dayOfWeek]}
                            </td>
                            <td className="py-2 text-right font-mono text-xs text-ivory">
                              {block.startTime} – {block.endTime}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <Button asChild className="relative mt-7 w-full">
                  <Link
                    href={`/booking?doctor=${doctor.slug}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <CalendarCheck size={16} /> رزرو نوبت با این پزشک
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Conditions treated */}
      {relatedIllnesses.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <Reveal>
            <h2 className="font-display text-3xl text-ivory">
              بیماری‌هایی که این پزشک درمان می‌کند
            </h2>
          </Reveal>
          <StaggerGroup className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedIllnesses.map((illness) => (
              <StaggerItem key={illness.slug}>
                <Link
                  href={`/illnesses/${illness.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-glass-border bg-glass-bg px-6 py-5 transition-all hover:border-gold/40"
                >
                  <span className="text-ivory">{illness.name}</span>
                  <ArrowUpRight
                    size={15}
                    className="text-ivory-dim transition-all group-hover:text-gold"
                  />
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      {/* Testimonials */}
      {doctorTestimonials.length > 0 && (
        <section className="border-t border-glass-border bg-ink-soft/60 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <h2 className="font-display text-3xl text-ivory">نظر بیماران</h2>
            </Reveal>
            <StaggerGroup className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {doctorTestimonials.map((t) => (
                <StaggerItem key={t.id}>
                  <div className="glass-panel h-full p-6">
                    <div className="flex gap-1 text-gold">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={12} className="fill-gold" />
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <p className="mt-4 text-xs text-ivory">{t.patientName}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Booking CTA */}
      <section className="border-t border-glass-border bg-ink-soft/60 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="font-display text-3xl text-ivory">
              آمادهٔ دیدار با {doctor.name} هستید؟
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ivory-dim">
              همین حالا نوبت آنلاین رزرو کنید تا در اولین زمان خالی از خدمات این
              پزشک در کلینیک ۴۰۴ بهره‌مند شوید.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link
                  href={`/booking?doctor=${doctor.slug}`}
                  className="flex items-center justify-center gap-2"
                >
                  <CalendarCheck size={16} /> رزرو نوبت با این پزشک
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link
                  href="/doctors"
                  className="flex items-center justify-center gap-2"
                >
                  مشاهدهٔ همهٔ پزشکان
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
