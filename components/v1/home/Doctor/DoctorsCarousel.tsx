/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import React, { useCallback, useEffect, useState } from 'react'
import style from './DoctorsCarousel.module.css'

import AutoScroll from 'embla-carousel-auto-scroll'
import Link from 'next/link'
import DoctorReservationCard from './DoctorReservationCard'
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from './EmblaCarouseelArrowButtons'
import type { V1Doctor } from '@/lib/v1/data'

type PropType = {
  slides: V1Doctor[]
  options?: EmblaOptionsType
}

const DoctorCarousel: React.FC<PropType> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    AutoScroll({}),
  ])
  const [scrollProgress, setScrollProgress] = useState(0)

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()))
    setScrollProgress(progress * 100)
  }, [])

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi as any)

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
    <div dir="ltr" className={`${style.embla} cursor-grab`}>
      <div className={`${style.embla__controls}`}>
        <div className={`${style.embla__buttons}`}>
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <h2 className="text-2xl text-center font-bold text-pretty title-color mix-blend-multiply ">
          {' '}
          کادر درمان
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
      <div className={`${style.embla__viewport}`} ref={emblaRef}>
        <div className={`${style.embla__container}`}>
          {slides.map((doctor) => (
            <div className={`${style.embla__slide}`} key={doctor.id}>
              <div className={`relative pt-6 ${style.embla__slide__number}`}>
                <Link href={`/v1/doctors/${doctor.slug}`}>
                  <DoctorReservationCard dir="ltr" doctor={doctor} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DoctorCarousel
