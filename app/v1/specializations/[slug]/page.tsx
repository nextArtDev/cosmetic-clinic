import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Star } from 'lucide-react'
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '../../components/motion/reveal'
import { Button } from '@/components/ui/button'
import { Icon } from '../../lib/icon-map'
import { getSpecializations, getDoctors, getIllnesses } from '../../lib/data'
import { initials } from '../../lib/utils'
import { formatter } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const specializations = await getSpecializations()
  const spec = specializations.find((s) => s.slug === slug)
  if (!spec) return {}
  return { title: `${spec.name} | کلینیک ۴۰۴`, description: spec.description }
}

export default async function SpecializationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [specializations, doctors, illnesses] = await Promise.all([
    getSpecializations(),
    getDoctors(),
    getIllnesses(),
  ])
  const spec = specializations.find((s) => s.slug === slug)
  if (!spec) notFound()

  const specDoctors = doctors.filter((d) =>
    d.specializationSlugs.includes(spec.slug)
  )
  const specIllnesses = illnesses.filter((i) =>
    i.specializationSlugs.includes(spec.slug)
  )

  return (
    <>
      <section className="relative overflow-hidden pt-40 pb-20 md:pt-48">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/3 h-[28rem] w-[28rem] rounded-full bg-sage/20 blur-[140px]" />
        </div>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <Link
              href="/specializations"
              className="text-xs text-ivory-dim hover:text-ivory"
            >
              → همهٔ تخصص‌ها
            </Link>
            <div className="mt-6 flex justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/20 text-sage-mist">
                <Icon name={spec.iconName} className="h-7 w-7" />
              </span>
            </div>
            <h1 className="mt-6 font-display text-5xl text-ivory md:text-6xl">
              {spec.name}
            </h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-sage-mist">
              {spec.shortName}
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ivory-dim">
              {spec.description}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <Reveal>
          <h2 className="font-display text-3xl text-ivory">
            پزشکان این تخصص
          </h2>
        </Reveal>
        <StaggerGroup className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {specDoctors.map((d) => (
            <StaggerItem key={d.slug}>
              <Link
                href={`/doctors/${d.slug}`}
                className="group glass-panel flex h-full flex-col p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40"
              >
                <div className="flex items-center gap-5">
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
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ivory-dim">
                  {d.brief}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-glass-border pt-4">
                  <span className="text-xs text-ivory-dim">
                    هزینهٔ مشاوره
                  </span>
                  <span className="font-display text-base text-gold-soft">
                    {formatter.format(d.consultFee)} تومان
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {specIllnesses.length > 0 && (
        <section className="border-t border-glass-border bg-ink-soft/60 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <h2 className="font-display text-3xl text-ivory">
                بیماری‌های مرتبط با {spec.name}
              </h2>
            </Reveal>
            <StaggerGroup className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specIllnesses.map((illness) => (
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
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <Reveal>
          <h2 className="font-display text-3xl text-ivory">
            نوبت با متخصص {spec.name} را رزرو کنید
          </h2>
          <Button asChild size="lg" className="mt-6">
            <Link href="/v1/booking">رزرو نوبت</Link>
          </Button>
        </Reveal>
      </section>
    </>
  )
}
