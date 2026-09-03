'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ForwardIcon, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import type { V1Doctor, V1Illness } from '@/lib/v1/data'
import BoxReveal from '../BoxReveal'
import { StarRating } from '../StarRating'
import DoctorComment from './DoctorComment'
import SkewedInfiniteScroll from './SkewedInfiniteScroll'
import ReviewCard from './ReviewCard'
import UserReviews from './UserReviews'

interface ReviewsShape {
  id: string
  text: string
  author: string
  rating: number
  created_time?: Date
}

interface pageProps {
  doctor: V1Doctor
  rate: number | null
  reviews?: ReviewsShape[]
  illnesses?: V1Illness[]
}
function DoctorPersonalPage({
  doctor,
  rate,
  reviews,
  illnesses,
}: pageProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.5])

  return (
    <>
      <div ref={ref} className=" bg-transparent py-12 pb-32 ">
        <motion.div className=" min-h-[20vh] w-full">
          {!!reviews?.length && (
            <SkewedInfiniteScroll>
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  rate={review.rating}
                  name={review.author}
                  text={review.text}
                  time={review.created_time}
                />
              ))}
            </SkewedInfiniteScroll>
          )}
        </motion.div>

        <div className="  mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-12 ">
            <div className="flex-col ">
              <motion.figure
                style={{ scale }}
                className="relative h-24 w-24 sm:h-32 sm:w-32 "
              >
                <img
                  className=" object-cover  rounded-full ring-4 ring-white "
                  src={
                    doctor.imageUrl || '/v1/images/blank-profile-picture.png'
                  }
                  alt=""
                />
              </motion.figure>
              <div className="mt-6 min-w-0 flex flex-col gap-2 justify-center ">
                <h1 className=" text-2xl font-bold title-color">
                  دکتر {doctor.name}
                </h1>
                {!!rate && (
                  <article className="flex gap-1  ">
                    <StarRating
                      disabled
                      numStars={5}
                      value={rate}
                      iconProps={{ className: 'size-5' }}
                    />
                    <span>{`(${parseFloat(rate.toFixed(1))} از ${
                      doctor.reviewCount
                    } نفر)`}</span>
                  </article>
                )}
              </div>
            </div>
            <div className=" mt-6 text-secondary sm:min-w-0 sm:flex-1 sm:items-center sm:justify-between sm:space-x-6 sm:pb-1">
              <div className="relative w-fit self-center text-center">
                <Link
                  href={`/v1/booking?doctor=${doctor.slug}`}
                  className={cn(
                    buttonVariants(),
                    'gap-2 py-6 px-8 text-base font-bold shadow-xl rounded-xl bg-teal-800 hover:bg-teal-900',
                  )}
                >
                  <CalendarCheck className="w-5 h-5" />
                  رزرو نوبت با این پزشک
                </Link>
              </div>
              <div className="mt-6 text-secondary flex flex-col justify-stretch space-y-3 sm:flex-row sm:justify-evenly sm:space-x-4 sm:space-y-0">
                {!!doctor?.brief && (
                  <div className="grainy  inline-flex text-center justify-center items-center rounded-md bg-transparent backdrop-blur-sm px-3 py-4 text-sm font-semibold shadow-sm  ">
                    <BoxReveal boxColor="transparent">
                      <span>{doctor.brief}</span>
                    </BoxReveal>
                  </div>
                )}
                {!!doctor?.bio && (
                  <div className="grainy inline-flex text-center justify-center items-center rounded-md bg-transparent backdrop-blur-sm px-3 py-4 text-sm font-semibold shadow-sm  ">
                    <BoxReveal boxColor="transparent">
                      <span>{doctor.bio}</span>
                    </BoxReveal>
                  </div>
                )}
              </div>
            </div>
          </div>
          {!!illnesses?.length && (
            <div className="pt-8 w-full flex-auto">
              <ul
                role="list"
                className="mt-4 grid grid-cols-1 place-items-center gap-x-8 gap-y-4 text-base leading-7  sm:grid-cols-2 "
              >
                {illnesses.map((illness) => (
                  <Link
                    key={illness.id}
                    href={`/v1/illnesses/${illness.slug}`}
                    className={cn(
                      buttonVariants(),
                      'py-8 text-center w-[60%] gradient-base outline-blue-300 outline-dashed -outline-offset-3',
                    )}
                  >
                    <li className="mix-blend-multiply text-blue-900  flex  justify-start items-center gap-x-2 ">
                      <ForwardIcon
                        className="opacity-60 h-7 w-5 flex-none"
                        aria-hidden="true"
                      />
                      {illness.name}
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
          )}
          <DoctorComment
            doctorName={doctor.name}
            doctorId={doctor.userId}
          />
          <UserReviews reviews={reviews} />
        </div>
      </div>
    </>
  )
}

export default DoctorPersonalPage
