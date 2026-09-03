'use client'

import { deal } from '@/lib/v1/constants'
import Image from 'next/image'
import Marquee from './Marquee'
import SvgShadow from './SvgShadow'
import ReactLenis from 'lenis/react'

export default function Deal() {
  return (
    <ReactLenis root>
      <div className="gradient-kossar relative pt-2 md:pt-4 md:mb-20 flex h-fit pb-8 md:pb-12  w-full flex-col items-center justify-center overflow-hidden  bg-transparent md:shadow-xl">
        <SvgShadow />
        <Marquee className="[--duration:20s]">
          {deal
            .slice(deal.length / 2)
            .map(({ id, name, imageUrl }) => (
              <div key={id} className="relative h-28 w-28 ">
                <Image
                  sizes="100%"
                  src={imageUrl}
                  alt={name}
                  fill
                  className="grayscale-[0.75]  object-contain object-center"
                />
              </div>
            ))}
        </Marquee>
        <Marquee reverse className="[--duration:20s]">
          {deal
            .slice(0, deal.length / 2)
            .map(({ id, name, imageUrl }) => (
              <div key={id} className="relative h-24 w-24 ">
                <Image
                  src={imageUrl}
                  sizes="100%"
                  alt={name}
                  fill={true}
                  className="grayscale-[0.87] object-contain object-center"
                />
              </div>
            ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r dark:from-[#FFB6C140] from-[#FFF8DC60]"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l dark:from-[#FFB6C140] from-[#FFF8DC60]"></div>
      </div>
    </ReactLenis>
  )
}
