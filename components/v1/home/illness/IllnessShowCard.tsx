import type { V1Illness } from '@/lib/v1/data'
import Image from 'next/image'
import style from '../Doctor/DoctorsCarousel.module.css'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import BoxReveal from '../BoxReveal'
import SvgShadow from '../SvgShadow'

type Props = {
  illness: V1Illness
  dir?: string
  isVertical?: boolean
}

function IllnessShowCard({ illness, dir = 'rtl' }: Props) {
  return (
    <Link href={`/v1/illnesses/${illness.slug}`}>
      <section
        dir={dir}
        style={{
          background:
            'linear-gradient(to bottom, #fff8dc 0%, #56C2D896 75%, #9CCB3D85 100%)',
        }}
        className={cn(
          ' relative  rounded-xl overflow-hidden max-w-sm w-[94vw] h-[50vh] gradient-base-r',
        )}
      >
        <SvgShadow className="!z-[3]" />

        <article className="text-primary-foreground  h-full w-full flex flex-col items-center justify-evenly gap-4   z-[2]">
          <div className="pt-4 flex-1">
            <BoxReveal boxColor="transparent" duration={0.2}>
              <p
                className={` rounded-full px-2  text-xl  font-semibold ${style.title}`}
              >
                {illness.name}
              </p>
            </BoxReveal>
          </div>

          <div className="z-[2] m-3 mix-blend-hard-light flex-1  line-clamp-3 custom-box-shadow backdrop-blur-[3px]  rounded-md p-0.5 bg-white/30 ">
            <BoxReveal duration={0.4}>
              <p
                className={' rounded-2xl h-full  p-2  text-sm  font-semibold '}
              >
                {illness.description}
              </p>
            </BoxReveal>
          </div>
        </article>
        <article className="absolute inset-0 top-12 ">
          <figure
            className={`z-[1]  ${style.eight}
              rounded-full  self-center `}
          >
            <Image
              fill
              alt={illness.name}
              className="eight  object-cover"
              src={illness.imageUrl || '/v1/images/0000.webp'}
            />
          </figure>
        </article>
      </section>
    </Link>
  )
}

export default IllnessShowCard
