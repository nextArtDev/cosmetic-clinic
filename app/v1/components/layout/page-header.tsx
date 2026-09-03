import { Reveal } from '../../components/motion/reveal'

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: string
}) {
  return (
    <section className="relative overflow-hidden pt-40 pb-20 md:pt-48 md:pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/3 h-[26rem] w-[26rem] rounded-full bg-sage/20 blur-[130px]" />
      </div>
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold-soft">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] text-ivory md:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ivory-dim">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
