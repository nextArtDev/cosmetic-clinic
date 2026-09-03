'use client'
import React from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Slider } from '@/lib/v1/constants'
import Image from 'next/image'

type PropType = {
  slides: Slider[]
  options?: EmblaOptionsType
}
const DELAY = 3

const Carousel: React.FC<PropType> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, axis: 'y' }, [
    Autoplay({
      delay: DELAY * 1000,
    }),
  ])

  return (
    <section className="embla pointer-events-none ">
      <div className="relative embla__viewport" ref={emblaRef}>
        <div className=" embla__container  ">
          {slides.map((slide) => (
            <div className=" embla__slide " key={slide.id}>
              <div className=" relative embla__slide__number">
                <Image
                  src={slide.imageUrl}
                  alt={slide.name}
                  fill
                  className="object-cover"
                />
                <motion.div className="absolute inset-0 bg-gradient-to-t to-[#56C2D8] via-[#FFF8DC] from-[#9CCB3D78] opacity-45  backdrop-blur-md z-[2]"></motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Carousel
