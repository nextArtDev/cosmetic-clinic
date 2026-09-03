'use client'
import { FC } from 'react'

import TestimonialCarousel from '../Testemonial'

interface UserReviewsProps {
  reviews: {
    text: string
    author: string
    rating: number
    created_time?: Date
  }[] | null | undefined
}

const UserReviews: FC<UserReviewsProps> = ({ reviews }) => {
  const testimonials = reviews?.map((review) => {
    return {
      text: review.text,
      author: review.author || '',
      rating: review.rating,
      created_time: review.created_time,
    }
  })
  if (!testimonials?.length) return <div></div>
  return (
    <section className="pb-36 pt-6 ">
      <section className="flex flex-col gap-4 justify-center items-center col-span-2 text-black/60">
        {testimonials?.length > 0 ? (
          <TestimonialCarousel testimonials={testimonials} />
        ) : null}
      </section>
    </section>
  )
}

export default UserReviews
