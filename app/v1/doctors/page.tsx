import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Clock3, Star } from 'lucide-react'
import { PageHeader } from '../components/layout/page-header'
import { StaggerGroup, StaggerItem } from '../components/motion/reveal'
import { getDoctors, getSpecializations } from '../lib/data'
import { initials } from '../lib/utils'

export const metadata: Metadata = {
  title: 'پزشکان | کلینیک ۴۰۴',
  description:
    'با پزشکان متخصص کلینیک ۴۰۴ آشنا شوید و برای هر یک نوبت آنلاین رزرو کنید.',
}

export default async function DoctorsPage() {
  const [doctors, specializations] = await Promise.all([
    getDoctors(),
    getSpecializations(),
  ])

  const specName = (slug: string) =>
    specializations.find((s) => s.slug === slug)?.name ?? slug

  return (
    <>
      <PageHeader
        eyebrow="پزشکان کلینیک"
        title="پنج متخصص، برگزیده برای شنیدن."
        description="هر پزشک کلینیک ۴۰۴ دارای مدرک تخصصی است و هم برای عمق دانش بالینی و هم برای نحوهٔ برخورد با بیمار برگزیده شده است. پروفایل‌ها را بگردید تا پزشک مناسب خود را بیابید — یا بگذارید اولین نوبت خالی تصمیم را برایتان بگیرد."
      />

      <section className="mx-auto max-w-7xl px-6 pb-28">
        <StaggerGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {doctors.map((d) => (
            <StaggerItem key={d.slug}>
              <Link
                href={`/doctors/${d.slug}`}
                className="group glass-panel flex h-full flex-col gap-6 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 sm:flex-row"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sage-bright/40 to-sage/20 font-display text-2xl text-ivory">
                  {initials(d.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-xl text-ivory">
                        {d.name}
                      </p>
                      <p className="text-xs text-ivory-dim">{d.title}</p>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="mt-1 shrink-0 text-ivory-dim opacity-0 transition-all group-hover:opacity-100 group-hover:text-gold"
                    />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ivory-dim">
                    {d.brief}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-sage/15 px-3 py-1 text-[0.65rem] font-mono uppercase tracking-[0.08em] text-sage-mist">
                      {specName(d.primarySpecializationSlug)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gold-soft">
                      <Star
                        size={12}
                        className="fill-gold-soft text-gold-soft"
                      />{' '}
                      {d.rating} ({d.reviewCount} نظر)
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ivory-dim">
                      <Clock3 size={12} /> {d.nextAvailable}
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}

          <StaggerItem>
            <Link
              href="/booking"
              className="group flex h-full flex-col items-start justify-between rounded-[1.25rem] border border-dashed border-glass-border p-8 text-ivory-dim transition-all duration-500 hover:border-gold/50 hover:text-ivory"
            >
              <ArrowUpRight size={20} className="text-gold-soft" />
              <div className="mt-10">
                <p className="font-display text-xl text-ivory">
                  مطمئن نیستید کدام پزشک را انتخاب کنید؟
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  یک نوبت مشاوره رزرو کنید تا علائم‌تان را بگویید و ما شما را با
                  متخصص مناسب آشنا کنیم.
                </p>
              </div>
            </Link>
          </StaggerItem>
        </StaggerGroup>
      </section>
    </>
  )
}
