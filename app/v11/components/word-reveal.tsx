'use client'

import { Fragment, useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import CountUp from './count-up'
import type { RevealPart } from '../lib/content'

export type { RevealPart }

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
  waitForBoot = false,
}: {
  parts: RevealPart[] | string
  as?: Tag
  className?: string
  stagger?: number
  delay?: number
  amount?: number
  once?: boolean
  /** Hold the reveal until the preloader curtain lifts (hero handoff). */
  waitForBoot?: boolean
}) {
  const list: RevealPart[] = typeof parts === 'string' ? [{ text: parts }] : parts
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    if (!waitForBoot) return
    if (document.documentElement.hasAttribute('data-v11-booted')) {
      // deferred: no sync setState in the effect body (React lint rule)
      queueMicrotask(() => setBooted(true))
      return
    }
    const onBoot = () => setBooted(true)
    window.addEventListener('v11:booted', onBoot)
    return () => window.removeEventListener('v11:booted', onBoot)
  }, [waitForBoot])

  const blocked = waitForBoot && !booted

  const MotionTag = (motion as unknown as Record<string, typeof motion.div>)[
    as
  ] as typeof motion.div

  return (
    <MotionTag
      className={className}
      variants={container}
      custom={{ stagger, delay }}
      initial="hidden"
      {...(blocked
        ? { animate: 'hidden' }
        : {
            whileInView: 'show',
            viewport: { once, amount },
          })}
    >
      {list.map((part, pi) => {
        if (part.text === '<br/>') return <br key={`br-${pi}`} />
        // Count parts (e.g. «۸۷٪») render their digits as an animated
        // Persian counter and the rest as a plain suffix — the whole part
        // still rides the same word-mask reveal.
        if (typeof part.count === 'number') {
          const rest = part.text.replace(/[۰-۹\d]/g, '')
          const counter = (
            <>
              <CountUp to={part.count} suffix={rest} />
            </>
          )
          return part.className ? (
            <span className={part.className} key={pi}>
              <span className="word-mask">
                <motion.span className="word" variants={word}>
                  {counter}
                </motion.span>
              </span>{' '}
            </span>
          ) : (
            <span key={pi}>
              <span className="word-mask">
                <motion.span className="word" variants={word}>
                  {counter}
                </motion.span>
              </span>{' '}
            </span>
          )
        }
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
