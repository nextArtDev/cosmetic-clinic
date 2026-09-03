import { Star } from 'lucide-react'
import type { Testimonial, Doctor } from '../../lib/data'
import { Reveal } from '../../components/motion/reveal'

interface TestimonialsProps {
  testimonials: Testimonial[]
  doctors: Doctor[]
}

function TestimonialCard({
  t,
  doctorName,
}: {
  t: Testimonial
  doctorName?: string
}) {
  return (
    <div className="glass-panel mx-3 w-[22rem] shrink-0 p-7">
      <div className="flex items-center gap-1 text-gold">
        {Array.from({ length: Math.max(1, Math.min(5, t.rating)) }).map(
          (_, i) => (
            <Star key={i} size={13} className="fill-gold" />
          ),
        )}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ivory-dim">
        &ldquo;{t.text}&rdquo;
      </p>
      <div className="mt-6 border-t border-glass-border pt-4">
        <p className="text-sm text-ivory">{t.patientName}</p>
        <p className="mt-0.5 text-xs text-ivory-dim">
          {doctorName ? `ویزیت‌شده توسط ${doctorName}` : 'بیمار کلینیک ۴۰۴'}
        </p>
      </div>
    </div>
  )
}

export function Testimonials({ testimonials, doctors }: TestimonialsProps) {
  const doctorName = (slug: string) =>
    doctors.find((d) => d.slug === slug)?.name
  const loop =
    testimonials.length > 0 ? [...testimonials, ...testimonials] : []
  return (
    <section className="border-y border-glass-border bg-ink-soft/60 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold-soft">
            تجربهٔ بیماران
          </p>
          <h2 className="mt-3 max-w-xl font-display text-4xl text-ivory md:text-5xl">
            مراقبتی که درباره‌اش{' '}
            <span className="italic text-sage-mist">می‌گویند.</span>
          </h2>
        </Reveal>
      </div>

      {loop.length > 0 ? (
        <div className="relative mt-14 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-soft to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-soft to-transparent" />
          <div className="flex w-max animate-marquee py-2 [animation-play-state:running] hover:[animation-play-state:paused]">
            {loop.map((t, i) => (
              <TestimonialCard
                key={`${t.id}-${i}`}
                t={t}
                doctorName={doctorName(t.doctorSlug)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
