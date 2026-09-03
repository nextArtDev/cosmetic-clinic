import Link from 'next/link'
import type { V1Specialization } from '@/lib/v1/data'
import { cn } from '@/lib/utils'

interface SpecializationsCarouselProps {
  specializations: V1Specialization[]
}

/**
 * Specialization chips grid — replaces kosar's Slider with a clean,
 * clickable list linking to `/v1/specializations/:slug`.
 */
export function SpecializationsCarousel({
  specializations,
}: SpecializationsCarouselProps) {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <h2 className="v1-title-gradient text-center text-2xl font-bold md:text-4xl">
          تخصص‌های ما
        </h2>
        <p className="max-w-xl text-center text-sm font-medium text-black/60">
          از بین تخصص‌های زیر، حوزهٔ موردنظر خود را انتخاب کنید و با پزشکان
          مرتبط آشنا شوید.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {specializations.map((s) => (
          <Link
            key={s.slug}
            href={`/v1/specializations/${s.slug}`}
            className={cn(
              'v1-glass v1-shadow group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-teal-900 transition-transform hover:-translate-y-0.5 hover:scale-[1.03]',
            )}
          >
            {s.name}
            <span className="text-teal-700/50 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
        <Link
          href="/v1/specializations"
          className="rounded-xl bg-black/70 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
        >
          همه تخصص‌ها
        </Link>
      </div>
    </section>
  )
}
