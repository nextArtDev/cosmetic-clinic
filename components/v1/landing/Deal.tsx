'use client'

import Image from 'next/image'
import Marquee from '../Marquee'

/** Insurers strip — mirrored from kosar-localized constants, paths adjusted to /v1/images. */
const DEAL = [
  { id: '1', name: 'بیمه کوثر', imageUrl: '/v1/images/deal/Kosar.png' },
  { id: '2', name: 'بیمه رازی', imageUrl: '/v1/images/deal/Razi.png' },
  {
    id: '3',
    name: 'تامین اجتماعی',
    imageUrl: '/v1/images/deal/tamin-ejtemaei.svg',
  },
  { id: '4', name: 'بیمه ایران', imageUrl: '/v1/images/deal/Iran1.png' },
  { id: '5', name: 'بیمه ملت', imageUrl: '/v1/images/deal/Mellat.png' },
  { id: '6', name: 'بیمه سامان', imageUrl: '/v1/images/deal/Saman.png' },
  { id: '7', name: 'بیمه دانا', imageUrl: '/v1/images/deal/Dana.png' },
  { id: '8', name: 'بیمه آسیا', imageUrl: '/v1/images/deal/Asia.png' },
  { id: '9', name: 'بیمه سلامت', imageUrl: '/v1/images/deal/salamat.svg' },
  { id: '10', name: 'بیمه معلم', imageUrl: '/v1/images/deal/Moallem1.png' },
  { id: '11', name: 'بیمه نوین', imageUrl: '/v1/images/deal/Novin.png' },
  { id: '12', name: 'آتیه‌سازان', imageUrl: '/v1/images/deal/atieh.svg' },
  { id: '14', name: 'بیمه البرز', imageUrl: '/v1/images/deal/Alborz.png' },
  { id: '15', name: 'بیمه دی', imageUrl: '/v1/images/deal/Day.png' },
  { id: '16', name: 'بیمه میهن', imageUrl: '/v1/images/deal/Mihan.png' },
  { id: '17', name: 'بیمه سینا', imageUrl: '/v1/images/deal/Sina1.png' },
]

export function Deal() {
  return (
    <div className="relative flex h-fit w-full flex-col items-center justify-center overflow-hidden bg-transparent pt-2 pb-8 md:mb-20 md:pt-4 md:pb-12 md:shadow-xl">
      <Marquee className="[--duration:20s]">
        {DEAL.slice(DEAL.length / 2).map((d) => (
          <div
            key={d.id}
            className="relative h-24 w-24 shrink-0 md:h-28 md:w-28"
          >
            <Image
              sizes="100%"
              src={d.imageUrl}
              alt={d.name}
              fill
              className="object-contain object-center grayscale-[0.75]"
            />
          </div>
        ))}
      </Marquee>
      <Marquee reverse className="[--duration:20s]">
        {DEAL.slice(0, DEAL.length / 2).map((d) => (
          <div
            key={d.id}
            className="relative h-20 w-20 shrink-0 md:h-24 md:w-24"
          >
            <Image
              sizes="100%"
              src={d.imageUrl}
              alt={d.name}
              fill
              className="object-contain object-center grayscale-[0.87]"
            />
          </div>
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#FFF8DC60]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#FFF8DC60]" />
    </div>
  )
}
