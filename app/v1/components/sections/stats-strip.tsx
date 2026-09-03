import { Counter } from '../../components/motion/counter'

interface StatsStripProps {
  doctorCount: number
  personnelCount: number
  illnessCount: number
  avgRating: number
}

export function StatsStrip({
  doctorCount,
  personnelCount,
  illnessCount,
  avgRating,
}: StatsStripProps) {
  const stats = [
    { value: doctorCount, label: 'پزشک متخصص', suffix: '', decimals: 0 },
    { value: personnelCount, label: 'عضو تیم مراقبت', suffix: '', decimals: 0 },
    { value: illnessCount, label: 'بیماری درمان‌شده', suffix: '', decimals: 0 },
    { value: avgRating, label: 'میانگین رضایت', suffix: '', decimals: 1 },
  ]

  return (
    <section className="border-y border-glass-border bg-ink-soft/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <p className="font-display text-4xl text-ivory md:text-5xl">
              <Counter
                value={s.value}
                suffix={s.suffix}
                decimals={s.decimals ?? 0}
              />
            </p>
            <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ivory-dim">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
