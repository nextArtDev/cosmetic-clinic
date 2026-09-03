import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Illness } from '../../lib/data'
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '../../components/motion/reveal'

interface IllnessesGridProps {
  illnesses: Illness[]
}

export function IllnessesGrid({ illnesses }: IllnessesGridProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold-soft">
              بیماری‌های درمان‌شده
            </p>
            <h2 className="mt-3 font-display text-4xl text-ivory md:text-5xl">
              {illnesses.length} بیماری که{' '}
              <span className="italic text-sage-mist">در عمق می‌شناسیم.</span>
            </h2>
          </div>
          <Link
            href="/illnesses"
            className="flex items-center gap-1.5 text-sm text-ivory-dim hover:text-ivory"
          >
            مشاهدهٔ همهٔ بیماری‌ها <ArrowUpRight size={14} />
          </Link>
        </div>
      </Reveal>

      <StaggerGroup
        className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2"
        stagger={0.05}
      >
        {illnesses.map((illness) => (
          <StaggerItem key={illness.slug}>
            <Link
              href={`/illnesses/${illness.slug}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-glass-border bg-glass-bg px-6 py-5 transition-all duration-300 hover:border-gold/40 hover:bg-glass-bg-strong"
            >
              <div>
                <p className="font-display text-lg text-ivory">
                  {illness.name}
                </p>
                <p className="mt-1 text-xs text-ivory-dim line-clamp-1">
                  {illness.symptoms.slice(0, 3).join(' · ')}
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="shrink-0 text-ivory-dim transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold"
              />
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}
