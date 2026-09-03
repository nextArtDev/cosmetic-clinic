'use client'

import { slider } from '@/lib/v1/constants'
import { Phone, PhoneCallIcon } from 'lucide-react'
import Link from 'next/link'
import GradualSpacing from '../GradualSpacing'
import HeroWhatsApp from '../icons/HeroWhatsApp'
import RotatingText from '../RotatingText'
import Carousel from './Carousel'
import HeroSvg from './HeroSvg'
import IconRipple from './IconRipple'
import LogoSvg from './LogoSvg'

function Hero() {
  return (
    <section className="relative w-full min-h-[100dvh] ">
      <div className="container absolute  top-[15%] md:top-[20%]  inset-0 flex flex-col justify-between h-[80vdh] items-center ">
        <div className="content text-center z-10  ">
          <div className="h-full  space-y-10 md:space-y-8">
            <article className="flex flex-col mx-auto items-center justify-center gap-2">
              <LogoSvg className=" mx-auto animate-fade-in [--animation-delay:1100ms] opacity-0" />

              <span className="!w-full mx-auto animate-fade-in [--animation-delay:1300ms] opacity-0  glass !rounded-lg mb-0 p-1 ">
                <HeroSvg className=" " />
              </span>
            </article>

            <div className="animate-fade-in  !rounded-md [--animation-delay:1600ms] opacity-0 ">
              <RotatingText
                texts={[
                  'آزمایشگاه',
                  'ترک اعتیاد',
                  'سونوگرافی',
                  'رادیولوژی ',
                  'شنوایی سنجی',
                  'تست سرگیجه‌وتعادل',
                  'بینایی‌سنجی',
                  'لیزر',
                ]}
                mainClassName=" px-2  sm:px-3 md:px-4  overflow-hidden py-1 sm:py-1 md:py-2 justify-center  text-3xl "
                staggerFrom={'last'}
                splitBy="words"
                initial={{ y: '100%' }}
                animate={{ y: '0' }}
                exit={{ y: '-120%' }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
            </div>
          </div>
          <div className="hidden  sm:flex flex-col items-center justify-center gap-4">
            <div className="flex gap-1 !text-red-500/70 items-center justify-center">
              <GradualSpacing
                className="  custom-number-shadow p-0.5 w-fit text-center text-3xl font-bold tracking-[-0.1em] md:leading-[2rem]"
                text="09166253390"
              />
              <PhoneCallIcon className=" animate-fade-in [--animation-delay:1800ms] opacity-0 " />
            </div>
            <div className="flex gap-1 !text-green-500/70 items-center justify-center">
              <GradualSpacing
                className="  custom-number-shadow p-0.5 w-fit text-center text-3xl font-bold tracking-[-0.1em] md:leading-[2rem]"
                text="09009814404"
              />
              <HeroWhatsApp className="animate-fade-in [--animation-delay:1800ms] opacity-0  w-8 h-8 mix-blend-multiply text-green-600 " />
            </div>
          </div>

          <div className="sm:hidden animate-fade-in [--animation-delay:2100ms] opacity-0 pt-6 flex w-full   items-center justify-evenly ">
            <Link href="tel:+989166253390" className="w-fit animate-pulse">
              <IconRipple icon={Phone} iconColor="red" />
            </Link>
            <Link
              href="https://wa.me/+989009814404"
              target="_blank"
              className=" "
            >
              <HeroWhatsApp className="w-8 h-8 mix-blend-multiply text-green-600 " />
            </Link>
          </div>
        </div>
      </div>

      <Carousel slides={slider} />
    </section>
  )
}

export default Hero
