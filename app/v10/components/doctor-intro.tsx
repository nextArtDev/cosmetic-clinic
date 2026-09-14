'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, BadgeCheck, Plus } from 'lucide-react'
import { Action, Eyebrow, Flower } from './ui'
import { CountUp, FadeUp, LineReveal, Magnetic, WordReveal } from './motion'
import { doctor } from '../lib/content'

/**
 * «دربارهٔ پزشک» — the doctor introduction the NERVANA port was missing.
 *
 * The original site had no such section (it sells a product, not a person),
 * so this is built from the route's own vocabulary rather than ported: the
 * two-column story layout from `app/v12/components/Story.tsx` (portrait
 * clip-reveal on one side, expandable copy on the other) re-skinned onto the
 * /v10 palette — beige ground, brown type, olive accents, the eight-petal
 * Flower as the recurring mark, mono indices in FarsiAdad.
 *
 * All scroll motion is owned by the parent Experience() timeline (it already
 * scopes GSAP to <main>), so this file stays presentational apart from the
 * expand toggle and the Framer entrance reveals.
 */
export function DoctorIntro() {
  const [expanded, setExpanded] = useState(false)
  const [rest, ...more] = doctor.bio

  return (
    <section className="doctor-section" id="doctor" data-theme="light" aria-labelledby="v10-doctor-heading">
      <div className="doctor-grid">
        {/* ---------------------------- Portrait --------------------------- */}
        <div className="doctor-media">
          <div className="doctor-portrait" data-cursor="discover">
            {/* The clip reveal is driven by the parent Experience() GSAP
                timeline, not by Framer: Framer silently fails to interpolate
                `clipPath: inset(...)` here, and — more importantly — an
                ancestor clipped to `inset(100%)` has an empty intersection
                rect, which also blocks `next/image`'s lazy loader. Hence the
                eager load below. */}
            <div className="doctor-portrait-inner">
              <Image
                src={doctor.portrait}
                alt={doctor.portraitAlt}
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
                loading="eager"
              />
            </div>
            <span className="doctor-badge">
              <BadgeCheck size={15} strokeWidth={1.4} />
              <span>بورد تخصصی زنان و زایمان</span>
            </span>
            <Flower className="doctor-portrait-flower" />
          </div>

          <div className="doctor-inset" data-cursor="discover">
            <Image
              src={doctor.clinicShot}
              alt={doctor.clinicShotAlt}
              fill
              sizes="(max-width: 900px) 42vw, 18vw"
            />
            <span className="doctor-inset-caption mono">در مطب · تهران</span>
          </div>

          <span className="doctor-media-index mono">۰۱ — پزشک</span>
        </div>

        {/* ------------------------------ Copy ----------------------------- */}
        <div className="doctor-copy">
          <FadeUp>
            <Eyebrow>{doctor.eyebrow}</Eyebrow>
          </FadeUp>

          <h2 id="v10-doctor-heading" className="doctor-title">
            <LineReveal>{doctor.title[0]}</LineReveal>
            <LineReveal delay={0.12}>
              <span className="doctor-title-mark">{doctor.title[1]}</span>
            </LineReveal>
          </h2>

          <p className="doctor-lead">
            <WordReveal text={doctor.lead} />
          </p>

          <FadeUp delay={0.1}>
            <p className="doctor-bio-first">{rest}</p>
          </FadeUp>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                className="doctor-bio-more"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {more.map((paragraph, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.1, duration: 0.5 }}
                  >
                    {paragraph}
                  </motion.p>
                ))}
                <p className="doctor-signature mono">{doctor.signature}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            className="doctor-toggle"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            data-cursor="view"
          >
            <span>{expanded ? 'بستن بیوگرافی' : 'بیشتر دربارهٔ من بخوانید'}</span>
            <motion.span animate={{ rotate: expanded ? 45 : 0 }} transition={{ duration: 0.35 }}>
              <Plus size={18} strokeWidth={1.2} />
            </motion.span>
          </button>

          {/* --------------------------- Stats ---------------------------- */}
          <div className="doctor-stats">
            {doctor.stats.map((stat, i) => (
              <FadeUp key={stat.label} delay={i * 0.08} y={26}>
                <div className="doctor-stat">
                  <strong className="doctor-stat-value">
                    <CountUp value={stat.value} />
                  </strong>
                  <span className="mono">{stat.label}</span>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* ------------------------ Credentials ------------------------- */}
          <FadeUp delay={0.15}>
            <div className="doctor-credentials">
              <span className="eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                <span>تحصیلات و گواهی‌ها</span>
              </span>
              <ul>
                {doctor.credentials.map((item) => (
                  <li key={item}>
                    <Flower />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          <Magnetic className="doctor-cta-wrap" cursor="book">
            <Action className="doctor-cta" href="#shop">
              رزرو نوبت
            </Action>
          </Magnetic>
        </div>
      </div>

      <FadeUp delay={0.1}>
        <figure className="doctor-quote">
          <Flower />
          <blockquote>{doctor.quote}</blockquote>
          <figcaption className="mono">
            {doctor.signature} <ArrowLeft size={14} strokeWidth={1.3} />
          </figcaption>
        </figure>
      </FadeUp>
    </section>
  )
}
