import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Icon } from '../../lib/icon-map'
import type { Specialization, Doctor } from '../../lib/data'
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '../../components/motion/reveal'

interface SpecializationsGridProps {
  specializations: Specialization[]
  doctors: Doctor[]
}

export function SpecializationsGrid({
  specializations,
  doctors,
}: SpecializationsGridProps) {
  const countBySlug = (slug: string) =>
    doctors.filter((d) => d.specializationSlugs.includes(slug)).length

  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold-soft">
              حوزه‌های تخصصی
            </p>
            <h2 className="mt-3 font-display text-4xl text-ivory md:text-5xl">
              {specializations.length} تخصص،{' '}
              <span className="italic text-sage-mist">در یک کلینیک.</span>
            </h2>
          </div>
          <Link
            href="/specializations"
            className="flex items-center gap-1.5 text-sm text-ivory-dim hover:text-ivory"
          >
            مشاهده همهٔ تخصص‌ها <ArrowUpRight size={14} />
          </Link>
        </div>
      </Reveal>

      <StaggerGroup className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {specializations.map((s) => {
          const count = countBySlug(s.slug)
          return (
            <StaggerItem key={s.slug}>
              <Link
                href={`/specializations/${s.slug}`}
                className="group glass-panel block h-full p-7 transition-all duration-500 hover:border-gold/40 hover:-translate-y-1"
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
                <h3 className="mt-6 font-display text-xl text-ivory">
                  {s.name}
                </h3>
                <p className="mt-1 text-xs font-mono uppercase tracking-[0.1em] text-sage-mist">
                  {s.shortName}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ivory-dim">
                  {s.description}
                </p>
                <p className="mt-6 text-xs text-ivory-dim">
                  {count} پزشک متخصص در این حوزه
                </p>
              </Link>
            </StaggerItem>
          )
        })}
      </StaggerGroup>
    </section>
  )
}
