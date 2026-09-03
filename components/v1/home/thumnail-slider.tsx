'use client'
import { EmblaOptionsType } from 'embla-carousel'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Carousel, {
  Slider,
  SliderContainer,
  ThumsSlider,
} from './carousel-component'
import GoldsmithLabeledSection from './GoldsMith'
import SvgShadow from './SvgShadow'
import BoxReveal from './BoxReveal'
import { laboratories } from '@/lib/v1/constants'

function ThumnailSlider() {
  const OPTIONS: EmblaOptionsType = { loop: true }
  return (
    <section
      dir="ltr"
      className="w-full  max-w-3xl mx-auto max-h-[80dvh] md:my-24 "
    >
      <h2 className="px-2 py-1 mb-1 w-fit text-center mx-auto text-3xl md:text-4xl mix-blend-multiply font-bold text-pretty glass   title-color">
        آزمایشگاه
      </h2>
      <div className="rounded-t-lg   glass p-0.5  mx-auto">
        <Carousel options={OPTIONS} className=" relative" isAutoPlay={true}>
          <SliderContainer className="gap-1">
            {laboratories.map((laboratory, index) => (
              <Slider
                key={`slide-${index}`}
                className="relative  h-[45vh] md:h-[80vh]  w-full rounded-md overflow-hidden "
                thumbnail={<GoldsmithLabeledSection title={laboratory.title} />}
              >
                <motion.figure
                  initial={{ zoom: 1.3 }}
                  whileInView={{ zoom: 1 }}
                  transition={{ duration: 0.3 }}
                  viewport={{ once: false }}
                  className="w-full h-full relative "
                >
                  <Image
                    sizes="100%"
                    src={laboratory.image}
                    fill
                    alt={laboratory.title}
                    className="h-full  object-cover rounded-lg w-full"
                  />
                </motion.figure>
                <SvgShadow className="!z-[3]" />
                <div className="absolute -bottom-2  w-full h-24 mix-blend-hard-light flex items-start justify-center  line-clamp-2 custom-box-shadow backdrop-blur-[3px]  rounded-md px-0.5 bg-primary/30 ">
                  <BoxReveal duration={0.4}>
                    <p
                      dir="rtl"
                      className={
                        'flex bg-transparent items-center justify-center w-full rounded-t-2xl h-full text-center p-2  text-sm text-black/90 font-semibold '
                      }
                    >
                      {laboratory.description}
                    </p>
                  </BoxReveal>
                </div>
              </Slider>
            ))}
          </SliderContainer>
          <ThumsSlider />
        </Carousel>
      </div>
    </section>
  )
}

export default ThumnailSlider
