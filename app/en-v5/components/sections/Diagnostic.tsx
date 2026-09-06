'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock3, ShieldCheck, Stethoscope } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../ui/Reveal'
import DiagnosticForm from '../forms/DiagnosticForm'

const reassurance = [
  { icon: Stethoscope, text: 'Analyse relue par un médecin' },
  { icon: Clock3, text: 'Réponse sous 72 h ouvrées' },
  { icon: ShieldCheck, text: 'Données hébergées en France' },
]

export default function Diagnostic() {
  return (
    <section
      id="diagnostic"
      className="nc:relative nc:overflow-hidden nc:bg-paper nc:py-24 nc:sm:py-32"
    >
      <div className="nc:mx-auto nc:max-w-7xl nc:px-5 nc:sm:px-8">
        <div className="nc:grid nc:gap-12 nc:lg:grid-cols-12 nc:lg:gap-14">
          <div className="nc:lg:col-span-5">
            <SectionHeading
              eyebrow="Diagnostic en ligne"
              title={'Faites le point\nsur votre *situation* capillaire'}
              description="Trois étapes, deux minutes. Vous décrivez votre situation, nous revenons vers vous avec une première lecture médicale et une fourchette de greffons."
            />

            <Reveal delay={3} className="nc:mt-10">
              <div className="nc:relative nc:aspect-[16/11] nc:overflow-hidden nc:rounded-[24px] nc:shadow-soft">
                <Image
                  src="/v5/images/diagnostic.webp"
                  alt="Analyse du cuir chevelu au trichoscope numérique"
                  fill
                  sizes="(min-width:1024px) 38vw, 100vw"
                  className="nc:object-cover"
                />
                <div className="nc:absolute nc:inset-0 nc:bg-gradient-to-t nc:from-ink/60 nc:to-transparent" />
                <div className="nc:absolute nc:inset-x-5 nc:bottom-5 nc:flex nc:flex-wrap nc:gap-2">
                  {reassurance.map((r, i) => (
                    <motion.span
                      key={r.text}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: 0.1 * i,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="frosted nc:inline-flex nc:items-center nc:gap-2 nc:rounded-full nc:px-3 nc:py-1.5 nc:text-[12px] nc:font-semibold nc:text-ink nc:ring-1 nc:ring-white/60"
                    >
                      <r.icon className="nc:size-3.5 nc:text-sage" />
                      {r.text}
                    </motion.span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={2} className="nc:lg:col-span-7">
            <div className="nc:rounded-[28px] nc:bg-white nc:p-6 nc:shadow-soft nc:ring-1 nc:ring-ink/5 nc:sm:p-9">
              <DiagnosticForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
