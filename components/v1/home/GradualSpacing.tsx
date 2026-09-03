'use client'

import { AnimatePresence, motion, Variants } from 'framer-motion'

import { cn } from '@/lib/utils'

interface GradualSpacingProps {
  text: string
  duration?: number
  delayMultiple?: number
  framerProps?: Variants
  className?: string
}

export default function GradualSpacing({
  text,
  duration = 0.8,
  delayMultiple = 0.1,
  framerProps = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },

  className,
}: GradualSpacingProps) {
  return (
    <div dir="ltr" className="flex justify-center space-x-1">
      <AnimatePresence mode="sync" initial>
        {text.split('').map((char, i) => (
          <motion.h1
            key={i}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={framerProps}
            transition={{ duration, delay: i * delayMultiple + 1.5 }}
            className={cn('drop-shadow-sm p-0.5', className)}
          >
            {char === ' ' ? <span>&nbsp;</span> : char}
          </motion.h1>
        ))}
      </AnimatePresence>
    </div>
  )
}
