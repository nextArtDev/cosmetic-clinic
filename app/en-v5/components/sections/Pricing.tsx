'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, X, Sparkles } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/Button'
import Reveal from '../ui/Reveal'
import { pricing, pricingIncluded } from '../../lib/site'
import { lockScroll } from '../providers/SmoothScroll'

type Key = keyof typeof pricing
const EASE = [0.16, 1, 0.3, 1] as const

export default function Pricing() {
  const [tab, setTab] = useState<Key>('classique')
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    let t: number | undefined
    if (open && !d.open) d.showModal()
    // Let the exit animation play before the native dialog closes.
    if (!open && d.open) t = window.setTimeout(() => d.open && d.close(), 320)
    lockScroll(open)
    return () => {
      if (t) window.clearTimeout(t)
      lockScroll(false)
    }
  }, [open])

  const data = pricing[tab]

  return (
    <section
      id="tarifs"
      className="nc:relative nc:overflow-hidden nc:bg-white nc:py-24 nc:sm:py-32"
    >
      <div className="nc:mx-auto nc:max-w-7xl nc:px-5 nc:sm:px-8">
        <SectionHeading
          eyebrow="Tarifs"
          align="center"
          title={'Une greffe de qualité\nà un prix *maîtrisé*'}
          description="Des fourchettes affichées, un devis ferme après consultation, et rien à rajouter le jour J. Le prix dépend uniquement du nombre de greffons et du type de cheveux."
        />

        {/* Hair switch tabs */}
        <Reveal delay={2} className="nc:mt-12 nc:flex nc:justify-center">
          <div
            role="tablist"
            aria-label="Type de cheveux"
            className="nc:relative nc:inline-flex nc:rounded-full nc:bg-fog nc:p-1.5 nc:ring-1 nc:ring-ink/5"
          >
            {(Object.keys(pricing) as Key[]).map((k) => {
              const active = tab === k
              return (
                <button
                  key={k}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(k)}
                  className={`nc:relative nc:z-10 nc:rounded-full nc:px-4 nc:py-2.5 nc:text-[13px] nc:font-semibold nc:transition-colors nc:duration-300 nc:sm:px-6 nc:sm:text-sm ${
                    active
                      ? 'nc:text-white'
                      : 'nc:text-ink/70 nc:hover:text-ink'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="hair-tab"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 32,
                      }}
                      className="nc:absolute nc:inset-0 nc:-z-10 nc:rounded-full nc:bg-ink nc:shadow-[0_8px_20px_-10px_rgba(12,13,14,.6)]"
                    />
                  )}
                  {pricing[k].label}
                </button>
              )
            })}
          </div>
        </Reveal>

        <div className="nc:mt-12 nc:grid nc:gap-8 nc:lg:grid-cols-12">
          {/* Price lines */}
          <div className="nc:lg:col-span-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <p className="nc:mb-4 nc:text-sm nc:text-graphite">
                  {data.hint}
                </p>
                <ul className="nc:overflow-hidden nc:rounded-[24px] nc:ring-1 nc:ring-ink/8">
                  {data.tiers.map((t, i) => (
                    <motion.li
                      key={t.name}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: EASE,
                        delay: 0.06 * i,
                      }}
                      className={`nc:group nc:relative nc:grid nc:grid-cols-[auto_1fr] nc:items-center nc:gap-x-4 nc:gap-y-2 nc:px-5 nc:py-6 nc:transition-colors nc:duration-500 nc:sm:grid-cols-[3rem_1.2fr_1fr_auto] nc:sm:px-7 ${
                        i !== 0 ? 'nc:border-t nc:border-ink/8' : ''
                      } ${t.highlight ? 'nc:bg-ink nc:text-white' : 'nc:bg-white nc:hover:bg-paper'}`}
                    >
                      <span
                        className={`nc:text-[12px] nc:font-bold nc:tracking-[0.18em] ${
                          t.highlight ? 'nc:text-sage-soft' : 'nc:text-graphite'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="nc:flex nc:items-center nc:gap-2.5">
                        <h3 className="nc:text-[1.3rem] nc:font-semibold nc:tracking-[-0.02em]">
                          {t.name}
                        </h3>
                        {t.highlight && (
                          <span className="nc:inline-flex nc:items-center nc:gap-1 nc:rounded-full nc:bg-sage-soft nc:px-2 nc:py-0.5 nc:text-[10px] nc:font-bold nc:uppercase nc:tracking-[0.14em] nc:text-sage-deep">
                            <Sparkles className="nc:size-3" /> Le plus demandé
                          </span>
                        )}
                      </div>
                      <div className="nc:col-span-2 nc:sm:col-span-1">
                        <p
                          className={`nc:text-[14px] nc:font-medium ${t.highlight ? 'nc:text-white/85' : 'nc:text-ink'}`}
                        >
                          {t.range}
                        </p>
                        <p
                          className={`nc:text-[12.5px] ${t.highlight ? 'nc:text-white/55' : 'nc:text-graphite'}`}
                        >
                          {t.note}
                        </p>
                      </div>
                      <div className="nc:col-span-2 nc:flex nc:items-end nc:justify-between nc:gap-3 nc:sm:col-span-1 nc:sm:block nc:sm:text-right">
                        <p className="nc:text-[1.05rem] nc:font-semibold nc:tracking-tight">
                          {t.price}
                        </p>
                        <p
                          className={`nc:text-[12px] ${t.highlight ? 'nc:text-sage-soft/80' : 'nc:text-graphite'}`}
                        >
                          {t.perGraft}
                        </p>
                      </div>
                      <span
                        className={`nc:pointer-events-none nc:absolute nc:bottom-0 nc:left-0 nc:h-[2px] nc:w-full nc:origin-left nc:scale-x-0 nc:transition-transform nc:duration-700 nc:ease-[cubic-bezier(.16,1,.3,1)] nc:group-hover:scale-x-100 ${
                          t.highlight ? 'nc:bg-sage-soft' : 'nc:bg-sage'
                        }`}
                      />
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            <div className="nc:mt-6 nc:flex nc:flex-wrap nc:items-center nc:gap-3">
              <Button href="/v5/diagnostic">Obtenir mon estimation</Button>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="nc:group nc:inline-flex nc:h-12 nc:items-center nc:gap-2 nc:rounded-full nc:px-4 nc:text-sm nc:font-semibold nc:text-ink nc:transition-colors nc:hover:bg-fog"
              >
                <span className="nc:grid nc:size-7 nc:place-items-center nc:rounded-full nc:bg-sage-soft nc:text-sage-deep nc:transition-transform nc:duration-500 nc:group-hover:rotate-[360deg]">
                  <Info className="nc:size-3.5" />
                </span>
                Comprendre nos tarifs
              </button>
            </div>
          </div>

          {/* Included */}
          <Reveal delay={3} className="nc:lg:col-span-4">
            <aside className="nc:sticky nc:top-28 nc:rounded-[24px] nc:bg-sage-mist nc:p-7 nc:ring-1 nc:ring-sage/10">
              <p className="eyebrow dot-sage nc:text-sage">Toujours inclus</p>
              <ul className="nc:mt-5 nc:space-y-3.5">
                {pricingIncluded.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.05 * i }}
                    className="nc:flex nc:items-start nc:gap-3 nc:text-[14px] nc:leading-snug nc:text-ink"
                  >
                    <span className="nc:mt-0.5 nc:grid nc:size-5 nc:shrink-0 nc:place-items-center nc:rounded-full nc:bg-sage nc:text-white">
                      <Check className="nc:size-3" strokeWidth={3} />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <p className="nc:mt-6 nc:border-t nc:border-sage/15 nc:pt-5 nc:text-[12.5px] nc:leading-relaxed nc:text-sage-deep/80">
                Les montants sont indicatifs et confirmés par un devis nominatif
                après consultation. Paiement en plusieurs fois possible.
              </p>
            </aside>
          </Reveal>
        </div>
      </div>

      {/* Details dialog */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false)
        }}
        className="nc:m-auto nc:w-[min(92vw,640px)] nc:rounded-[24px] nc:bg-transparent nc:p-0 nc:backdrop:bg-ink/60"
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="nc:relative nc:max-h-[82vh] nc:overflow-y-auto nc:rounded-[24px] nc:bg-white nc:p-7 nc:shadow-lift nc:sm:p-9"
              data-lenis-prevent
            >
              <div className="nc:mb-6 nc:flex nc:items-center nc:justify-between">
                <p className="eyebrow dot-sage nc:text-sage">
                  Informations tarifs
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="nc:grid nc:size-10 nc:place-items-center nc:rounded-full nc:text-ink nc:transition-all nc:hover:rotate-90 nc:hover:bg-fog"
                >
                  <X className="nc:size-5" />
                </button>
              </div>
              <h3 className="nc:text-2xl nc:font-semibold nc:tracking-[-0.03em]">
                Comprendre nos tarifs
              </h3>
              <div className="prose-sm nc:mt-5 nc:space-y-4 nc:text-[15px] nc:leading-relaxed nc:text-graphite">
                <p>
                  Une session dure une ou deux journées selon le nombre de
                  greffons. Les sessions les plus courantes se situent entre 3
                  500 et 6 500 greffons, réparties sur deux jours consécutifs
                  pour préserver la qualité des greffons et votre confort.
                </p>
                <p>
                  Le nombre de greffons est déterminé lors de la consultation :
                  surface à couvrir, densité souhaitée, calibre du cheveu et
                  capacité de la zone donneuse. Deux patients avec « la même
                  calvitie » peuvent recevoir des plans très différents.
                </p>
                <p>
                  Le tarif annoncé comprend l&apos;acte, le bloc, l&apos;équipe,
                  les soins post-opératoires, une séance de photothérapie LED et
                  une séance de mésothérapie, ainsi que les contrôles pendant
                  douze mois. Aucun supplément n&apos;est facturé le jour de
                  l&apos;intervention.
                </p>
                <p>
                  Pour les cheveux afro ou crépus, le follicule est courbe sous
                  la peau : l&apos;extraction est plus lente et demande une
                  expérience spécifique. C&apos;est la seule raison d&apos;un
                  tarif par greffon plus élevé.
                </p>
              </div>
              <div className="nc:mt-8">
                <Button href="/v5/diagnostic" onClick={() => setOpen(false)}>
                  Demander un devis personnalisé
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </dialog>
    </section>
  )
}
