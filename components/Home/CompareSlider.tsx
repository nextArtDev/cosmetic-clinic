'use client'
import {
  ReactCompareSlider,
  ReactCompareSliderHandle,
} from 'react-compare-slider'
import { useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

import Image, { StaticImageData } from 'next/image'
import { cn } from '@/lib/utils'

interface CompareSliderProps {
  index: number
  before: StaticImageData
  after: StaticImageData
  disease: string
  disableHandle?: boolean
  className?: string
}
const CompareSlider = ({
  index = 1,
  before,
  after,
  disease,
  disableHandle = false,
  className,
}: CompareSliderProps) => {
  const containerRef = useRef(null)
  const [sliderPosition, setSliderPosition] = useState(index === 1 ? 0 : 100)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const isReversed = index % 2 !== 0 // Reverse direction for odd indices

  const position = useTransform(
    scrollYProgress,
    [0.3, 0.7],
    isReversed ? [100, 0] : [0, 100],
  )

  useEffect(() => {
    const unsubscribe = position.onChange((v) => setSliderPosition(v))
    return () => unsubscribe()
  }, [position])

  return (
    <div
      dir="ltr"
      ref={containerRef}
      className={cn(
        'max-w-[96vw] mx-auto h-auto flex items-center justify-center   backdrop-blur-sm p-4',
        className,
      )}
    >
      <div className="relative  w-[98vw] h-[50vh] max-w-4xl shadow-2xl rounded-lg overflow-hidden">
        <ReactCompareSlider
          // defaultValue={index === 0 ? 1 : 100}
          itemOne={
            <div className=" w-[98vw] h-[50vh] ">
              <Image
                fill
                src={before.src}
                alt="Before"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded">
                پیش از {disease}
              </div>
            </div>
          }
          itemTwo={
            <div className=" w-[98vw] h-[50vh] ">
              <Image
                fill
                src={after.src}
                alt="After"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded">
                پس از {disease}
              </div>
            </div>
          }
          // position={50}
          position={sliderPosition}
          onPositionChange={setSliderPosition}
          handle={
            <ReactCompareSliderHandle
              style={{ color: 'yellow', border: 'none' }}
              linesStyle={{ opacity: 0 }}
              buttonStyle={{
                display: 'none',
              }}
            />
          }
        />
        {disableHandle && (
          <div className="absolute inset-0 bg-transparent z-[1]  "></div>
        )}
      </div>
    </div>
  )
}

export default CompareSlider
