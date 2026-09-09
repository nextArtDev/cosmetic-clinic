'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toFa } from '../lib/content'

/** Boot preloader — faithful port of the grind Preloader.tsx (fa digits). */
export default function Preloader() {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    let current = 0
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 12) + 4
      if (current >= 100) {
        current = 100
        clearInterval(interval)
        setTimeout(() => {
          setDone(true)
          document.body.style.overflow = ''
        }, 350)
      }
      setCount(current)
    }, 90)
    return () => {
      clearInterval(interval)
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="tg:fixed tg:inset-0 tg:z-[100] tg:flex tg:items-end tg:justify-between tg:bg-[#0a0a0a] tg:px-6 tg:pb-6 tg:md:px-12 tg:md:pb-10"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="tg:font-display tg:text-2xl tg:text-[#f2f0eb] tg:md:text-4xl"
          >
            دکتر <span className="tg:text-[#d7fe45]">رستگار</span>
          </motion.div>
          <div className="tg:font-display tg:text-7xl tg:leading-none tg:text-[#d7fe45] tg:md:text-[10rem]">
            {toFa(count)}٪
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
