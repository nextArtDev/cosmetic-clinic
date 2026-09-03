import Link from 'next/link'
import Image from 'next/image'
import type { V1Illness } from '@/lib/v1/data'

interface IllnessesCarouselProps {
  illnesses: V1Illness[]
}

/**
 * Illness cards — vertical stacked layout matching kosar's IllnessShowCard.
 */
export function IllnessesCarousel({ illnesses }: IllnessesCarouselProps) {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <h2 className="v1-title-gradient mb-8 text-center text-2xl font-bold md:text-4xl">
        بیماری‌ها
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {illnesses.map((ill) => (
          <Link
            key={ill.slug}
            href={`/v1/illnesses/${ill.slug}`}
            className="group relative flex h-72 w-full flex-col items-center justify-between overflow-hidden rounded-2xl text-white"
            style={{
              background:
                'linear-gradient(to bottom, #fff8dc 0%, #56c2d8 75%, #9ccb3d 100%)',
            }}
          >
            {/* Soft circle image */}
            <div className="absolute inset-x-0 top-10 z-0 flex justify-center opacity-90">
              <div className="relative h-36 w-36 overflow-hidden rounded-full mix-blend-hard-light">
                <Image
                  src={ill.imageUrl ?? '/v1/images/0000.webp'}
                  alt={ill.name}
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="relative z-10 mt-5 flex flex-col items-center gap-2 text-center">
              <p className="rounded-full px-3 text-xl font-semibold text-teal-900 drop-shadow-sm">
                {ill.name}
              </p>
            </div>

            <div className="relative z-10 m-3 line-clamp-3 w-[calc(100%-1.5rem)] rounded-md bg-white/30 p-2 text-sm font-semibold text-black/70 backdrop-blur-[3px]">
              {ill.description}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
