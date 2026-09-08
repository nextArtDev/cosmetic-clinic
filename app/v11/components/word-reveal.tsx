'use client'

import { Fragment } from 'react'
import { motion, type Variants } from 'framer-motion'

export type RevealPart = {
  text: string
  className?: string
}

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span'

const container: Variants = {
  hidden: {},
  show: (custom: { stagger: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delay,
    },
  }),
}

const word: Variants = {
  hidden: { y: '110%', opacity: 0, rotate: 2 },
  show: {
    y: '0%',
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function WordReveal({
  parts,
  as = 'div',
  className = '',
  stagger = 0.045,
  delay = 0,
  amount = 0.35,
  once = true,
}: {
  parts: RevealPart[] | string
  as?: Tag
  className?: string
  stagger?: number
  delay?: number
  amount?: number
  once?: boolean
}) {
  const list: RevealPart[] = typeof parts === 'string' ? [{ text: parts }] : parts

  const MotionTag = (motion as unknown as Record<string, typeof motion.div>)[
    as
  ] as typeof motion.div

  return (
    <MotionTag
      className={className}
      variants={container}
      custom={{ stagger, delay }}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {list.map((part, pi) => {
        if (part.text === '<br/>') return <br key={`br-${pi}`} />
        // Persian words join; splitting on spaces is still safe (the
        // reveal mask animates whole words, never sub-word glyphs).
        const words = part.text.split(' ').filter(Boolean)
        const inner = words.map((w, wi) => {
          return (
            <Fragment key={`${pi}-${wi}`}>
              <span className="word-mask">
                <motion.span className="word" variants={word}>
                  {w}
                </motion.span>
              </span>
              {/* keep a real text-node space between inline-block masks,
                  otherwise joined Persian words fuse together */}
              {wi < words.length - 1 ? ' ' : null}
            </Fragment>
          )
        })
        return part.className ? (
          <span className={part.className} key={pi}>
            {inner}{' '}
          </span>
        ) : (
          <span key={pi}>{inner} </span>
        )
      })}
    </MotionTag>
  )
}
