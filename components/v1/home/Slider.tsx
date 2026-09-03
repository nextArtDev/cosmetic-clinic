'use client'

import type { V1Doctor, V1Specialization } from '@/lib/v1/data'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import ImageEffect from './ImageEffect'

interface SingleProps {
  item: V1Specialization & { doctors: V1Doctor[] }
}
const Single = ({ item }: SingleProps) => {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const lg = useTransform(scrollYProgress, [0, 1], [0, -350])

  const smScale = useTransform(scrollYProgress, [0, 1], [0.3, 1])

  return (
    <>
      <section className=" flex items-center justify-center w-full h-full overflow-hidden">
        <Link
          href={`/v1/specializations/${item.slug}`}
          className="wrapper relative  max-w-[1366px] m-auto flex items-center justify-center gap-y-12 "
        >
          <motion.div
            className="imageContainer  p-1 flex-1  h-full  shrink-0"
            ref={ref}
          >
            <ImageEffect
              imageSrc={
                item.imageUrl || '/v1/images/no-specialization-photo.webp'
              }
              alt={item.name}
            />
          </motion.div>
          <motion.div
            className="textContainer absolute inset-0 top-2 left-1/2 -translate-x-1/2   min-h-[600px] z-[1] text-center"
          >
            <motion.h2
              className="relative  custom-box-shadow backdrop-blur-md  rounded-md bg-white/30 py-3 text-2xl md:text-4xl sub-title-color font-bold"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
            >
              {item.name}
            </motion.h2>
          </motion.div>
          <motion.div
            className={`z-[2] absolute w-full left-1/2 h-full top-3   -translate-x-1/2  border-none   cursor-pointer overflow-hidden   `}
          >
            <motion.article className="flex absolute  bottom-4 left-1/2 -translate-x-1/2  gap-4 ">
              {item?.doctors?.slice(0, 4).map((doctor, index) => {
                return (
                  <motion.div
                    style={{
                      position: 'absolute',
                      bottom: `${Math.floor(index / 2) * 130 + 16}px`!,
                      left:
                        index % 2 == 0
                          ? `${100 / index - 25}%`
                          : `${100 / index + 25}%`,
                      y: lg,
                      scale: smScale,
                    }}
                    initial="hidden"
                    whileInView="visible"
                    key={doctor.id}
                    className="custom-box-shadow backdrop-blur-md  rounded-md bg-white/30 p-4"
                  >
                    <Link
                      href={`/v1/doctors/${doctor.slug}`}
                      className="flex flex-col items-center justify-center gap-0.5 "
                    >
                      <Avatar className={'h-32 w-32 border-4 border-white '}>
                        <AvatarImage
                          className="object-cover rounded-full "
                          src={doctor.imageUrl || '/v1/images/blank-profile-picture.png'}
                          alt={doctor.name}
                        />
                        <AvatarFallback>{doctor.name}</AvatarFallback>
                      </Avatar>
                      <Badge className="custom-box-shadow backdrop-blur-md bg-white/30 ring-2 ring-white rounded-md text-sm text-center flex items-center justify-center">
                        دکتر {doctor.name}
                      </Badge>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.article>
          </motion.div>
        </Link>
      </section>
    </>
  )
}

type SliderProps = {
  specializations: (V1Specialization & { doctors: V1Doctor[] })[]
}

const Slider = ({ specializations }: SliderProps) => {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['end end', 'start start'],
  })

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
  })

  return (
    <div
      className="portfolio relative "
      ref={ref}
      style={{ position: 'relative' }}
    >
      <div className="progress z-30 sticky top-8 left-0  py-8 text-center text-primary text-xl font-semibold ">
        <h1 className="text-3xl  w-fit mx-auto md:text-5xl title-color mix-blend-multiply  p-2">
          کلینیک‌ها
        </h1>
        <motion.div
          style={{ scaleX }}
          className="relative progressBar h-2.5 mt-3 rounded-md custom-box-shadow glass backdrop-blur-sm bg-white/20"
        ></motion.div>
      </div>
      {specializations.map((item) => (
        <Single item={item} key={item.id} />
      ))}
    </div>
  )
}

export default Slider
