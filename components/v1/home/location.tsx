'use client'

import { cn } from '@/lib/utils'

function Location({ className }: { className?: string }) {
  const location =
    'https://neshan.org/maps/iframe/places/6520b78add055da6408847612216dc93#c31.934-49.309-15z-0p/31.933719730814467/49.30375953350042'
  return (
    <iframe
      title="مجتمع پزشکی کوثر مسجدسلیمان"
      src={location}
      width="100%"
      height="125"
      allowFullScreen
      loading="lazy"
      className={cn('rounded-md ', className)}
    ></iframe>
  )
}

export default Location
