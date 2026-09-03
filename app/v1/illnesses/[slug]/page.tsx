import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Star, Stethoscope } from 'lucide-react'
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '../../components/motion/reveal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getIllnesses, getSpecializations, getDoctors } from '../../lib/data'
import { initials } from '../../lib/utils'
import { formatter } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const illnesses = await getIllnesses()
  const illness = illnesses.find((i) => i.slug === slug)
  if (!illness) return {}
  return { title: `${illness.name} | کلینیک ۴۰۴`, description: illness.description }
}

export default async function IllnessDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [illnesses, specializations, doctors] = await Promise.all([
    getIllnesses(),
    getSpecializations(),
    getDoctors(),
  ])
  const illness = illnesses.find((i) => i.slug === slug)
  if (!illness) notFound()

  const treatingDoctors = doctors.filter((d) =>
    illness.doctorSlugs.includes(d.slug)
  )
  const relatedSpecs = specializations.filter((s) =>
    illness.specializationSlugs.includes(s.slug)
  )
  const bookingHref =
    treatingDoctors.length > 0
      ? `/v1/booking?doctor=${treatingDoctors[0].slug}`
      : '/v1/booking'

  return (
    <>
      <section className="relative overflow-hidden pt-40 pb-16 md:pt-48">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 right-1/3 h-[26rem] w-[26rem] rounded-full bg-gold/10 blur-[130px]" />
        </div>
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <Link
              href="/illnesses"
              className="text-xs text-ivory-dim hover:text-ivory"
            >
              → همهٔ بیماری‌ها
            </Link>
            <div className="mt-6 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/20 text-sage-mist">
                <Stethoscope size={20} />
              </span>
              <h1 className="font-display text-4xl text-ivory md:text-5xl">
                {illness.name}
              </h1>
            </div>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory-dim">
              {illness.description}
            </p>
            {relatedSpecs.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {relatedSpecs.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/specializations/${s.slug}`}
                  >
                    <Badge variant="secondary">{s.name}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {illness.symptoms.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <Reveal>
            <div className="glass-panel p-8">
              <h2 className="font-display text-2xl text-ivory">علائم</h2>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {illness.symptoms.map((symptom) => (
                  <li
                    key={symptom}
                    className="flex items-center gap-3 text-sm text-ivory-dim"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    {symptom}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-ivory-dim/70">
                این اطلاعات جنبهٔ عمومی دارد و تشخیص پزشکی نیست. برای راهنمایی
                متناسب با وضعیت خود، مشاوره بگیرید.
              </p>
            </div>
          </Reveal>
        </section>
      )}

      {treatingDoctors.length > 0 && (
        <section className="border-t border-glass-border bg-ink-soft/60 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <h2 className="font-display text-3xl text-ivory">
                پزشکان مرتبط با {illness.name}
              </h2>
            </Reveal>
            <StaggerGroup className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {treatingDoctors.map((d) => (
                <StaggerItem key={d.slug}>
                  <Link
                    href={`/doctors/${d.slug}`}
                    className="group glass-panel flex items-center gap-5 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sage-bright/40 to-sage/20 font-display text-xl text-ivory">
                      {initials(d.name)}
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-lg text-ivory">
                        {d.name}
                      </p>
                      <p className="text-xs text-ivory-dim">{d.title}</p>
                      <span className="mt-2 flex items-center gap-1 text-xs text-gold-soft">
                        <Star
                          size={11}
                          className="fill-gold-soft text-gold-soft"
                        />{' '}
                        {formatter.format(d.rating)}
                      </span>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="text-ivory-dim opacity-0 transition-all group-hover:opacity-100 group-hover:text-gold"
                    />
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <Reveal>
          <h2 className="font-display text-3xl text-ivory">
            آمادهٔ گفتگو با یک متخصص هستید؟
          </h2>
          <Button asChild size="lg" className="mt-6">
            <Link href={bookingHref}>رزرو نوبت مشاوره</Link>
          </Button>
        </Reveal>
      </section>
    </>
  )
}
