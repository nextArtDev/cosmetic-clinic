/* eslint-disable @next/next/no-img-element */
'use client'
import { cn } from '@/lib/utils'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import SvgShadow from './SvgShadow'
type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imageSrc: any
  className?: string
  alt?: string
}

function ImageEffect({ imageSrc, className, alt }: Props) {
  const imageRef = useRef(null)
  const maskRef = useRef(null)
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  useEffect(() => {
    if (inView) {
      const tl = gsap.timeline()
      tl.from(imageRef.current, {
        scale: 2,
        duration: 1.5,
      })
        .to(
          maskRef.current,
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          },
          0,
        )
        .to(maskRef.current, { scale: 0.95, duration: 2 })
      return () => {
        tl.kill()
      }
    }
  }, [inView])
  return (
    <section
      ref={ref}
      className={cn(
        'ad flex justify-center items-center  rounded-md    gradient-base-r origin-center scale-95',
        className,
      )}
      style={{ borderRadius: '15px' }}
    >
      <div
        ref={maskRef}
        style={{ borderRadius: '15px' }}
        className="mask w-[98vw] h-[70vh] max-w-3xl max-h-3xl rounded-md overflow-hidden gradient-base"
      >
        <SvgShadow className={'!z-[3]'} />
        <img
          ref={imageRef}
          src={imageSrc}
          alt={alt ? alt : 'image'}
          className="z-[1] bus rounded-md object-cover w-full h-full"
        />
      </div>
    </section>
  )
}

export default ImageEffect
