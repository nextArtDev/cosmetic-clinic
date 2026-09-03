/* ============================================================================
   Demo parent — full-body image + one slide per procedure.
   Shield geometries are %-based → tweak freely, fully responsive.
============================================================================ */

import { BodySculptShowcase, SurgerySlide } from './BodySculptShowcase'

const DEMO_IMAGE =
  'https://image.qwenlm.ai/public_source/21dc9c45-ed8c-44dd-9820-2c93e92a0d09/1d8345d9b-5b1c-4345-84cb-56cc1fb229c8.png'

const SLIDES: SurgerySlide[] = [
  {
    id: 'brow',
    title: 'Brow Lift',
    subtitle: 'Forehead Lift',
    annotation: 'Opens the gaze,\nlifts the brow',
    textClassName: 'left-[70%] top-[5%] w-[26%] text-left',
    lines: [{ x1: 61, y1: 9, x2: 92, y2: 9, origin: 'right' }],
    dots: [{ x: 92, y: 9 }],
    shield: { left: 39, top: 5.5, width: 22, height: 7, radius: 28 },
  },
  {
    id: 'bleph',
    title: 'Blepharoplasty',
    subtitle: 'Eyelid Surgery',
    annotation: 'Refreshes tired,\nheavy lids',
    textClassName: 'left-[4%] top-[7%] w-[26%] text-left',
    lines: [{ x1: 8, y1: 10, x2: 40, y2: 10, origin: 'left' }],
    dots: [{ x: 8, y: 10 }],
    shield: { left: 40, top: 7, width: 20, height: 5.5, radius: 22 },
  },
  {
    id: 'rhino',
    title: 'Rhinoplasty',
    subtitle: 'Nose Job',
    annotation: 'Refines shape\nand profile',
    textClassName: 'left-[70%] top-[9%] w-[26%] text-left',
    lines: [{ x1: 57.5, y1: 12.5, x2: 92, y2: 12.5, origin: 'right' }],
    dots: [{ x: 92, y: 12.5 }],
    shield: { left: 42.5, top: 9, width: 15, height: 7, radius: 24 },
  },
  {
    id: 'face',
    title: 'Facelift',
    subtitle: 'Rhytidectomy',
    annotation: 'Restores firm,\nyouthful contours',
    textClassName: 'left-[4%] top-[8%] w-[26%] text-left',
    lines: [{ x1: 8, y1: 12, x2: 38, y2: 12, origin: 'left' }],
    dots: [{ x: 8, y: 12 }],
    shield: { left: 38, top: 6, width: 24, height: 12, radius: 34 },
  },
  {
    id: 'chin',
    title: 'Chin & Cheek Implants',
    subtitle: 'Facial Contouring',
    annotation: 'Defines chin and\ncheek projection',
    textClassName: 'left-[70%] top-[10%] w-[26%] text-left',
    lines: [{ x1: 60.5, y1: 13, x2: 92, y2: 13, origin: 'right' }],
    dots: [{ x: 92, y: 13 }],
    shield: { left: 39.5, top: 8.5, width: 21, height: 9, radius: 30 },
  },
  {
    id: 'submental',
    title: 'Submental Liposuction',
    subtitle: 'Double Chin Liposuction',
    annotation: 'Sharpens the\njawline angle',
    textClassName: 'left-[4%] top-[12%] w-[26%] text-left',
    lines: [{ x1: 8, y1: 16, x2: 41, y2: 16, origin: 'left' }],
    dots: [{ x: 8, y: 16 }],
    shield: { left: 41, top: 13, width: 18, height: 6.5, radius: 26 },
  },
  {
    id: 'inject',
    title: 'Injectables',
    subtitle: 'Fillers · Botox · Mesotherapy',
    annotation: 'Smooths lines,\nrestores glow',
    textClassName: 'left-[70%] top-[10%] w-[26%] text-left',
    lines: [{ x1: 59.5, y1: 13.5, x2: 92, y2: 13.5, origin: 'right' }],
    dots: [{ x: 92, y: 13.5 }],
    shield: { left: 40.5, top: 10, width: 19, height: 7, radius: 26 },
  },
  {
    id: 'breast',
    title: 'Breast Augmentation',
    subtitle: 'Breast Implants',
    annotation: 'Enhances volume\nand symmetry',
    textClassName: 'left-[70%] top-[25%] w-[26%] text-left',
    lines: [{ x1: 62, y1: 28.5, x2: 92, y2: 28.5, origin: 'right' }],
    dots: [{ x: 92, y: 28.5 }],
    shield: { left: 38, top: 23, width: 24, height: 11, radius: 40 },
  },
  {
    id: 'mammo',
    title: 'Mammoplasty',
    subtitle: 'Breast Lift / Reduction',
    annotation: 'Lifts and reshapes\nwith balance',
    textClassName: 'left-[4%] top-[25%] w-[26%] text-left',
    lines: [{ x1: 8, y1: 28.5, x2: 38, y2: 28.5, origin: 'left' }],
    dots: [{ x: 8, y: 28.5 }],
    shield: { left: 38, top: 22.5, width: 24, height: 12, radius: 40 },
  },
  {
    id: 'lipo',
    title: 'Liposuction',
    subtitle: 'Body Contouring',
    annotation: 'Sculpts waist\nand flanks',
    textClassName: 'left-[70%] top-[39%] w-[26%] text-left',
    lines: [{ x1: 62.5, y1: 42, x2: 92, y2: 42, origin: 'right' }],
    dots: [{ x: 92, y: 42 }],
    shield: { left: 37.5, top: 36, width: 25, height: 12, radius: 44 },
  },
  {
    id: 'abdo',
    title: 'Abdominoplasty',
    subtitle: 'Tummy Tuck',
    annotation: 'Flattens and\ntightens the core',
    textClassName: 'left-[4%] top-[45%] w-[26%] text-left',
    lines: [{ x1: 8, y1: 48, x2: 40, y2: 48, origin: 'left' }],
    dots: [{ x: 8, y: 48 }],
    shield: { left: 40, top: 42, width: 20, height: 12, radius: 40 },
  },
]
export default function BodyCarousel() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0c0604] bg-[radial-gradient(90%_70%_at_50%_30%,#1c0f08_0%,#0c0604_70%)] px-4 py-10">
      <BodySculptShowcase
        imageSrc={'/images/full-body.jpg'}
        imageAlt="Full-body reference for plastic surgery procedures"
        slides={SLIDES}
        handle="@lucianagalvezdermato"
        badge="TEAM"
        autoplayMs={5200}
      />
    </main>
  )
}
