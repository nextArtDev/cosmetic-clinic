/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { formatTimeToNow } from '@/lib/v1/date-utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Dot } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StarRating } from './StarRating'
import SvgShadow from './SvgShadow'

interface TestimonialCarouselProps {
  testimonials: {
    text: string
    author: string
    rating: number
    created_time?: Date
  }[]
}

const TestimonialCarousel = ({ testimonials }: TestimonialCarouselProps) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTestimonial(
        (prevTestimonial) => (prevTestimonial + 1) % testimonials.length,
      )
    }, 3000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const { text, author, rating, created_time } =
    testimonials[currentTestimonial]

  const variants = {
    initial: { opacity: 0, y: '100%', scale: 0.1 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: '100%', scale: 0.1 },
  }
  const dotVariants = {
    active: { scale: 1.2, backgroundColor: '#45f88a' },
    inactive: { scale: 1, backgroundColor: '#9CCB3D85' },
  }

  return (
    <section className=" py-12 md:py-24 max-w-2xl">
      <article className="relative overflow-hidden  bg-secondary/10 gradient-base-r shadow-2xl backdrop-blur-md rounded-2xl px-8 py-10  w-[90vw] max-w-[90vh]  ">
        <SvgShadow className="!opacity-75" />
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentTestimonial}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            className=" flex w-full flex-col items-center justify-center"
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              duration: 0.5,
            }}
          >
            <div className="pb-4">
              <StarRating value={rating} disabled />
            </div>
            <p className="m-0 text-center text-secondary text-sm md:text-base font-medium tracking-tight line-clamp-7 md:line-clamp-6">
              &quot;{text}&quot;
            </p>
            <div className="mx-auto mt-5">
              <div className="flex flex-col items-center justify-center space-x-3">
                <div className="flex justify-center items-center">
                  <span className=" text-[1rem] ">{author}</span>
                  <Dot className="" />

                  {created_time && (
                    <span className=" text-xs md:text-sm ">
                      {formatTimeToNow(new Date(created_time))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          <div className="mt-8 flex justify-center">
            {testimonials.map((_, index) => (
              <motion.div
                key={index}
                className="mx-1.5 h-2.5 w-2.5 cursor-pointer rounded-full"
                variants={dotVariants}
                animate={index === currentTestimonial ? 'active' : 'inactive'}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </AnimatePresence>
      </article>
    </section>
  )
}

export default TestimonialCarousel
