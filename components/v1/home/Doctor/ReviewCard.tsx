import React from 'react'

import BoxReveal from '../BoxReveal'
import { StarRating } from '../StarRating'
import { formatTimeToNow } from '@/lib/v1/date-utils'
import SvgShadow from '../SvgShadow'

type Props = {
  name: string
  text: string
  time?: Date
  rate: number
}

function ReviewCard({ name, text, time, rate }: Props) {
  return (
    <div dir="rtl" className="  rounded-xl ">
      <article
        style={{
          background:
            'linear-gradient(to bottom, #fff8dc 0%, #add8e6 60%, #ffb6c1 100%)',
        }}
        className="relative mx-auto rounded-xl overflow-hidden   px-2 md:px-4"
      >
        <SvgShadow />
        <div className="  w-[250px]   h-auto flex flex-col justify-between gap-3 rounded-xl p-4 md:p-6">
          <div className="w-full flex items-center justify-center gap-0.5">
            <StarRating
              disabled
              value={rate}
              iconProps={{ className: 'size-3' }}
            />
          </div>

          <p className=" line-clamp-2 text-center md:text-sm text-xs font-semibold lg:text-base text-muted xl:line-clamp-1">
            {text}
          </p>
          <div className="z-[1] flex justify-between">
            <BoxReveal boxColor="transparent">
              <span className="block text-muted md:text-sm text-xs  lg:text-base">
                {name}
              </span>
            </BoxReveal>
            <BoxReveal boxColor="transparent">
              <span className="block md:text-sm text-xs lg:text-base text-muted-foreground">
                {time ? formatTimeToNow(time) : ''}
              </span>
            </BoxReveal>
          </div>
        </div>
      </article>
    </div>
  )
}

export default ReviewCard
