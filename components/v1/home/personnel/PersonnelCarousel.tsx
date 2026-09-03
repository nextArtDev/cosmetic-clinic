/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { EmblaCarouselType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import React, { useCallback, useEffect, useState } from 'react'
import style from '../Doctor/DoctorsCarousel.module.css'

import AutoScroll from 'embla-carousel-auto-scroll'

import type { V1Personnel } from '@/lib/v1/data'
import PersonnelReservationCard from './PersonnelReservationCard'

type PropType = {
  slides: V1Personnel[]
}

const PersonnelCarousel: React.FC<PropType> = (props) => {
  const { slides } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, direction: 'rtl', watchDrag: false },
    [AutoScroll({}) as any],
  )
  const [scrollProgress, setScrollProgress] = useState(0)

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()))
    setScrollProgress(progress * 100)
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    onScroll(emblaApi as any)
    emblaApi
      .on('reInit', onScroll as any)
      .on('scroll', onScroll as any)
      .on('slideFocus', onScroll as any)
  }, [emblaApi, onScroll])

  return (
    <div dir="rtl" className={`${style.embla} cursor-grab`}>
      <div className={`${style.embla__controls}`}>
        <h2 className="text-2xl text-center font-bold text-pretty title-color mix-blend-multiply ">
          {' '}
          پرسنل کلینیک
        </h2>
        <div
          className={`${style.embla__progress} mt-6 !custom-box-shadow !backdrop-blur-md !bg-white/30  `}
        >
          <div
            className={`${style.embla__progress__bar} !custom-box-shadow !backdrop-blur-md !bg-white/30`}
            style={{ transform: `translate3d(${scrollProgress}%,0px,0px)` }}
          />
        </div>
      </div>
      <div className={` ${style.embla__viewport}`} ref={emblaRef}>
        <div className={` ${style.embla__container}`}>
          {slides.map((personnel) => (
            <div className={`  ${style.embla__slide}`} key={personnel.id}>
              <div className={`relative pt-6  ${style.embla__slide__number}`}>
                <PersonnelReservationCard dir="rtl" personnel={personnel} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PersonnelCarousel
