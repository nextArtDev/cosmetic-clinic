'use client'
import Image from 'next/image'
import styles from './style.module.css'
import { useTransform, motion, useScroll, MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import SvgShadow from '../SvgShadow'

interface CardProps {
  i: number
  title: string
  items: { id: string; text: string }[]
  src: string
  progress: MotionValue<number>
  range: number[]
  targetScale: number
}
const Card = ({
  i,
  title,
  items,
  src,
  progress,
  range,
  targetScale,
}: CardProps) => {
  const container = useRef(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'],
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [0.7, 1.1])
  const scale = useTransform(progress, range, [1, targetScale])

  const wrapper = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const text = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  }
  return (
    <div ref={container} className={cn(styles.cardContainer, '')}>
      <motion.div
        style={{
          mixBlendMode: 'multiply',
          scale,
          top: `calc(-5vh + ${i * 25}px)`,
        }}
        className={cn(
          styles.card,
          "overflow-hidden relative w-full after:-z-10 after:absolute after:content-[''] after:h-full after:top-0 after:w-full after:left-0 after:opacity-70",
          i % 2 ? 'gradient-base' : 'gradient-base-r',
        )}
      >
        <div className="glass self-center z-[2] my-1 p-1 ">
          <h2 className=" w-fit self-center text-2xl  font-bold text-pretty  sub-title-color">
            {' '}
            {title}
          </h2>
        </div>
        <div className={cn(styles.body, 'relative flex flex-col w-full h-full')}>
          <div className={styles.imageContainer}>
            <motion.div className={styles.inner} style={{ scale: imageScale }}>
              <Image sizes="100%" fill src={src} alt={title} />
              <div className="absolute inset-0 gradient-base opacity-20 backdrop-blur-sm z-[1]"></div>
            </motion.div>
          </div>
          <div className={cn(styles.description, 'text-lg font-semibold  text-right')}>
            <motion.ul
              variants={wrapper}
              initial="hidden"
              whileInView="show"
              className="absolute top-16 left-1/2 w-full space-y-4 -translate-x-1/2 flex flex-col  justify-around items-center text-justify z-[2]"
            >
              {items?.map((item) => (
                <motion.li variants={text} key={item.id}>
                  <Badge className="px-2 py-1 flex gap-1 custom-box-shadow backdrop-blur-md  bg-white/30 rounded-md text-sm md:text-base">
                    <CheckCircle
                      className="text-primary"
                      size={16}
                      strokeWidth={2}
                    />
                    <p>{item.text}</p>
                  </Badge>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
        <SvgShadow />
      </motion.div>
    </div>
  )
}

export default Card
