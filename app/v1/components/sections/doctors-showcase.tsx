import Link from 'next/link'
import { ArrowUpRight, Star } from 'lucide-react'
import type { Doctor, Specialization } from '../../lib/data'
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '../../components/motion/reveal'
import { initials } from '../../lib/utils'

interface DoctorsShowcaseProps {
  doctors: Doctor[]
  specializations: Specialization[]
}

export function DoctorsShowcase({
  doctors,
  specializations,
}: DoctorsShowcaseProps) {
  const specName = (slug: string) =>
    specializations.find((s) => s.slug === slug)?.name ?? slug

  return (
    <section className="bg-ink-elevated/40 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold-soft">
                پزشکان ما
              </p>
              <h2 className="mt-3 font-display text-4xl text-ivory md:text-5xl">
                {doctors.length} پزشک،{' '}
                <span className="italic text-sage-mist">
                  که با وسواس انتخاب شده‌اند.
                </span>
              </h2>
            </div>
            <Link
              href="/doctors"
              className="flex items-center gap-1.5 text-sm text-ivory-dim hover:text-ivory"
            >
              مشاهدهٔ همهٔ پزشکان <ArrowUpRight size={14} />
            </Link>
          </div>
        </Reveal>

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => (
            <StaggerItem key={d.slug}>
              <Link
                href={`/doctors/${d.slug}`}
                className="group glass-panel flex h-full flex-col p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sage-bright/40 to-sage/20 font-display text-xl text-ivory">
                    {initials(d.name)}
                  </div>
                  <div>
                    <p className="font-display text-lg text-ivory">
                      {d.name}
                    </p>
                    <p className="text-xs text-ivory-dim">{d.title}</p>
                  </div>
                </div>

                <p className="mt-5 flex-1 text-sm leading-relaxed text-ivory-dim">
                  {d.brief}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-glass-border pt-4">
                  <span className="rounded-full bg-sage/15 px-3 py-1 text-[0.65rem] font-mono uppercase tracking-[0.08em] text-sage-mist">
                    {specName(d.primarySpecializationSlug)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gold-soft">
                    <Star
                      size={12}
                      className="fill-gold-soft text-gold-soft"
                    />{' '}
                    {d.rating}
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}

          <StaggerItem>
            <Link
              href="/booking"
              className="flex h-full flex-col items-start justify-between rounded-[1.25rem] border border-dashed border-glass-border p-7 text-ivory-dim transition-all duration-500 hover:border-gold/50 hover:text-ivory"
            >
              <ArrowUpRight size={20} />
              <div>
                <p className="font-display text-xl text-ivory">
                  مطمئن نیستید کدام پزشک را انتخاب کنید؟
                </p>
                <p className="mt-2 text-sm">
                  علائم‌تان را بگویید تا شما را با متخصص مناسب آشنا کنیم.
                </p>
              </div>
            </Link>
          </StaggerItem>
        </StaggerGroup>
      </div>
    </section>
  )
}
