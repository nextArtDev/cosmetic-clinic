import React from 'react'
import MarqueeCard from './MarqueeCard'

import type { V1Testimonial } from '@/lib/v1/data'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Marquee from '../Marquee'

type Props = {
  reviews: V1Testimonial[]
}

function Reviews({ reviews }: Props) {
  const review = reviews.map((r) => {
    return {
      id: r.id,
      name: r.patientName,
      text: r.text,
      rate: r.rating,
      doctorSlug: r.doctorSlug,
    }
  })

  return (
    <div
      dir="ltr"
      className={cn(
        'relative flex   w-full flex-col items-center justify-center overflow-hidden rounded-lg  md:shadow-xl',
        reviews.length > 6 ? 'h-[600px]' : 'h-[350px]',
      )}
    >
      <h1 className="text-2xl  text-center font-bold text-pretty p-2 title-color mix-blend-multiply">
        {' '}
        نظرات
      </h1>
      <div className="flex flex-col mt-8">
        <Marquee reverse pauseOnHover repeat={7} className="[--duration:30s]">
          {review.slice(0, 7).map((marquee) => (
            <Link
              key={marquee.id}
              href={`/v1/doctors/${marquee.doctorSlug}`}
            >
              <MarqueeCard {...marquee} />
            </Link>
          ))}
        </Marquee>

        <Marquee pauseOnHover repeat={7} className="[--duration:30s] ">
          {review.slice(7, 14).map((marquee) => (
            <Link
              key={marquee.id}
              href={`/v1/doctors/${marquee.doctorSlug}`}
            >
              <MarqueeCard {...marquee} />
            </Link>
          ))}
        </Marquee>
      </div>
    </div>
  )
}

export default Reviews
