'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarCheck, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GsapSheen } from '../../components/motion/gsap-sheen'
import { initials } from '../../lib/utils'
import type { Doctor } from '../../lib/data'

interface HeroProps {
  featured?: Doctor
  doctorCount: number
  avgRating: number
}

export function Hero({ featured, doctorCount, avgRating }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-40 pb-28 md:pt-52 md:pb-36">
      {/* Ambient glow field */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-[32rem] w-[32rem] rounded-full bg-sage/25 blur-[140px]" />
        <div className="absolute top-20 right-0 h-[26rem] w-[26rem] rounded-full bg-gold/10 blur-[130px]" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-gold-soft"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {doctorCount} پزشک متخصص · بدون نیاز به معرفی‌نامه
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl leading-[1.1] tracking-tight text-ivory md:text-7xl"
          >
            مراقبت خصوصی،
            <br />
            <span className="text-gradient-gold italic">
              سنجیده‌شده در دقیقه،
            </span>
            <br />
            نه در هفته‌ها.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-8 max-w-lg text-lg leading-relaxed text-ivory-dim"
          >
            کلینیک ۴۰۴ پنج پزشک متخصص و تیمی دوازده‌نفره را با سامانهٔ
            نوبت‌دهی آنلاین کنار هم آورده است؛ بدون صف و بدون انتظار. پزشک،
            بیماری یا حتی نزدیک‌ترین ساعت خالی را خودتان انتخاب کنید.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Button asChild size="lg">
              <Link href="/v1/booking" className="flex items-center gap-2">
                رزرو نوبت <ArrowUpRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/v1/doctors">آشنایی با پزشکان</Link>
            </Button>
          </motion.div>
        </div>

        {/* Signature liquid-glass consult widget */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-sm animate-float"
        >
          <div className="glass-panel relative p-7">
            <GsapSheen />
            <div className="relative flex items-center justify-between">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-sage-mist">
                اولین نوبت خالی
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-sage/20 px-2.5 py-1 text-[0.65rem] font-mono text-sage-mist">
                <Clock3 size={11} /> زنده
              </span>
            </div>

            <div className="relative mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sage-bright/40 to-sage/20 font-display text-lg text-ivory">
                {featured ? initials(featured.name) : '۴۰۴'}
              </div>
              <div>
                <p className="font-display text-lg text-ivory">
                  {featured?.name ?? 'کلینیک ۴۰۴'}
                </p>
                <p className="text-xs text-ivory-dim">
                  {featured?.title ?? 'پزشک متخصص'}
                </p>
              </div>
            </div>

            <div className="relative mt-6 hairline" />

            <div className="relative mt-6 flex items-center justify-between">
              <div>
                <p className="text-2xl font-display text-gold-soft">
                  {featured?.nextAvailable ?? 'همین هفته'}
                </p>
                <p className="mt-1 text-xs text-ivory-dim">
                  {featured?.slotDurationMinutes ?? 30} دقیقه · حضوری یا آنلاین
                </p>
              </div>
              <CalendarCheck className="text-sage-bright" size={22} />
            </div>

            <Button asChild className="relative mt-6 w-full">
              <Link
                href={
                  featured
                    ? `/doctors/${featured.slug}`
                    : '/booking'
                }
              >
                رزرو این نوبت
              </Link>
            </Button>
          </div>

          {/* floating mini stat chip */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="glass-panel absolute -left-8 -bottom-8 hidden w-44 p-4 sm:block"
          >
            <p className="font-display text-2xl text-ivory">
              {avgRating.toFixed(1)}
              <span className="text-gold">★</span>
            </p>
            <p className="text-[0.7rem] text-ivory-dim">
              میانگین رضایت بیماران
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
