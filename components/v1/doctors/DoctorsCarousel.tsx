'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Star, Clock3 } from 'lucide-react'
import type { V1Doctor } from '@/lib/v1/data'
import { cn } from '@/lib/utils'

interface DoctorsCarouselProps {
  doctors: V1Doctor[]
}

/**
 * Auto-scrolling doctor carousel — pure CSS marquee + hover pause, with
 * manual prev/next. Mirrors kosar's embla carousel without adding deps.
 */
export function DoctorsCarousel({ doctors }: DoctorsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const loop = [...doctors, ...doctors]

  const scrollBy = useCallback((dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onScroll = () => {
      const max = track.scrollWidth - track.clientWidth
      setProgress(max > 0 ? (track.scrollLeft / max) * 100 : 0)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-4">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <h2 className="v1-title-gradient text-center text-2xl font-bold text-pretty md:text-4xl">
          کادر درمان
        </h2>
        <div className="flex items-center gap-4">
          <button
            aria-label="قبلی"
            onClick={() => scrollBy(-1)}
            className="v1-glass v1-shadow flex h-10 w-10 items-center justify-center rounded-full text-black/70 transition-transform hover:scale-110"
          >
            <ChevronRight size={18} />
          </button>
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/40 backdrop-blur-md">
            <div
              className="h-full rounded-full bg-teal-700/70 transition-transform"
              style={{ transform: `translateX(${progress}%)`, width: '100%' }}
            />
          </div>
          <button
            aria-label="بعدی"
            onClick={() => scrollBy(1)}
            className="v1-glass v1-shadow flex h-10 w-10 items-center justify-center rounded-full text-black/70 transition-transform hover:scale-110"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        dir="rtl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className={cn(
            'flex shrink-0 animate-marquee items-stretch gap-5',
            paused && '[animation-play-state:paused]',
          )}
          style={{ '--duration': '45s' } as React.CSSProperties}
        >
          {loop.map((d, i) => (
            <Link
              key={`${d.slug}-${i}`}
              href={`/v1/doctors/${d.slug}`}
              className="group relative block w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl"
              style={{
                background:
                  'linear-gradient(to bottom, #add8e6 0%, #fff8dc 60%, #30e8bf60 100%)',
              }}
            >
              <div className="relative flex h-52 items-center justify-around gap-2 px-2">
                <div className="flex flex-1 flex-col items-center gap-1 text-center">
                  <p className="text-lg font-semibold text-teal-800">
                    دکتر {d.name}
                  </p>
                  <p className="line-clamp-2 px-2 text-xs text-black/60">
                    {d.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-sm text-amber-600">
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                    {d.rating}
                  </div>
                </div>
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={d.imageUrl ?? '/v1/images/blank-profile-picture.png'}
                    alt={d.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-1 flex flex-wrap items-center gap-1 px-3">
                {d.schedule.slice(0, 3).map((s) => (
                  <span
                    key={`${d.slug}-${s.dayOfWeek}`}
                    className="rounded-md border border-green-700/40 bg-white/50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700"
                  >
                    {s.startTime}
                  </span>
                ))}
                {d.nextAvailable && (
                  <span className="flex items-center gap-1 rounded-md bg-teal-700/10 px-1.5 py-0.5 text-[10px] font-semibold text-teal-800">
                    <Clock3 size={10} />
                    {d.nextAvailable}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
