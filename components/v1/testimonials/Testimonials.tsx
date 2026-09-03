import { Star } from 'lucide-react'
import type { V1Testimonial, V1Doctor } from '@/lib/v1/data'

interface TestimonialsProps {
  testimonials: V1Testimonial[]
  doctors: V1Doctor[]
}

export function Testimonials({ testimonials, doctors }: TestimonialsProps) {
  const doctorName = (slug: string) =>
    doctors.find((d) => d.slug === slug)?.name
  const loop = [...testimonials, ...testimonials]

  return (
    <section className="mx-auto max-w-7xl px-4">
      <h2 className="v1-title-gradient mb-8 text-center text-2xl font-bold md:text-4xl">
        تجربهٔ بیماران
      </h2>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#59c7dd] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#59c7dd] to-transparent" />
        <div className="flex w-max animate-marquee gap-5 py-2 [animation-play-state:running] hover:[animation-play-state:paused]">
          {loop.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="v1-glass v1-shadow w-[22rem] shrink-0 rounded-2xl p-6"
            >
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: Math.max(1, Math.min(5, t.rating)) }).map(
                  (_, j) => (
                    <Star key={j} size={13} className="fill-amber-500" />
                  ),
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-black/70">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-4 border-t border-black/10 pt-3">
                <p className="text-sm font-semibold text-teal-900">
                  {t.patientName}
                </p>
                <p className="text-xs text-black/50">
                  {doctorName(t.doctorSlug)
                    ? `ویزیت‌شده توسط ${doctorName(t.doctorSlug)}`
                    : 'بیمار کلینیک کوثر'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
