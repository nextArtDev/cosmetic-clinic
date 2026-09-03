'use client'

/* ============================================================================
   Demo data.
   Fix: `SurgerySlide` is a type, so it needs `import type` (a value import of a
   type breaks under `isolatedModules` / `verbatimModuleSyntax`, which Next
   enables by default in new TS projects).
   Dead commented-out annotation coords removed — shields carry the story.
============================================================================ */

import { BodySculptShowcase } from './OptBodySculptShowcase'
import type { SurgerySlide } from './OptBodySculptShowcase'

const MAIN_FACE = '/images/face.jpg'
const MAIN_BODY = '/images/stomack.jpg'

// const HOST =
//   'https://image.qwenlm.ai/public_source/21dc9c45-ed8c-44dd-9820-2c93e92a0d09'
// const FACE_B = `${HOST}/1374e329d-9571-4c25-af55-4a738ba7fd30.png`
// const FACE_A = `${HOST}/1884317c7-b300-4759-b3da-c27408f3aa4e.png`
// const BREAST_B = `${HOST}/1973fcbf3-b2d2-4d65-9f2c-8afcf49d22cd.png`
// const BREAST_A = `${HOST}/18ffc9b1d-87af-4463-91ea-7b81da5cf885.png`
// const ABDO_B = `${HOST}/1ad146249-8eba-4547-b2e1-2b06bbf9f089.png`
// const ABDO_A = `${HOST}/1f265dde9-2bf4-4e68-9723-292f9a02390f.png`
// const WAIST_B = `${HOST}/13d248e04-12d2-47e0-99da-e7781a3d3ce4.png`
// const WAIST_A = `${HOST}/18e773789-5e5f-4034-98d4-09f2c3cf5d7f.png`

const SLIDES: SurgerySlide[] = [
  {
    id: 'brow',
    menuSide: 'left',
    title: 'لیفت ابرو',
    subtitle: 'لیفت پیشانی',
    beforeImage: '/images/a/bro-lift.webp',
    // afterImage: FACE_A,
    panelClassName: 'left-[32%] top-[43%]',
    lines: [{ x1: 40, y1: 45, x2: 62, y2: 45, origin: 'left' }],
    dots: [{ x: 40, y: 45 }],
    shield: { left: 52, top: 37.5, width: 38, height: 10, radius: 4.4 },
  },
  {
    id: 'lipo',
    menuSide: 'right',
    title: 'لیپوساکشن',
    subtitle: 'فرم‌دهی اندام',
    imageSrc: MAIN_BODY,
    beforeImage: '/images/a/liposuction.webp',
    // afterImage: WAIST_A,
    panelClassName: 'left-[43%] top-[50%]',
    lines: [{ x1: 50, y1: 60, x2: 51, y2: 70.5, origin: 'bottom' }],
    dots: [{ x: 50, y: 60 }],
    shield: { left: 18.5, top: 66, width: 72, height: 20, radius: 6.9 },
  },
  {
    id: 'bleph',
    menuSide: 'left',
    title: 'بلفاروپلاستی',
    subtitle: 'جراحی پلک',
    beforeImage: '/images/a/belfa-1.webp',
    // afterImage: FACE_A,
    panelClassName: 'left-[28%] top-[73%]',
    lines: [{ x1: 32, y1: 58, x2: 33, y2: 75, origin: 'right' }],
    dots: [{ x: 32, y: 75 }],
    shield: { left: 13, top: 41, width: 35, height: 18.5, radius: 3.4 },
  },
  {
    id: 'abdo',
    menuSide: 'right',
    title: 'ابدومینوپلاستی',
    subtitle: 'لیفت شکم',
    imageSrc: MAIN_BODY,
    beforeImage: '/images/a/Abdiminoplasty.webp',
    // afterImage: ABDO_A,
    lines: [{ x1: 45, y1: 55, x2: 45, y2: 67.5, origin: 'bottom' }],
    dots: [{ x: 45, y: 54 }],
    panelClassName: 'left-[38%] top-[48%]',
    shield: { left: 18.5, top: 60, width: 72, height: 30, radius: 6.9 },
  },
  {
    id: 'submental',
    menuSide: 'left',
    title: 'عمل غبغب',
    subtitle: 'از بین بردن غبغب',
    beforeImage: '/images/a/chin-implant.webp',
    // afterImage: FACE_A,

    panelClassName: 'left-[25%] top-[62%]',
    lines: [{ x1: 32, y1: 70, x2: 33, y2: 90, origin: 'right' }],
    dots: [{ x: 32, y: 70 }],
    shield: { left: 25.5, top: 78.5, width: 50, height: 20, radius: 4.7 },
  },
  {
    id: 'breast',
    menuSide: 'right',
    title: 'بزرگ‌سازی سینه',
    subtitle: 'پروتز سینه',
    imageSrc: MAIN_BODY,
    beforeImage: '/images/a/breast.webp',
    // afterImage: BREAST_A,
    lines: [{ x1: 45, y1: 35, x2: 45, y2: 45, origin: 'bottom' }],
    dots: [{ x: 45, y: 35 }],
    panelClassName: 'left-[35%] top-[28%]',

    shield: { left: 10, top: 40.5, width: 80, height: 28, radius: 6.3 },
  },
  {
    id: 'rhino',
    menuSide: 'left',
    title: 'رینوپلاستی',
    subtitle: 'جراحی بینی',
    beforeImage: '/images/a/rhino.webp',
    // afterImage: FACE_A,
    lines: [{ x1: 50, y1: 40, x2: 50, y2: 33, origin: 'top' }],
    dots: [{ x: 50, y: 40 }],
    panelClassName: 'left-[41.5%] top-[35.5%]',
    shield: { left: 36.5, top: 54, width: 27, height: 22, radius: 3.8 },
  },
  {
    id: 'mammo',
    menuSide: 'right',
    title: 'ماستوپکسی',
    subtitle: 'لیفت و کوچک‌سازی سینه',
    imageSrc: MAIN_BODY,
    beforeImage: '/images/a/breast-lift.webp',
    // afterImage: BREAST_A,
    lines: [{ x1: 45, y1: 30, x2: 45, y2: 45, origin: 'bottom' }],
    dots: [{ x: 45, y: 30 }],
    panelClassName: 'left-[34%] top-[25%]',
    shield: { left: 10, top: 40.5, width: 80, height: 28, radius: 6.3 },
  },
  {
    id: 'inject',
    menuSide: 'left',
    title: 'تزریقات',
    subtitle: 'فیلر · بوتاکس · مزوتراپی',
    beforeImage: '/images/a/injectables.webp',
    // afterImage: FACE_A,
    lines: [{ x1: 38, y1: 45, x2: 39, y2: 70.5, origin: 'bottom' }],
    dots: [{ x: 38, y: 45 }],
    panelClassName: 'left-[35%] top-[42%]',
    shield: { left: 12, top: 55, width: 75, height: 35, radius: 4.1 },
  },
  {
    id: 'face',
    menuSide: 'right',
    title: 'فیس‌لیفت',
    subtitle: 'لیفت صورت',
    beforeImage: '/images/a/face-lift.webp',
    // afterImage: FACE_A,
    lines: [{ x1: 38, y1: 10, x2: 38, y2: 25, origin: 'bottom' }],
    dots: [{ x: 38, y: 10 }],
    panelClassName: 'left-[34%] top-[5%]',
    shield: { left: 10, top: 18, width: 80, height: 80, radius: 5.3 },
  },
  {
    id: 'chin',
    menuSide: 'left',
    title: 'چانه و گونه',
    subtitle: 'پروتز · فرم‌دهی',
    beforeImage: '/images/a/chin-implant.webp',
    // afterImage: FACE_A,
    lines: [{ x1: 48, y1: 71, x2: 49, y2: 95, origin: 'bottom' }],
    dots: [{ x: 48, y: 71 }],
    panelClassName: 'left-[38%] top-[63%]',
    shield: { left: 25.5, top: 78.5, width: 50, height: 20, radius: 4.7 },
  },
]

export default function AdvancedBodyCarousel() {
  return (
    <section className="flex min-h-svh items-center justify-center bg-[oklch(13%_0.014_46)] bg-[radial-gradient(90%_70%_at_50%_28%,oklch(21%_0.03_50)_0%,oklch(12%_0.012_44)_70%)] px-4 py-12">
      <BodySculptShowcase
        imageSrc={MAIN_FACE}
        imageAlt="تصویر مرجع برای مشخص‌کردن ناحیهٔ هر عمل"
        slides={SLIDES}
        autoplayMs={3200}
      />
    </section>
  )
}
