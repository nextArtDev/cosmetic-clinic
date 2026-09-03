'use client'

import { useScroll } from 'framer-motion'
import { useRef } from 'react'
import { ReactLenis } from 'lenis/react'
import Card from './Card'

import { rooms } from '@/lib/v1/constants'

export default function StackCards() {
  const container = useRef(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  })

  return (
    <ReactLenis root>
      <section ref={container} className="relative">
        {rooms.map((room, i) => {
          const targetScale = 1 - (rooms.length - i) * 0.05
          return (
            <Card
              key={`p_${i}`}
              i={i}
              {...room}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
            />
          )
        })}
      </section>
    </ReactLenis>
  )
}
