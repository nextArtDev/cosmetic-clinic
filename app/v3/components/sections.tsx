'use client'

import { useEffect, useId, useState, type MouseEvent } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { offers, projects, testimonials, type Project } from '../lib/content'
import { ArrowIcon, ArrowLink, MaskImage, Reveal, SectionHeading, ease } from './motion-primitives'

export function ClientMarquee() {
  const names = [
    'بیمارستان فوق تخصصی',
    'انجمن جراحان پلاستیک',
    'انجمن رینولوژی ایران',
    'مرکز تصویربرداری پیشرفته',
    'بیمارستان بین‌المللی',
    'انجمن لیزر و زیبایی',
    'آزمایشگاه مرجع پاتولوژی',
    'مرکز توانبخشی پس از جراحی',
  ]
  return (
    <div className="client-marquee" aria-label="همکاران و مراکز مورد اعتماد">
      <div className="client-track">{[0, 1].map(copy => <div className="client-group" key={copy} aria-hidden={copy === 1}>{names.map(name => <div className="client-logo" key={name}><span>{name}</span></div>)}</div>)}</div>
    </div>
  )
}

export function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false)
  const x = useMotionValue(0); const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 23 })
  const sy = useSpring(y, { stiffness: 180, damping: 23 })
  function move(event: MouseEvent<HTMLAnchorElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - rect.left - 46); y.set(event.clientY - rect.top - 46)
  }
  return (
    <motion.article className="project-card" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.5, ease }}>
      <Link className="project-image-link" href={`/v3/nemune/${project.slug}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onMouseMove={move} aria-label={`نمایش جزئیات ${project.name}`}>
        <MaskImage src={project.image} alt={`${project.name} — ${project.description}`} className="project-image" />
        <motion.span className="project-cursor" style={{ x: sx, y: sy }} animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.65 }} transition={{ duration: 0.25 }} aria-hidden="true"><ArrowIcon diagonal /><span>مشاهده</span></motion.span>
      </Link>
      <div className="project-caption"><div><Link href={`/v3/nemune/${project.slug}`}>{project.name}</Link><p>{project.category}</p></div><Link href={`/v3/nemune/${project.slug}`} className="project-arrow" aria-label={`نمایش ${project.name}`}><ArrowIcon diagonal /></Link></div>
    </motion.article>
  )
}

export function ProjectGrid({ editorial = false, filterable = false }: { editorial?: boolean; filterable?: boolean }) {
  const [category, setCategory] = useState('همه موارد')
  const categories = ['همه موارد', 'صورت و بینی', 'بدن و اندام', 'تزریقات و پوست']
  const filtered = category === 'همه موارد' ? projects : projects.filter(project => project.category === category)
  return (
    <div>
      {filterable && <div className="project-filters" role="group" aria-label="فیلتر خدمات">{categories.map(item => <button key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}<span>{item === 'همه موارد' ? '۰۶' : `۰${projects.filter(project => project.category === item).length}`}</span></button>)}</div>}
      <motion.div layout className={`project-grid ${editorial ? 'project-grid--editorial' : ''}`}><AnimatePresence mode="popLayout">{filtered.map(project => <ProjectCard key={project.slug} project={project} />)}</AnimatePresence></motion.div>
      {filterable && <p className="project-count" role="status">{filtered.length} مورد برای مشاهده</p>}
    </div>
  )
}

export function OfferCards() {
  return (
    <div className="offer-grid">{offers.map((offer, index) => <Reveal className="offer-card" key={offer.id} delay={index * 0.09}>
      <Link href={`/v3/khadamat#${offer.id}`} className="offer-image-link" aria-label={`آشنایی با ${offer.name}`}><MaskImage src={offer.image} alt={`${offer.name} — ${offer.description}`} className="offer-image" parallax={false} /><span className="offer-number">۰{index + 1}</span><span className="offer-arrow"><ArrowIcon diagonal /></span></Link>
      <div className="offer-copy"><p className="eyebrow">{offer.label}</p><h3><Link href={`/v3/khadamat#${offer.id}`}>{offer.name}</Link></h3><p className="offer-description">{offer.description}</p></div>
    </Reveal>)}</div>
  )
}

export function Accordion({ items, firstOpen = true }: { items: { title: string; text: string }[]; firstOpen?: boolean }) {
  const [active, setActive] = useState<number | null>(firstOpen ? 0 : null)
  const id = useId()
  return (
    <div className="accordion">{items.map((item, index) => <div className={`accordion-item ${active === index ? 'is-open' : ''}`} key={item.title}>
      <h3><button id={`${id}-button-${index}`} aria-expanded={active === index} aria-controls={`${id}-panel-${index}`} onClick={() => setActive(active === index ? null : index)}><span className="accordion-index">۰{index + 1}</span><span>{item.title}</span><motion.span className="accordion-plus" animate={{ rotate: active === index ? 45 : 0 }} transition={{ duration: 0.3 }} aria-hidden="true">+</motion.span></button></h3>
      <AnimatePresence initial={false}>{active === index && <motion.div id={`${id}-panel-${index}`} role="region" aria-labelledby={`${id}-button-${index}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease }}><div className="accordion-content"><p>{item.text}</p><ArrowLink href="/v3/tamas">گفت‌وگو در موردش</ArrowLink></div></motion.div>}</AnimatePresence>
    </div>)}</div>
  )
}

export function Testimonials() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => setIndex(i => (i + 1) % testimonials.length), 10000)
    return () => clearInterval(timer)
  }, [paused])
  return (
    <section id="nazarat" className="testimonials" aria-roledescription="اسلایدر" aria-label="نظرات مراجعان" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <SectionHeading eyebrow="اعتماد، مهم‌تر از همه">نظرات مراجعان،<br /><em>بهترین معرفی ما.</em></SectionHeading>
      <div className="testimonials-stars" aria-label="۵ ستاره از ۵">★★★★★</div>
      <div className="testimonial-stage" aria-live={paused ? 'polite' : 'off'}><AnimatePresence mode="wait"><motion.blockquote key={index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease }}><p>« {testimonials[index].quote} »</p><footer><strong>{testimonials[index].name}</strong><span>{testimonials[index].company}</span></footer></motion.blockquote></AnimatePresence></div>
      <div className="testimonial-controls"><button onClick={() => setIndex((index - 1 + testimonials.length) % testimonials.length)} aria-label="نظر قبلی"><ArrowIcon /></button><span>۰{index + 1} <span className="testimonial-divider" /> ۰{testimonials.length}</span><button onClick={() => setIndex((index + 1) % testimonials.length)} aria-label="نظر بعدی"><ArrowIcon /></button></div>
    </section>
  )
}

export function ContactBand() {
  return (
    <section className="contact-band" data-header-theme="light">
      <Reveal><span className="contact-flower" aria-hidden="true">❊</span><p className="eyebrow">وقت آن است که از خودتان مراقبت کنید.</p><h2>ما با مراجعانی کار می‌کنیم که به دنبال نتیجه‌ای <em>طبیعی و امن</em> هستند.</h2><ArrowLink href="/v3/tamas" filled light>رزرو نوبت مشاوره</ArrowLink><p className="contact-band-note">پاسخ‌گویی کمتر از ۲۴ ساعت — بدون تعهد</p></Reveal>
    </section>
  )
}
