'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, BadgeCheck, Clock3 } from 'lucide-react'
import SplitText from '../ui/SplitText'
import Button from '../ui/Button'
import Counter from '../ui/Counter'
import Marquee from '../ui/Marquee'
import { heroStats } from '../../lib/site'

const EASE = [0.16, 1, 0.3, 1] as const

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const yMain = useTransform(scrollYProgress, [0, 1], [0, 90])
  const ySmall = useTransform(scrollYProgress, [0, 1], [0, -70])
  const yCard = useTransform(scrollYProgress, [0, 1], [0, 140])
  const scaleMain = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  return (
    <section
      ref={ref}
      className="nc:relative nc:overflow-hidden nc:bg-white nc:pt-[104px] nc:sm:pt-[124px]"
    >
      {/* Backdrop */}
      <div className="nc:pointer-events-none nc:absolute nc:inset-0 nc:-z-10">
        <div className="nc:absolute nc:left-1/2 nc:top-[-20%] nc:h-[70vh] nc:w-[110vw] nc:-translate-x-1/2 nc:rounded-[100%] nc:bg-[radial-gradient(closest-side,rgba(212,233,214,.65),transparent)]" />
        <div className="nc:absolute nc:inset-0 nc:bg-[linear-gradient(rgba(12,13,14,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(12,13,14,.035)_1px,transparent_1px)] nc:bg-[size:72px_72px] nc:[mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>

      <div className="nc:mx-auto nc:grid nc:max-w-7xl nc:items-center nc:gap-12 nc:px-5 nc:sm:px-8 nc:lg:grid-cols-12 nc:lg:gap-8">
        {/* Copy */}
        <div className="nc:lg:col-span-6">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="eyebrow dot-sage nc:mb-6 nc:text-sage"
          >
            Centre de greffe capillaire — Paris 14e
          </motion.p>

          <SplitText
            as="h1"
            trigger={false}
            delay={0.25}
            text={'Greffe de cheveux\n*premium* à Paris'}
            className="letterpress-dark text-balance nc:text-[clamp(2.7rem,7vw,5.6rem)] nc:font-semibold nc:leading-[0.98] nc:tracking-[-0.04em]"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.75 }}
            className="nc:mt-7 nc:max-w-xl nc:text-[17px] nc:leading-relaxed nc:text-graphite nc:md:text-lg"
          >
            Un diagnostic médical personnalisé, la technique FUE Saphir, des
            tarifs annoncés avant l&apos;intervention et un suivi pendant douze
            mois. Rien de plus, rien de caché.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
            className="nc:mt-9 nc:flex nc:flex-wrap nc:items-center nc:gap-3"
          >
            <Button href="/v5/diagnostic" size="lg">
              Demander un diagnostic
            </Button>
            <Button
              href="/v5/#fue-saphir"
              variant="outline"
              size="lg"
              icon="arrow"
            >
              FUE Saphir
            </Button>
          </motion.div>

          {/* Profile quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.1 }}
            className="nc:mt-8 nc:flex nc:flex-wrap nc:items-center nc:gap-x-2 nc:gap-y-2 nc:text-sm nc:text-graphite"
          >
            <span className="nc:mr-1">Pour les cheveux</span>
            {[
              { label: 'homme', href: '/v5/diagnostic?profil=homme' },
              { label: 'femme', href: '/v5/diagnostic?profil=femme' },
              { label: 'afro ou crépus', href: '/v5/diagnostic?profil=afro' },
            ].map((p, i) => (
              <Link
                key={p.label}
                href={p.href}
                className="nc:group nc:inline-flex nc:items-center nc:gap-1 nc:rounded-full nc:border nc:border-ink/12 nc:bg-white/70 nc:px-3.5 nc:py-1.5 nc:font-semibold nc:text-ink nc:transition-all nc:duration-300 nc:hover:-translate-y-0.5 nc:hover:border-ink nc:hover:bg-ink nc:hover:text-white"
                style={{ transitionDelay: `${i * 20}ms` }}
              >
                {p.label}
                <ArrowUpRight className="nc:size-3.5 nc:transition-transform nc:duration-300 nc:group-hover:rotate-45" />
              </Link>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.25 }}
            className="nc:mt-12 nc:grid nc:max-w-xl nc:grid-cols-3 nc:divide-x nc:divide-ink/10 nc:border-t nc:border-ink/10 nc:pt-6"
          >
            {heroStats.map((s, i) => (
              <div key={s.label} className={i === 0 ? 'nc:pr-4' : 'nc:px-4'}>
                <dt className="nc:sr-only">{s.label}</dt>
                <dd className="nc:text-[clamp(1.5rem,3vw,2.2rem)] nc:font-semibold nc:tracking-[-0.03em] nc:text-ink">
                  <Counter
                    value={s.value}
                    suffix={s.suffix}
                    format={s.format}
                    duration={1.8}
                  />
                </dd>
                <dd className="nc:mt-1 nc:text-[12px] nc:leading-snug nc:text-graphite nc:sm:text-[13px]">
                  {s.label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Bento gallery */}
        <div className="nc:relative nc:lg:col-span-6">
          <div
            className="nc:grid nc:grid-cols-12 nc:grid-rows-6 nc:gap-3 nc:sm:gap-4"
            style={{ height: 'min(78vw, 640px)' }}
          >
            <motion.div
              style={{ y: yMain }}
              initial={{
                opacity: 0,
                clipPath: 'inset(12% 12% 12% 12% round 32px)',
              }}
              animate={{
                opacity: 1,
                clipPath: 'inset(0% 0% 0% 0% round 32px)',
              }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
              className="nc:relative nc:col-span-8 nc:row-span-6 nc:overflow-hidden"
            >
              <motion.div
                style={{ scale: scaleMain }}
                className="hero-shape nc:absolute nc:inset-0 nc:overflow-hidden"
              >
                <Image
                  src="/v5/images/hero-main.webp"
                  alt="Deux praticiennes réalisent une greffe de cheveux dans un bloc lumineux"
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 70vw"
                  className="nc:object-cover"
                />
                <div className="nc:absolute nc:inset-0 nc:bg-gradient-to-t nc:from-ink/35 nc:via-transparent nc:to-transparent" />
              </motion.div>

              {/* Floating badge */}
              <motion.div
                style={{ y: yCard }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: EASE, delay: 1.2 }}
                className="frosted nc:absolute nc:bottom-5 nc:left-5 nc:right-5 nc:flex nc:items-center nc:gap-3 nc:rounded-2xl nc:p-3 nc:shadow-soft nc:ring-1 nc:ring-white/60 nc:sm:bottom-7 nc:sm:left-7 nc:sm:right-auto nc:sm:pr-6"
              >
                <span className="nc:relative nc:grid nc:size-10 nc:shrink-0 nc:place-items-center nc:rounded-full nc:bg-sage nc:text-white">
                  <Clock3 className="nc:size-4" />
                  <span className="pulse-dot nc:absolute nc:-right-0.5 nc:-top-0.5 nc:size-2.5 nc:rounded-full nc:bg-sage" />
                </span>
                <div className="nc:leading-tight">
                  <p className="nc:text-[13px] nc:font-semibold">
                    Analyse capillaire sous 72 h
                  </p>
                  <p className="nc:text-[12px] nc:text-graphite">
                    Réponse médicale, sans engagement
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              style={{ y: ySmall }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.6 }}
              className="nc:group nc:relative nc:col-span-4 nc:row-span-3 nc:overflow-hidden nc:rounded-[20px] nc:sm:rounded-[24px]"
            >
              <Image
                src="/v5/images/hero-detail.webp"
                alt="Greffons préparés sur un plateau stérile, lame saphir"
                fill
                sizes="(min-width: 1024px) 18vw, 30vw"
                className="nc:object-cover nc:transition-transform nc:duration-[1.4s] nc:ease-[cubic-bezier(.16,1,.3,1)] nc:group-hover:scale-110"
              />
            </motion.div>

            <motion.div
              style={{ y: ySmall }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.8 }}
              className="nc:group nc:relative nc:col-span-4 nc:row-span-3 nc:overflow-hidden nc:rounded-[20px] nc:bg-ink nc:text-white nc:sm:rounded-[24px]"
            >
              <Image
                src="/v5/images/clinic.webp"
                alt="Accueil du centre NOVA Capillaire à Paris"
                fill
                sizes="(min-width: 1024px) 18vw, 30vw"
                className="nc:object-cover nc:opacity-80 nc:transition-transform nc:duration-[1.4s] nc:ease-[cubic-bezier(.16,1,.3,1)] nc:group-hover:scale-110"
              />
              <div className="nc:absolute nc:inset-0 nc:bg-gradient-to-t nc:from-ink/80 nc:via-ink/20 nc:to-transparent" />
              <div className="nc:absolute nc:inset-x-0 nc:bottom-0 nc:p-3 nc:sm:p-4">
                <p className="nc:flex nc:items-center nc:gap-1.5 nc:text-[11px] nc:font-bold nc:uppercase nc:tracking-[0.18em] nc:text-sage-soft">
                  <BadgeCheck className="nc:size-3.5" /> Le centre
                </p>
                <p className="nc:mt-1 nc:text-[12px] nc:leading-snug nc:text-white/85 nc:sm:text-[13px]">
                  Bd du Montparnasse, Paris 14e
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="nc:mt-16 nc:border-y nc:border-ink/[0.07] nc:sm:mt-20">
        <Marquee
          items={[
            'FUE Saphir',
            'Diagnostic sous 72 h',
            'Suivi 12 mois',
            'Tarifs transparents',
            'Cheveux homme · femme · afro',
            'Paris Montparnasse',
          ]}
        />
      </div>
    </section>
  )
}
