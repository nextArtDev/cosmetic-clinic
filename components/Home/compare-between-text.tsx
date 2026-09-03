'use client'

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ReactCompareSlider,
  ReactCompareSliderHandle,
} from 'react-compare-slider'

const cn = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(' ')

interface CombinedMediaCompareProps {
  firstText: string
  secondText: string
  index: number
  before: string
  after: string
  disease: string
  disableHandle?: boolean
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: any
  leftTextClassName?: string
  rightTextClassName?: string
  /**
   * Control how the media opens
   * @default "scroll" - opens based on scroll position
   * "manual" - control via isOpen prop
   * "hover" - opens on hover
   */
  triggerType?: 'scroll' | 'manual' | 'hover'
  /**
   * Manually control if media is open (only works with triggerType="manual")
   */
  isOpen?: boolean
  /**
   * Scroll range for animation [start, end]
   * @default [0.3, 0.7]
   */
  scrollRange?: [number, number]
  /**
   * Direction of media opening
   * @default "horizontal" - opens left to right between text
   * "vertical" - opens top to bottom between text
   */
  direction?: 'horizontal' | 'vertical'
}

export type CombinedMediaCompareRef = {
  animate: () => void
  reset: () => void
}

export const CombinedMediaCompare = forwardRef<
  CombinedMediaCompareRef,
  CombinedMediaCompareProps
>(
  (
    {
      firstText,
      secondText,
      index = 1,
      before,
      after,
      disease,
      disableHandle = false,
      className,
      leftTextClassName,
      rightTextClassName,
      triggerType = 'scroll',
      isOpen = false,
      scrollRange = [0.3, 0.7],
      direction = 'horizontal',
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    // Scroll-driven values (updated asynchronously by framer-motion).
    const [scrollPosition, setScrollPosition] = useState(index === 1 ? 0 : 100)
    const [mediaDimension, setMediaDimension] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ['start end', 'end start'],
    })

    const isReversed = index % 2 !== 0

    const position = useTransform(
      scrollYProgress,
      scrollRange,
      isReversed ? [100, 0] : [0, 100]
    )

    const dimensionProgress = useTransform(
      scrollYProgress,
      scrollRange,
      [0, 100]
    )

    // Register framer-motion value listeners only for scroll-driven mode.
    useEffect(() => {
      if (triggerType !== 'scroll') return
      const unsubscribeDimension = dimensionProgress.onChange((v) =>
        setMediaDimension(v)
      )
      const unsubscribePosition = position.onChange((v) =>
        setScrollPosition(v)
      )
      return () => {
        unsubscribeDimension()
        unsubscribePosition()
      }
    }, [triggerType, position, dimensionProgress])

    useImperativeHandle(ref, () => ({
      animate: () => {},
      reset: () => {},
    }))

    // Manual / hover triggers are derived during render (no setState in effect).
    const activated =
      triggerType === 'scroll'
        ? true
        : triggerType === 'manual'
          ? isOpen
          : isHovered

    const dimension = triggerType === 'scroll' ? mediaDimension : activated ? 100 : 0
    const sliderPosition =
      triggerType === 'scroll'
        ? scrollPosition
        : activated
          ? isReversed
            ? 0
            : 100
          : isReversed
            ? 100
            : 0

    return (
      <div
        ref={containerRef}
        className={cn(
          'flex items-center',
          direction === 'vertical' ? 'flex-col' : '',
          className
        )}
        onMouseEnter={() => triggerType === 'hover' && setIsHovered(true)}
        onMouseLeave={() => triggerType === 'hover' && setIsHovered(false)}
      >
        <motion.p layout className={leftTextClassName}>
          {firstText}
        </motion.p>

        <motion.div
          className="overflow-hidden"
          style={
            direction === 'horizontal'
              ? {
width:
                        triggerType === 'scroll' ? `${dimension}%` : undefined,
                    opacity: dimension > 0 ? 1 : 0,
                }
              : {
                  height:
                    triggerType === 'scroll' ? `${dimension}%` : undefined,
                  opacity: dimension > 0 ? 1 : 0,
                  width: '100%',
                }
          }
          animate={
            triggerType === 'manual' || triggerType === 'hover'
              ? direction === 'horizontal'
                ? {
                    width: dimension > 0 ? 'auto' : 0,
                    transition: { duration: 0.4, type: 'spring', bounce: 0 },
                  }
                : {
                    height: dimension > 0 ? 'auto' : 0,
                    transition: { duration: 0.4, type: 'spring', bounce: 0 },
                  }
              : undefined
          }
        >
          <div
            dir="ltr"
            className="max-w-[96vw] mx-auto h-auto flex items-center justify-center backdrop-blur-sm p-4"
          >
            <div className="relative w-[98vw] h-[50vh] max-w-4xl shadow-2xl rounded-lg overflow-hidden">
              <ReactCompareSlider
                itemOne={
                  <div className="w-[98vw] h-[50vh]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={before}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded">
                      پیش از {disease}
                    </div>
                  </div>
                }
                itemTwo={
                  <div className="w-[98vw] h-[50vh]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={after}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded">
                      پس از {disease}
                    </div>
                  </div>
                }
                position={sliderPosition}
                onPositionChange={setScrollPosition}
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
                <div className="absolute inset-0 bg-transparent z-[1]"></div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.p layout className={rightTextClassName}>
          {secondText}
        </motion.p>
      </div>
    )
  }
)

CombinedMediaCompare.displayName = 'CombinedMediaCompare'

// Demo Component
export default function Demo() {
  const [manualOpen, setManualOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto space-y-[100vh]">
        <div className="text-center mb-16 h-screen flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Combined Media Compare Component
          </h1>
          <p className="text-slate-300 mb-2">
            Horizontal and Vertical directions
          </p>
        </div>

        {/* Example 1 - Horizontal (default) */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-amber-400">
            1. Horizontal Direction (Default)
          </h2>
          <CombinedMediaCompare
            firstText="تبدیل کنید"
            secondText="با درمان ما"
            before="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop"
            after="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop"
            disease="پوست"
            index={1}
            direction="horizontal"
            className="text-4xl font-bold text-white justify-center"
            leftTextClassName="mr-4 whitespace-nowrap"
            rightTextClassName="ml-4 whitespace-nowrap"
          />
        </div>

        {/* Example 2 - Vertical */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-blue-400">
            2. Vertical Direction
          </h2>
          <CombinedMediaCompare
            firstText="ببینید تفاوت را"
            secondText="نتایج شگفت‌انگیز"
            before="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=600&fit=crop"
            after="https://images.unsplash.com/photo-1559056199-2c7d2df7d6fa?w=800&h=600&fit=crop"
            disease="بازسازی"
            index={2}
            direction="vertical"
            className="text-5xl font-bold text-white text-center"
            leftTextClassName="mb-4 whitespace-nowrap"
            rightTextClassName="mt-4 whitespace-nowrap"
          />
        </div>

        {/* Example 3 - Vertical with manual control */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 justify-center">
            <h2 className="text-2xl font-bold text-green-400">
              3. Vertical + Manual Control
            </h2>
            <button
              onClick={() => setManualOpen(!manualOpen)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              {manualOpen ? 'Close' : 'Open'}
            </button>
          </div>
          <CombinedMediaCompare
            firstText="شگفت‌انگیز"
            secondText="نتایج درمان"
            before="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop"
            after="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&h=600&fit=crop"
            disease="درمان"
            index={3}
            direction="vertical"
            triggerType="manual"
            isOpen={manualOpen}
            className="text-3xl font-bold text-white text-center"
            leftTextClassName="mb-4 whitespace-nowrap"
            rightTextClassName="mt-4 whitespace-nowrap"
          />
        </div>

        {/* Example 4 - Horizontal with hover */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-purple-400">
            4. Horizontal + Hover
          </h2>
          <p className="text-slate-300 text-center">
            Hover over the text to reveal
          </p>
          <CombinedMediaCompare
            firstText="قبل از"
            secondText="بعد از"
            before="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop"
            after="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop"
            disease="جراحی"
            index={4}
            direction="horizontal"
            triggerType="hover"
            disableHandle={true}
            className="text-4xl font-bold text-white justify-center"
            leftTextClassName="mr-4 whitespace-nowrap"
            rightTextClassName="ml-4 whitespace-nowrap"
          />
        </div>

        <div className="h-screen flex items-center justify-center">
          <p className="text-white text-2xl">
            Scroll back up to see animations
          </p>
        </div>
      </div>
    </div>
  )
}
