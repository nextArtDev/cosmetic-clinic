'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Plus } from 'lucide-react'
import { Action, Eyebrow, Flower } from './ui'
import { FadeUp, LineReveal, Magnetic, Marquee, WordReveal } from './motion'
import { DragScroller } from './drag-scroller'
import { serviceGroups } from '../lib/content'

/**
 * «خدمات تخصصی» — the service catalogue the port was missing entirely.
 *
 * NERVANA's equivalent band is a single product grid; an OB/GYN practice
 * needs a browsable, *categorised* list instead. The rail mechanic (pointer
 * drag + release inertia) is ported from `app/v6/components/DragScroller.tsx`
 * and the card reveal from the same route's `Treatments.tsx`; the type and
 * palette are the /v10 system's own.
 *
 * Four groups, sixteen services, every one the practice actually offers:
 * pregnancy care (preconception → postpartum → cerclage), gynaecologic
 * health (infections, abnormal bleeding, endometrial biopsy, Pap smear),
 * reconstructive surgery (labiaplasty / vaginoplasty and their candidacy
 * criteria) and aesthetics (filler, Botox, blepharoplasty, PRP, carboxy).
 * Cards expand in place so the detail never leaves the rail.
 */

const ALL = 'all'

export function Services() {
  const [filter, setFilter] = useState<string>(ALL)
  const [open, setOpen] = useState<string | null>(null)

  const groups = useMemo(
    () => (filter === ALL ? serviceGroups : serviceGroups.filter((group) => group.id === filter)),
    [filter],
  )

  // The marquee runs the whole catalogue, not just the filtered slice.
  const allNames = useMemo(() => serviceGroups.flatMap((group) => group.items.map((item) => item.name)), [])
  const total = allNames.length

  return (
    <section className="services-section" id="services" data-theme="light" aria-labelledby="v10-services-heading">
      <div className="services-head">
        <div className="services-head-main">
          <FadeUp>
            <Eyebrow>خدمات تخصصی</Eyebrow>
          </FadeUp>
          <h2 id="v10-services-heading">
            <LineReveal>هر آنچه برای سلامت</LineReveal>
            <LineReveal delay={0.1}>
              <span className="services-title-mark">زنان لازم دارید</span>
            </LineReveal>
          </h2>
        </div>
        <FadeUp delay={0.15} className="services-head-aside">
          <p>
            <WordReveal text="از مراقبت‌های روتین و پیشگیرانه تا جراحی‌های ظریف زیبایی؛ همه در یک مطب، با یک تیم ثابت و بدون ارجاع‌های سردرگم‌کننده." />
          </p>
          <span className="services-count mono">{total} خدمت تخصصی · ۴ دسته</span>
        </FadeUp>
      </div>

      {/* ------------------------------ Filters ---------------------------- */}
      <div className="services-filters" role="tablist" aria-label="دسته‌بندی خدمات">
        <button
          role="tab"
          aria-selected={filter === ALL}
          className={filter === ALL ? 'selected' : ''}
          onClick={() => { setFilter(ALL); setOpen(null) }}
          data-cursor="view"
        >
          <span>همه خدمات</span>
          <em className="mono">{serviceGroups.length}</em>
        </button>
        {serviceGroups.map((group) => (
          <button
            key={group.id}
            role="tab"
            aria-selected={filter === group.id}
            className={filter === group.id ? 'selected' : ''}
            onClick={() => { setFilter(group.id); setOpen(null) }}
            data-cursor="view"
          >
            <span>{group.title}</span>
            <em className="mono">{group.items.length}</em>
          </button>
        ))}
      </div>

      {/* ------------------------------- Rails ----------------------------- */}
      <div className="services-body">
        {groups.map((group) => (
          <motion.div
            className="service-group"
            key={group.id}
            style={{ ['--accent' as string]: group.accent }}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8% 0px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="service-group-head">
              <span className="service-group-index mono">{group.index}</span>
              <div>
                <h3>{group.title}</h3>
                <p>{group.subtitle}</p>
              </div>
              <span className="service-group-count mono">
                {group.items.length} خدمت
                <em aria-hidden="true">
                  <ArrowLeft size={13} strokeWidth={1.4} />
                  بکشید
                </em>
              </span>
            </div>

            <DragScroller className="service-rail">
              {group.items.map((item, index) => {
                const isOpen = open === item.id
                return (
                  <article
                    key={item.id}
                    className={`service-card ${isOpen ? 'is-open' : ''}`}
                    data-cursor="view"
                  >
                    <div className="service-card-top">
                      <span className="service-card-index mono">
                        {group.index}.{String(index + 1).padStart(2, '0')}
                      </span>
                      <Flower className="service-card-flower" />
                    </div>
                    <h4>{item.name}</h4>
                    <p className="service-card-text">{item.text}</p>

                    <AnimatePresence initial={false}>
                      {isOpen && item.detail && (
                        <motion.ul
                          className="service-card-detail"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {item.detail.map((line) => (
                            <li key={line}>
                              <Check size={14} strokeWidth={1.5} />
                              <span>{line}</span>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>

                    {item.detail && (
                      <button
                        className="service-card-toggle"
                        aria-expanded={isOpen}
                        aria-label={isOpen ? `بستن جزئیات ${item.name}` : `جزئیات ${item.name}`}
                        onClick={() => setOpen(isOpen ? null : item.id)}
                      >
                        <span>{isOpen ? 'بستن' : 'جزئیات'}</span>
                        <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
                          <Plus size={15} strokeWidth={1.4} />
                        </motion.span>
                      </button>
                    )}
                  </article>
                )
              })}
            </DragScroller>
          </motion.div>
        ))}
      </div>

      <FadeUp className="services-foot" delay={0.1}>
        <Magnetic cursor="book">
          <Action href="#shop">رزرو نوبت و مشاوره</Action>
        </Magnetic>
        <p className="services-note mono">
          نمی‌دانید کدام خدمت مناسب شماست؟ در یک تماس کوتاه راهنمایی می‌شویم.
        </p>
      </FadeUp>

      {/* Running list of every service — the band's closing motif. */}
      <Marquee className="services-marquee" speed={46}>
        {allNames.map((name) => (
          <span key={name}>
            {name} <Flower />
          </span>
        ))}
      </Marquee>
    </section>
  )
}
