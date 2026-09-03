/* ============================================================================
   Demo data — shield radius now in cqi (scales with card).
============================================================================ */

import { BodySculptShowcase, SurgerySlide } from './QBodySculptShowcase'

// import { BodySculptShowcase, SurgerySlide } from './AdvancedBodySculptShowcase'

// const MAIN_A =
//   'https://image.qwenlm.ai/public_source/21dc9c45-ed8c-44dd-9820-2c93e92a0d09/153bf0a1b-c2f2-4e31-b2d0-252e286a4b2e.png'
// const MAIN_B =
//   'https://image.qwenlm.ai/public_source/21dc9c45-ed8c-44dd-9820-2c93e92a0d09/1e723934a-f90e-4149-83d6-978199ff4e35.png'
const MAIN_A = '/images/face.jpg'
const MAIN_B = '/images/stomack.jpg'

const FACE_B =
  'https://image.qwenlm.ai/public_source/21dc9c45-ed8c-44dd-9820-2c93e92a0d09/1374e329d-9571-4c25-af55-4a738ba7fd30.png'
const FACE_A =
  'https://image.qwenlm.ai/public_source/21dc9c45-ed8c-44dd-9820-2c93e92a0d09/1884317c7-b300-4759-b3da-c27408f3aa4e.png'
const BREAST_B =
  'https://image.qwenlm.ai/public_source/21dc9c45-ed8c-44dd-9820-2c93e92a0d09/1973fcbf3-b2d2-4d65-9f2c-8afcf49d22cd.png'
const BREAST_A =
  'https://image.qwenlm.ai/public_source/21dc9c45-ed8c-44dd-9820-2c93e92a0d09/18ffc9b1d-87af-4463-91ea-7b81da5cf885.png'
const ABDO_B =
  'https://image.qwenlm.ai/public_source/21dc9c45-ed8c-44dd-9820-2c93e92a0d09/1ad146249-8eba-4547-b2e1-2b06bbf9f089.png'
const ABDO_A =
  'https://image.qwenlm.ai/public_source/21dc9c45-ed8c-44dd-9820-2c93e92a0d09/1f265dde9-2bf4-4e68-9723-292f9a02390f.png'
const WAIST_B =
  'https://image.qwenlm.ai/public_source/21dc9c45-ed8c-44dd-9820-2c93e92a0d09/13d248e04-12d2-47e0-99da-e7781a3d3ce4.png'
const WAIST_A =
  'https://image.qwenlm.ai/public_source/21dc9c45-ed8c-44dd-9820-2c93e92a0d09/18e773789-5e5f-4034-98d4-09f2c3cf5d7f.png'

const SLIDES: SurgerySlide[] = [
  {
    id: 'brow',
    menuSide: 'left',
    title: 'Brow Lift',
    subtitle: 'Forehead Lift',
    beforeImage: FACE_B,
    afterImage: FACE_A,
    panelClassName: 'left-[20%] top-[30%]',
    lines: [{ x1: 40, y1: 45, x2: 62, y2: 45, origin: 'left' }],
    dots: [{ x: 40, y: 45 }],
    shield: { left: 52, top: 37.5, width: 38, height: 10, radius: 4.4 },
  },
  {
    id: 'lipo',
    menuSide: 'right',
    title: 'Liposuction',
    subtitle: 'Body Contouring',
    imageSrc: MAIN_B,
    beforeImage: WAIST_B,
    afterImage: WAIST_A,
    panelClassName: 'left-[38%] top-[50%]',
    lines: [{ x1: 50, y1: 80.5, x2: 51, y2: 60, origin: 'top' }],
    dots: [{ x: 50, y: 60 }],
    shield: { left: 18.5, top: 66, width: 72, height: 20, radius: 6.9 },
  },
  {
    id: 'bleph',
    menuSide: 'left',
    title: 'Blepharoplasty',
    subtitle: 'Eyelid Surgery',
    beforeImage: FACE_B,
    afterImage: FACE_A,
    panelClassName: 'left-[48%] top-[48%]',
    lines: [{ x1: 40, y1: 58, x2: 60, y2: 58, origin: 'right' }],
    dots: [{ x: 60, y: 58 }],
    shield: { left: 13, top: 45, width: 35, height: 15.5, radius: 3.4 },
  },
  {
    id: 'abdo',
    menuSide: 'right',
    title: 'Abdominoplasty',
    subtitle: 'Tummy Tuck',
    imageSrc: MAIN_B,
    beforeImage: ABDO_B,
    afterImage: ABDO_A,
    panelClassName: 'left-[38%] top-[45%]',
    // lines: [{ x1: 62.5, y1: 42, x2: 92, y2: 42, origin: 'right' }],
    // dots: [{ x: 92, y: 42 }],
    shield: { left: 18.5, top: 60, width: 72, height: 30, radius: 6.9 },
  },
  {
    id: 'submental',
    menuSide: 'left',
    title: 'Submental Lipo',
    subtitle: 'Double Chin Liposuction',
    beforeImage: FACE_B,
    afterImage: FACE_A,
    panelClassName: 'left-[38%] top-[63%]',
    // lines: [{ x1: 60.5, y1: 73, x2: 92, y2: 73, origin: 'right' }],
    // dots: [{ x: 92, y: 73 }],
    shield: { left: 25.5, top: 78.5, width: 50, height: 20, radius: 4.7 },
  },
  {
    id: 'breast',
    menuSide: 'right',
    title: 'Breast Augmentation',
    subtitle: 'Breast Implants',
    imageSrc: MAIN_B,
    beforeImage: BREAST_B,
    afterImage: BREAST_A,
    panelClassName: 'left-[35%] top-[28%]',
    // lines: [{ x1: 8, y1: 28.5, x2: 38, y2: 28.5, origin: 'left' }],
    // dots: [{ x: 8, y: 28.5 }],
    shield: { left: 10, top: 40.5, width: 80, height: 28, radius: 6.3 },
  },
  {
    id: 'rhino',
    menuSide: 'left',
    title: 'Rhinoplasty',
    subtitle: 'Nose Job',
    beforeImage: FACE_B,
    afterImage: FACE_A,
    panelClassName: 'left-[35%] top-[35%]',
    // lines: [{ x1: 57.5, y1: 12.5, x2: 92, y2: 12.5, origin: 'right' }],
    // dots: [{ x: 92, y: 12.5 }],
    shield: { left: 36.5, top: 54, width: 27, height: 22, radius: 3.8 },
  },
  {
    id: 'mammo',
    menuSide: 'right',
    title: 'Mammoplasty',
    subtitle: 'Breast Lift / Reduction',
    imageSrc: MAIN_B,
    beforeImage: BREAST_B,
    afterImage: BREAST_A,
    panelClassName: 'left-[34%] top-[25%]',
    // lines: [{ x1: 8, y1: 28.5, x2: 38, y2: 28.5, origin: 'left' }],
    // dots: [{ x: 8, y: 28.5 }],
    shield: { left: 10, top: 40.5, width: 80, height: 28, radius: 6.3 },
  },
  {
    id: 'inject',
    menuSide: 'left',
    title: 'Injectables',
    subtitle: 'Fillers · Botox · Mesotherapy',
    beforeImage: FACE_B,
    afterImage: FACE_A,
    panelClassName: 'left-[35%] top-[42%]',
    // lines: [{ x1: 59.5, y1: 50, x2: 92, y2: 50, origin: 'left' }],
    // dots: [{ x: 92, y: 50 }],
    shield: { left: 12, top: 55, width: 75, height: 25, radius: 4.1 },
  },
  {
    id: 'face',
    menuSide: 'right',
    title: 'Facelift',
    subtitle: 'Rhytidectomy',
    beforeImage: FACE_B,
    afterImage: FACE_A,
    panelClassName: 'left-[34%] top-[5%]',
    // lines: [{ x1: 8, y1: 12, x2: 38, y2: 12, origin: 'left' }],
    // dots: [{ x: 8, y: 12 }],
    shield: { left: 10, top: 18, width: 80, height: 80, radius: 5.3 },
  },
  {
    id: 'chin',
    menuSide: 'left',
    title: 'Chin & Cheek',
    subtitle: 'Implants · Contouring',
    beforeImage: FACE_B,
    afterImage: FACE_A,
    panelClassName: 'left-[38%] top-[63%]',
    // lines: [{ x1: 60.5, y1: 73, x2: 92, y2: 73, origin: 'right' }],
    // dots: [{ x: 92, y: 73 }],
    shield: { left: 25.5, top: 78.5, width: 50, height: 20, radius: 4.7 },
  },
]

export default function AdvancedBodyCarousel() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0c0604] bg-[radial-gradient(90%_70%_at_50%_30%,#1c0f08_0%,#0c0604_70%)] px-4 py-10">
      <BodySculptShowcase
        imageSrc={MAIN_A}
        imageAlt="Full-body reference for plastic surgery procedures"
        slides={SLIDES}
        autoplayMs={5200}
        idleResumeMs={8000}
      />
    </main>
  )
}
