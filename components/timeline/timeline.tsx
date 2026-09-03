'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface TimelineEntry {
  id?: string
  title: React.ReactNode
  content: React.ReactNode
}

/**
 * Scroll-driven vertical timeline (Aceternity-style), RTL-native.
 * A sticky date column on the inline-start edge (right in RTL), content
 * cards on the other side, and a vertical line that fills with a
 * gold→sage gradient as the user scrolls.
 *
 * All offsets/paddings use logical properties (start/ps), so the whole
 * layout mirrors correctly with the surrounding document direction.
 *
 * `variant` switches the chrome between the dark Meridian /user page
 * ('dark', default) and a light theme ('light', e.g. the dashboard).
 * Content cards are supplied by the caller and carry their own theme.
 */
export const Timeline = ({
  data,
  variant = 'dark',
  showHeader = true,
}: {
  data: TimelineEntry[]
  variant?: 'dark' | 'light'
  showHeader?: boolean
}) => {
  const dark = variant === 'dark'
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => setHeight(el.getBoundingClientRect().height)
    measure()

    // Keep the line container height correct if images load late or the
    // viewport resizes after mount.
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 10%', 'end 50%'],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  return (
    <div ref={containerRef} className="w-full">
      {showHeader && (
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <h2
            className={cn(
              'max-w-4xl font-display text-2xl md:text-4xl',
              dark ? 'text-ivory' : 'text-foreground',
            )}
          >
            تایم‌لاین ویزیت‌ها
          </h2>
          <p
            className={cn(
              'mt-3 max-w-md text-sm',
              dark ? 'text-ivory-dim' : 'text-muted-foreground',
            )}
          >
            مراحل درمان و ویزیت‌های شما — با اسکرول، خط زمان پر می‌شود و هر
            ویزیت در تاریخ خودش می‌نشیند.
          </p>
        </div>
      )}

      <div ref={ref} className="relative mx-auto max-w-7xl pb-20">
        <ol className="list-none">
          {data.map((item, index) => (
            <li
              key={item.id ?? index}
              className="flex justify-start pt-10 md:gap-10 md:pt-24"
            >
              <div className="sticky top-40 z-30 flex max-w-xs flex-col items-center self-start md:w-full md:max-w-sm md:flex-row">
                <div
                  className={cn(
                    'absolute start-3 flex h-10 w-10 items-center justify-center rounded-full',
                    dark ? 'bg-ink' : 'bg-background',
                  )}
                >
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border p-2',
                      dark ? 'border-gold/60 bg-ink' : 'border-border bg-background',
                    )}
                  />
                </div>
                <h3
                  className={cn(
                    'hidden text-xl font-bold md:block md:ps-20 md:text-5xl',
                    dark ? 'text-ivory-dim' : 'text-muted-foreground',
                  )}
                >
                  {item.title}
                </h3>
              </div>

              <div className="relative w-full ps-20 pe-4 md:ps-4">
                <h3
                  className={cn(
                    'mb-4 block text-start text-2xl font-bold md:hidden',
                    dark ? 'text-ivory-dim' : 'text-muted-foreground',
                  )}
                >
                  {item.title}
                </h3>
                {item.content}
              </div>
            </li>
          ))}
        </ol>

        <div
          style={{
            height: height + 'px',
          }}
          className={cn(
            'absolute start-8 top-0 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]',
            dark ? 'via-glass-border' : 'via-border',
          )}
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className={cn(
              'absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-[0%] via-[10%] to-transparent',
              dark
                ? 'from-gold via-sage'
                : 'from-primary via-primary/40',
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default Timeline
