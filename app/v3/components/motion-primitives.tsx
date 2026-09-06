'use client'

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useReducedMotion, useMotionValue, useSpring } from 'framer-motion'

export const ease = [0.22, 1, 0.36, 1] as const

export function ArrowIcon({ className = '', diagonal = false }: { className?: string; diagonal?: boolean }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {diagonal ? <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.3" /> : <path d="M3 12h17m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.3" />}
    </svg>
  )
}

export function Reveal({ children, className = '', delay = 0, id }: { children: ReactNode; className?: string; delay?: number; id?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div id={id} className={className} initial={{ opacity: 0, y: reduce ? 0 : 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduce ? 0.01 : 0.95, delay, ease }}>
      {children}
    </motion.div>
  )
}

export function MaskImage({ src, alt, className = '', parallax = true, priority = false }: { src: string; alt: string; className?: string; parallax?: boolean; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [inView, setInView] = useState(false)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-4%', '4%'])

  // whileInView(amount) deadlocks here: the element's own initial
  // clip-path (inset 0 0 0 100%) zeroes Chrome's intersectionRatio, so a
  // 0.12 threshold can never be crossed by the animation meant to open it.
  // A threshold-0 observer still fires on the isIntersecting flip, so the
  // reveal is driven from that instead.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduce) { setInView(true); return }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setInView(true)
        observer.disconnect()
      }
    }, { threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduce])

  return (
    <motion.div ref={ref} className={`mask-image ${className}`} initial={{ clipPath: reduce ? 'inset(0 0 0 0%)' : 'inset(0 0 0 100%)' }} animate={inView ? { clipPath: 'inset(0 0 0 0%)' } : undefined} transition={{ duration: reduce ? 0.01 : 1.4, ease }}>
      <motion.img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" width="1500" height="1800" style={{ y: parallax && !reduce ? y : 0 }} initial={{ scale: reduce ? 1 : 1.12 }} animate={inView ? { scale: 1 } : undefined} transition={{ duration: 1.7, ease }} />
    </motion.div>
  )
}

export function ArrowLink({ href, children, className = '', filled = false, light = false }: { href: string; children: ReactNode; className?: string; filled?: boolean; light?: boolean }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 180, damping: 18 })
  const springY = useSpring(y, { stiffness: 180, damping: 18 })
  const reduce = useReducedMotion()
  function move(e: MouseEvent<HTMLAnchorElement>) {
    if (reduce || window.matchMedia('(hover: none)').matches) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.05)
    y.set((e.clientY - r.top - r.height / 2) * 0.12)
  }
  return (
    <Link href={href} className={`arrow-link ${filled ? 'arrow-link--filled' : ''} ${light ? 'arrow-link--light' : ''} ${className}`} onMouseMove={move} onMouseLeave={() => { x.set(0); y.set(0) }}>
      <motion.span className="arrow-link-inner" style={{ x: springX, y: springY }}><span>{children}</span><span className="arrow-link-icon"><ArrowIcon /><ArrowIcon /></span></motion.span>
    </Link>
  )
}

export function SectionHeading({ eyebrow, children, description, className = '' }: { eyebrow: string; children: ReactNode; description?: ReactNode; className?: string }) {
  return (
    <Reveal className={`section-heading ${className}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{children}</h2>
      {description && <p className="section-description">{description}</p>}
    </Reveal>
  )
}
