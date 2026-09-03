'use client'
import { motion, useTransform, useScroll } from 'framer-motion'
import { useRef } from 'react'

import { cn } from '@/lib/utils'
import doctor1 from '../../public/images/doctors/1.jpeg'
import doctor2 from '../../public/images/doctors/2.jpeg'
import doctor3 from '../../public/images/doctors/3.jpg'
import doctor4 from '../../public/images/doctors/4.jpeg'
import doctor5 from '../../public/images/doctors/5.jpeg'
import Image from 'next/image'

const cards = [
  { id: '1', name: 'لیلا حسینی', title: 'دستیار', imgSrc: doctor1 },
  { id: '2', name: 'محسن احمدی', title: 'منشی', imgSrc: doctor3 },
  { id: '3', name: 'زهره محمدی', title: 'دستیار', imgSrc: doctor2 },
  { id: '4', name: 'یوسف خوشنام', title: 'دستیار', imgSrc: doctor5 },
  { id: '5', name: 'نگین رمضانی', title: 'دستیار', imgSrc: doctor4 },
]

interface HorizontalScrollCarouselProps {
  rtl?: boolean
  className?: string
}
const HorizontalScrollCarousel = ({
  rtl,

  className,
}: HorizontalScrollCarouselProps) => {
  const targetRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
  })
  const xTransform: string = rtl ? '75%' : '-75%'
  const x = useTransform(scrollYProgress, [0, 1], ['1%', xTransform])

  //   for rtl
  //   const x = useTransform(scrollYProgress, [0, 1], ['1%', '75%'])

  return (
    <section
      dir={rtl ? 'rtl' : 'ltr'}
      ref={targetRef}
      className={cn('relative  bg-transparent')}
    >
      <div className="!sticky top-0 flex  items-center overflow-hidden  ">
        <motion.div style={{ x }} className="flex gap-4">
          {cards.map((card) => (
            <div
              dir="rtl"
              key={card.id}
              className={cn(
                'bg-transparent flex flex-col gap-0.5 items-center justify-center   p-5  ',

                className
              )}
            >
              <figure className="relative size-24 md:size-24">
                <Image
                  fill
                  src={card.imgSrc}
                  className="w-full h-full rounded-full object-cover"
                  alt=""
                />
              </figure>
              <h2 className="text-sm text-[rebeccapurple] md:text-base lg:text-lg">
                {card.name}
              </h2>
              <h3 className="text-xs text-[rebeccapurple]/70 md:text-sm lg:text-base opacity-75">
                {card.title}
              </h3>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default HorizontalScrollCarousel
