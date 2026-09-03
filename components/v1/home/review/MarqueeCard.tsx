import React from 'react'

import BoxReveal from '../BoxReveal'
import SvgShadow from '../SvgShadow'

type Props = {
  id: string
  name: string
  text: string
  rate: number
}

const renderStars = (rating: number) => {
  const stars = []
  for (let i = 0; i < rating; i++) {
    stars.push(
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-yellow-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>,
    )
  }
  return stars
}

function MarqueeCard({ name, text, rate }: Props) {
  return (
    <div
      dir="rtl"
      className=" overflow-y-hidden   rounded-xl py-6 sm:py-2 lg:py-6"
    >
      <article
        style={{
          background:
            'linear-gradient(to bottom, #fff8dc 0%, #56C2D896 75%, #9CCB3D85 100%)',
        }}
        className=" relative mx-auto rounded-xl overflow-hidden gradient-base-r  px-2 md:px-4"
      >
        <SvgShadow />
        <div className="  w-[250px] md:w-[450px] h-[170px] flex flex-col justify-between gap-3 rounded-xl p-4 md:p-6">
          <div className="w-full flex items-center justify-center gap-0.5">
            {renderStars(rate)}
          </div>

          <p className=" line-clamp-5 text-justify md:text-sm text-xs font-semibold  text-muted xl:line-clamp-3">
            {text}
          </p>
          <div className="z-[1] flex justify-between">
            <BoxReveal boxColor="transparent">
              <span className="block text-muted md:text-sm text-xs  ">
                {name}
              </span>
            </BoxReveal>
          </div>
        </div>
      </article>
    </div>
  )
}

export default MarqueeCard
