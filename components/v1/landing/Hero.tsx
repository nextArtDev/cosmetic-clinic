'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { PhoneCallIcon, CalendarCheck2 } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { V1Doctor } from '@/lib/v1/data'

interface HeroProps {
  doctors: V1Doctor[]
}

const DEPARTMENTS = [
  'آزمایشگاه',
  'سونوگرافی',
  'رادیولوژی',
  'شنوایی سنجی',
  'بینایی‌سنجی',
  'لیزر',
  'ترک اعتیاد',
]

function RotatingText({
  texts,
  className = '',
}: {
  texts: string[]
  className?: string
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % texts.length), 3000)
    return () => clearInterval(t)
  }, [texts.length])

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={texts[index]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-120%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className="v1-title-gradient block text-3xl md:text-4xl"
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export function Hero({ doctors }: HeroProps) {
  const featured = doctors[0]

  return (
    <section className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto flex flex-col items-center px-4 py-32 text-center">
        {/* Logo / title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <span className="v1-glass v1-shadow rounded-2xl px-6 py-2 text-sm font-bold text-teal-800">
            مجتمع پزشکی کوثر مسجدسلیمان
          </span>
          <h1 className="v1-title-gradient mx-auto max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            سلامت شما، تخصص ماست
          </h1>
          <p className="max-w-xl text-lg font-medium text-black/70">
            با پزشکان متخصص ما در کنار بخش‌های آزمایشگاه، سونوگرافی، رادیولوژی و
            بیشتر آشنا شوید و به‌راحتی نوبت بگیرید.
          </p>
        </motion.div>

        {/* Rotating departments */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 w-full max-w-3xl"
        >
          <p className="mb-2 text-sm font-semibold text-black/60">
            دارای بخش‌های
          </p>
          <RotatingText texts={DEPARTMENTS} />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/v1/booking"
            className="v1-glass v1-shadow flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold text-teal-900 transition-transform hover:scale-[1.03]"
          >
            <CalendarCheck2 size={18} />
            رزرو نوبت
          </Link>
          <a
            href="tel:06143228700"
            className="flex items-center gap-2 rounded-xl bg-black/70 px-7 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            <PhoneCallIcon size={18} />
            تماس: ۰۶۱-۴۳۲۲۸۷۰۰
          </a>
        </motion.div>

        {/* Featured doctor chip */}
        {featured && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-10 text-sm font-medium text-black/60"
          >
            پزشک منتخب:{' '}
            <Link
              href={`/v1/doctors/${featured.slug}`}
              className="v1-title-gradient-sage underline-offset-4 hover:underline"
            >
              {featured.name} — {featured.title}
            </Link>
          </motion.p>
        )}
      </div>
    </section>
  )
}
