// import BOrtodensi from '../../../public/images/b-a/1.webp'
// import AOrtodensi from '../../../public/images/b-a/main.webp'
// import BJermgiri from '../../../public/images/b-a/2.webp'
// import AJermgiri from '../../../public/images/b-a/main.webp'
// import BMasnoei from '../../../public/images/b-a/3.webp'
// import AMasnoei from '../../../public/images/b-a/main.webp'
// import BTarmim from '../../../public/images/b-a/4.webp'
// import ATarmim from '../../../public/images/b-a/main.webp'
import before1 from '@/public/images/b-a/belfa1-b.webp'
import before2 from '@/public/images/b-a/chins-b.webp'
import before3 from '@/public/images/b-a/chins1-b.webp'
import before4 from '@/public/images/b-a/ebro1-b.webp'
import before5 from '@/public/images/b-a/face-lift1-b.webp'
import before6 from '@/public/images/b-a/rhinoplasti-before.webp'
import before7 from '@/public/images/b-a/Submental-before-r.webp'
import after1 from '@/public/images/b-a/belfa1-a.webp'
import after2 from '@/public/images/b-a/chins-a-r.webp'
import after3 from '@/public/images/b-a/chins1-a.webp'
import after4 from '@/public/images/b-a/ebro1-a.webp'
import after5 from '@/public/images/b-a/face-lift1-a.webp'
import after6 from '@/public/images/b-a/rhinoplasti-after.webp'
// import after7 from '@/public/images/b-a/Submental-after.webp'
import ShaderCompareSlider, { type ShaderVariant } from './ZCompare'

interface Slide {
  before: typeof before1
  after: typeof after1
  disease: string
  variant: ShaderVariant
}

const SLIDES: Slide[] = [
  { before: before1, after: after1, disease: 'ترمیم', variant: 'blinds' },
  { before: before2, after: after2, disease: 'بوتاکس', variant: 'diagonal' },
  { before: before3, after: after3, disease: 'فیس‌لیفت', variant: 'liquid' },
  { before: before4, after: after4, disease: 'جراحی بینی', variant: 'wave' },
  { before: before5, after: after5, disease: 'جراحی بینی', variant: 'ripple' },
  {
    before: before6,
    after: after6,
    disease: 'جراحی بینی',
    variant: 'crystalline',
  },
]

const ZShaderCompareSlides = () => {
  return (
    <section
      dir="rtl"
      className="relative w-full overflow-x-clip bg-neutral-950 py-10 md:py-20"
    >
      <div className="mx-auto mb-10 max-w-7xl px-4 text-center md:mb-16">
        <span className="text-xs font-semibold tracking-[0.35em] text-amber-300/70">
          نتایج درمان
        </span>
        <h2 className="mt-3 text-3xl font-extralight tracking-tight text-neutral-100 md:text-5xl">
          تحولی که با ما تجربه می‌کنید
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-light text-neutral-400">
          برای مشاهده نتایج، اسکرول کنید.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row xl:flex-wrap xl:justify-center">
        {SLIDES.map((slide, index) => (
          <div
            key={index}
            className="w-full xl:w-1/2 xl:px-4"
            style={{
              zIndex: index + 1,
              marginBottom: index < SLIDES.length - 1 ? '-40vh' : 0,
            }}
          >
            <ShaderCompareSlider
              before={slide.before}
              after={slide.after}
              disease={slide.disease}
              index={index}
              variant={slide.variant}
              stackIndex={Math.floor(index / 2)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default ZShaderCompareSlides
