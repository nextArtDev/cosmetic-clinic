'use client'

import { JSX, useEffect, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'

interface BoxRevealProps {
  children: JSX.Element
  width?: 'fit-content' | '100%'
  boxColor?: string
  duration?: number
}

export const BoxReveal = ({
  children,
  width = 'fit-content',
  boxColor,
  duration,
}: BoxRevealProps) => {
  const mainControls = useAnimation()
  const slideControls = useAnimation()

  const ref = useRef(null)
  const isInView = useInView(ref)

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible')
      mainControls.start('visible')
    } else {
      slideControls.start('hidden')
      mainControls.start('hidden')
    }
  }, [isInView, mainControls, slideControls])

  return (
    <div ref={ref} style={{ position: 'relative', width, overflow: 'hidden' }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: duration ? duration : 0.35, delay: 0.15 }}
      >
        {children}
      </motion.div>

      <motion.div
        variants={{
          hidden: { left: '100%' },
          visible: { left: 0 },
        }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration: duration ? duration : 0.35, ease: 'easeIn' }}
        style={{
          position: 'absolute',
          opacity: '15%',
          backdropFilter: '25px',
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 1,
          background: boxColor
            ? boxColor
            : 'linear-gradient(to bottom, #fff8dc 0%, #add8e6 60%, #ffb6c1 100%)',
        }}
      />
    </div>
  )
}

export default BoxReveal
