'use client'
import React, { useRef } from 'react'

import IllnessShowCard from '../illness/IllnessShowCard'
import DoctorReservationCard from '../Doctor/DoctorReservationCard'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import type { V1Doctor, V1Illness, V1Specialization } from '@/lib/v1/data'

type Props = {
  specialization: V1Specialization & {
    doctors: V1Doctor[]
    illnesses: V1Illness[]
  }
}

function SpecializationPage({ specialization }: Props) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.5])
  return (
    <section
      ref={ref}
      className="mx-auto pt-4 max-w-7xl w-full h-full flex flex-col "
    >
      <figure className="relative w-full h-44 rounded-md overflow-hidden">
        <Image
          unoptimized
          fill
          className=" object-cover  rounded-md ring-1 ring-white "
          src={
            specialization.imageUrl || '/v1/images/no-specialization-photo.webp'
          }
          alt={specialization.name}
        />
        <motion.div
          style={{ scale }}
          className="absolute bg-black/20 backdrop-blur-sm px-1 mx:px-2 text-center flex flex-col items-center justify-center gap-1 md:gap-2 inset-0 rounded-md"
        >
          <h1 className="text-xl md:text-4xl title-color text-center ">
            {specialization.name}
          </h1>
          <p className="max-w-md mx-auto lg:max-w-lg text-white/80 text-base md:text-xl line-clamp-4">
            {specialization.description}
          </p>
        </motion.div>
      </figure>

      <div className="mx-auto px-1 py-8 max-w-7xl w-full h-full flex flex-col gap-12">
        {!!specialization.doctors.length && (
          <article className="flex flex-col gap-4">
            <h2 className="text-xl sub-title-color py-4 text-center  md:text-2xl ">
              دکترهای مرتبط ({specialization.doctors.length})
            </h2>
            <div className="grid place-items-center place-content-center grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {specialization.doctors.map((doctor) => (
                <Link key={doctor.id} href={`/v1/doctors/${doctor.slug}`}>
                  <DoctorReservationCard doctor={doctor} isVertical={true} />
                </Link>
              ))}
            </div>
          </article>
        )}
        {!!specialization?.illnesses?.length && (
          <article className="flex flex-col gap-4">
            <h2 className="text-xl sub-title-color py-4 text-center  md:text-2xl ">
              بیماری‌های مرتبط ({specialization.illnesses.length})
            </h2>
            <div className="grid place-items-center grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 ">
              {specialization?.illnesses?.map((illness) => (
                <IllnessShowCard illness={illness} key={illness.id} />
              ))}
            </div>
          </article>
        )}
      </div>
    </section>
  )
}

export default SpecializationPage
