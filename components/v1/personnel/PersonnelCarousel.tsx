import Image from 'next/image'
import type { V1Personnel } from '@/lib/v1/data'

interface PersonnelCarouselProps {
  personnel: V1Personnel[]
}

/**
 * Personnel cards — static grid (responsive), matching kosar's card style.
 */
export function PersonnelCarousel({ personnel }: PersonnelCarouselProps) {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <h2 className="v1-title-gradient mb-8 text-center text-2xl font-bold md:text-4xl">
        پرسنل کلینیک
      </h2>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {personnel.map((p) => (
          <div
            key={p.id}
            className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl px-4 pt-6 pb-8"
            style={{
              background:
                'linear-gradient(to bottom, #add8e6 0%, #fff8dc 60%, #30e8bf60 100%)',
            }}
          >
            <div className="relative h-24 w-24 overflow-hidden rounded-full">
              <Image
                src={p.imageUrl ?? '/v1/images/blank-profile-picture.png'}
                alt={p.fullName}
                fill
                sizes="96px"
                className="object-cover mix-blend-multiply"
              />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-lg font-semibold text-teal-900">
                {p.fullName}
              </p>
              <p className="text-sm text-black/60">{p.position}</p>
              {p.bio && (
                <p className="mt-1 line-clamp-2 text-xs text-black/50">
                  {p.bio}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
