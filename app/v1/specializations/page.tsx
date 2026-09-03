import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PageHeader } from '../components/layout/page-header'
import { StaggerGroup, StaggerItem } from '../components/motion/reveal'
import { getSpecializations, getDoctors } from '../lib/data'
import { Icon } from '../lib/icon-map'
import { initials } from '../lib/utils'
import { formatter } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'تخصص‌ها | کلینیک ۴۰۴',
  description:
    'همهٔ تخصص‌های کلینیک ۴۰۴ را مرور کنید و پزشکان هر حوزه را بشناسید.',
}

export default async function SpecializationsPage() {
  const [specializations, doctors] = await Promise.all([
    getSpecializations(),
    getDoctors(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="حوزه‌های تخصصی"
        title="هر تخصص، همراه با پزشکان واقعی‌اش."
        description="هر حوزهٔ تخصصی در کلینیک ۴۰۴ توسط پزشک مشخصی پوشش داده می‌شود، نه نوبت‌دهی چرخشی. بر اساس تخصص مرور کنید تا ببینید چه کسی چه چیزی را درمان می‌کند."
      />

      <section className="mx-auto max-w-7xl px-6 pb-28">
        <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {specializations.map((s) => {
            const specDoctors = doctors.filter((d) =>
              d.specializationSlugs.includes(s.slug)
            )
            return (
              <StaggerItem key={s.slug}>
                <Link
                  href={`/specializations/${s.slug}`}
                  className="group glass-panel flex h-full flex-col p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage/20 text-sage-mist">
                      <Icon name={s.iconName} className="h-5 w-5" />
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-ivory-dim opacity-0 transition-all group-hover:opacity-100 group-hover:text-gold"
                    />
                  </div>
                  <h2 className="mt-6 font-display text-xl text-ivory">
                    {s.name}
                  </h2>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-ivory-dim">
                    {s.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-glass-border pt-4">
                    <div className="flex -space-x-2">
                      {specDoctors.slice(0, 3).map((d) => (
                        <span
                          key={d.slug}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-sage/30 text-[0.6rem] text-ivory"
                          title={d.name}
                        >
                          {initials(d.name)}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-sage-mist">
                      {specDoctors.length > 0
                        ? `${formatter.format(specDoctors.length)} پزشک`
                        : 'بدون پزشک'}
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      </section>
    </>
  )
}
