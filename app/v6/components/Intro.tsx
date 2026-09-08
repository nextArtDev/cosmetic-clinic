'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { hero } from '../lib/data'

export default function Intro() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    document.body.style.overflow = visible ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'linear-gradient(180deg,#faf2f0 0%,#fdfcfc 100%)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
        >
          <div className="relative flex flex-col items-center">
            {/* rotating ring */}
            <motion.svg
              viewBox="0 0 200 200"
              className="absolute h-[26rem] w-[26rem] -rotate-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              aria-hidden="true"
            >
              <motion.circle
                cx="100"
                cy="100"
                r="94"
                fill="none"
                stroke="#EAA098"
                strokeWidth="1"
                strokeDasharray="590"
                initial={{ strokeDashoffset: 590 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.9, ease: [0.76, 0, 0.24, 1] }}
              />
            </motion.svg>

            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
              className="relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img-v6/logo.svg"
                alt="سیمای آرام"
                className="h-[13rem] w-[13rem] object-contain"
              />
            </motion.div>

            <div className="mt-8 overflow-hidden">
              <motion.span
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
                className="block text-[1.2rem] font-semibold text-ink/60"
              >
                {hero.introTagline}
              </motion.span>
            </div>

            <motion.div
              className="mt-10 h-px w-[12rem] origin-right bg-pink"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.6, ease: [0.76, 0, 0.24, 1], delay: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
