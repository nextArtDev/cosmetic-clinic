'use client'

import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'
import { ArrowLeft } from './Icons'

export default function BookCta() {
  const [mini, setMini] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => setMini(v > 220))

  return (
    <>
      {/* Desktop fixed CTA — RTL: pinned to the inline-start (physical right) */}
      <motion.a
        href="#book"
        data-cursor="book"
        aria-label="رزرو نوبت"
        className="btn-primary btn-primary--cream fixed top-[4.7rem] z-[45] hidden min-w-0 overflow-hidden lg:inline-flex"
        style={{ right: 'calc(2.5vw + 2rem)' }}
        animate={{
          width: mini ? 48 : 250,
          borderRadius: mini ? 40 : 40,
          paddingLeft: mini ? 0 : 24,
          paddingRight: mini ? 0 : 24,
        }}
        transition={{ duration: 0.6, ease: [0.15, 0.9, 0.34, 0.95], delay: mini ? 0.2 : 0 }}
        whileHover={
          mini
            ? { width: 250, paddingLeft: 24, paddingRight: 24 }
            : undefined
        }
      >
        <motion.span
          className="whitespace-nowrap"
          animate={{ opacity: mini ? 0 : 1 }}
          transition={{ duration: mini ? 0.4 : 0.4, delay: mini ? 0 : 0.4, ease: [0.15, 0.9, 0.34, 0.95] }}
        >
          رزرو نوبت
        </motion.span>
        <ArrowLeft color="#231F20" className="shrink-0" style={{ marginRight: mini ? 8 : 0 }} />
      </motion.a>

      {/* Mobile sticky CTA */}
      <motion.a
        href="#book"
        className="btn-primary btn-primary--pink fixed bottom-[1.6rem] left-1/2 z-[45] w-[calc(100%-3.2rem)] max-w-[42rem] -translate-x-1/2 justify-center lg:hidden"
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.4, ease: [0.76, 0, 0.24, 1] }}
      >
        <span className="whitespace-nowrap">رزرو نوبت</span>
        <ArrowLeft color="#231F20" />
      </motion.a>
    </>
  )
}
