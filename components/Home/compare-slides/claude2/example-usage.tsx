/**
 * Example: app/(marketing)/results/page.tsx
 *
 * Shows the intended integration: real photo assets via next/image,
 * a display font loaded through next/font, and an explicit item list —
 * nothing about the clinic's procedures is hardcoded in the component.
 */
// import { Playfair_Display, Inter } from 'next/font/google'

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
import after7 from '@/public/images/b-a/Submental-after.webp'
import after8 from '@/public/images/b-a/8.webp'
import after9 from '@/public/images/b-a/9.webp'
import after10 from '@/public/images/b-a/10.webp'

import { ComparisonItem } from './types'

import { CosmeticComparator } from './cosmetic-comparator'

// const display = Playfair_Display({ subsets: ['latin'], weight: ['500', '600'] })
// const body = Inter({ subsets: ['latin'], weight: ['400', '500'] })

const CASES: ComparisonItem[] = [
  {
    id: '1',
    effect: 'ripple',
    procedureLabel: 'بلفاپلاستی',
    effectLabel: 'ripple',
    focusY: 0.84,
    seed: 7.3,
    before: {
      src: before1,
      alt: 'بیمار قبل از بلفاپلاستی، نمای روبه‌رو',
    },
    after: {
      src: after1,
      alt: 'بیمار بعد از بلفاپلاستی، نمای روبه‌رو',
    },
  },
  // {
  //   id: 'facelift-02',
  //   effect: 'chrysalis',
  //   procedureLabel: 'Deep Plane Facelift',
  //   effectLabel: 'chrysalis',
  //   focusY: 0.78,
  //   seed: 2.8,
  //   // No `before` photo supplied here on purpose — the shader synthesizes
  //   // a plausible aged plate from the after photo automatically.
  //   before: {
  //     src: after2,
  //     alt: 'Patient before rhinoplasty, front profile',
  //   },
  //   after: { src: before2, alt: 'Patient after deep plane facelift' },
  // },
  {
    id: '2',
    effect: 'iris',
    procedureLabel: 'تزریق چانه و فک',
    effectLabel: 'iris',
    focusY: 0.55,
    seed: 4.4,
    before: {
      src: before3,
      alt: 'بیمار قبل از جراحی پلک، نمای نزدیک',
    },
    after: {
      src: after3,
      alt: 'بیمار بعد از جراحی پلک، نمای نزدیک',
    },
  },

  {
    id: '3',
    effect: 'laser',
    procedureLabel: 'لیفت ابرو',
    effectLabel: 'laser',
    focusY: 0.55,
    seed: 4.4,
    before: {
      src: before4,
      alt: 'بیمار قبل از جراحی پلک، نمای نزدیک',
    },
    after: {
      src: after4,
      alt: 'بیمار بعد از جراحی پلک، نمای نزدیک',
    },
  },
  {
    id: '4',
    effect: 'peel',
    procedureLabel: 'لیفت صورت',
    effectLabel: 'peel',
    focusY: 0.55,
    seed: 4.4,
    before: {
      src: before5,
      alt: 'بیمار قبل از جراحی پلک، نمای نزدیک',
    },
    after: {
      src: after5,
      alt: 'بیمار بعد از جراحی پلک، نمای نزدیک',
    },
  },
  {
    id: '5',
    effect: 'silk',
    procedureLabel: 'عمل بینی',
    effectLabel: 'silk',
    focusY: 0.55,
    seed: 4.4,
    before: {
      src: before6,
      alt: 'بیمار قبل از جراحی پلک، نمای نزدیک',
    },
    after: {
      src: after6,
      alt: 'بیمار بعد از جراحی پلک، نمای نزدیک',
    },
  },
  // {
  //   id: 'blepharoplasty-03',
  //   effect: 'frost',
  //   procedureLabel: 'Blepharoplasty',
  //   effectLabel: 'Frost',
  //   focusY: 0.55,
  //   seed: 4.4,
  //   before: {
  //     src: before,
  //     alt: 'Patient before eyelid surgery, close-up',
  //   },
  //   after: {
  //     src: after1,
  //     alt: 'Patient after eyelid surgery, close-up',
  //   },
  // },
  // {
  //   id: 'blepharoplasty-03',
  //   effect: 'cells',
  //   procedureLabel: 'Blepharoplasty',
  //   effectLabel: 'cells',
  //   focusY: 0.55,
  //   seed: 4.4,
  //   before: {
  //     src: before,
  //     alt: 'Patient before eyelid surgery, close-up',
  //   },
  //   after: {
  //     src: after6,
  //     alt: 'Patient after eyelid surgery, close-up',
  //   },
  // },
  {
    id: '6',
    effect: 'ink',
    procedureLabel: 'عمل غبغب',
    effectLabel: 'ink',
    focusY: 0.55,
    seed: 4.4,
    before: {
      src: before7,
      alt: 'بیمار قبل از جراحی پلک، نمای نزدیک',
    },
    after: {
      src: after7,
      alt: 'بیمار بعد از جراحی پلک، نمای نزدیک',
    },
  },
  {
    id: '7',
    effect: 'tear',
    procedureLabel: 'رینوپلاستی',
    effectLabel: 'tear',
    focusY: 0.84,
    seed: 7.3,
    before: {
      src: before1,
      alt: 'بیمار قبل از رینوپلاستی، نمای روبه‌رو',
    },
    after: {
      src: after1,
      alt: 'بیمار بعد از رینوپلاستی، نمای روبه‌رو',
    },
  },

  // {
  //   id: '8',
  //   effect: 'mosaic',
  //   procedureLabel: 'بلفاروپلاستی',
  //   effectLabel: 'mosaic',
  //   focusY: 0.55,
  //   seed: 4.4,
  //   before: {
  //     src: before2,
  //     alt: 'بیمار قبل از جراحی پلک، نمای نزدیک',
  //   },
  //   after: {
  //     src: after2,
  //     alt: 'بیمار بعد از جراحی پلک، نمای نزدیک',
  //   },
  // },
  // {
  //   id: 'thread-lift-04',
  //   effect: 'thread',
  //   procedureLabel: 'PDO Thread Lift',
  //   effectLabel: 'Thread Lift',
  //   focusY: 0.72,
  //   seed: 9.1,
  //   // effect name matches the procedure directly — no `before` needed either,
  //   // the synthesized plate is used here.
  //   after: { src: after1, alt: 'Patient after PDO thread lift' },
  // },
  // --- Gold-edge ports from the home three.js slider (ZSliders.tsx) ---
  {
    id: '9',
    effect: 'blinds',
    procedureLabel: 'ترمیم',
    effectLabel: 'blinds',
    focusY: 0.55,
    seed: 1.7,
    before: { src: before1, alt: 'بیمار قبل از ترمیم' },
    after: { src: after1, alt: 'بیمار بعد از ترمیم' },
  },
  // {
  //   id: '10',
  //   effect: 'diagonal',
  //   procedureLabel: 'بوتاکس',
  //   effectLabel: 'diagonal',
  //   focusY: 0.55,
  //   seed: 3.1,
  //   before: { src: before2, alt: 'بیمار قبل از بوتاکس' },
  //   after: { src: after2, alt: 'بیمار بعد از بوتاکس' },
  // },
  // {
  //   id: '11',
  //   effect: 'liquid',
  //   procedureLabel: 'فیس‌لیفت',
  //   effectLabel: 'liquid',
  //   focusY: 0.55,
  //   seed: 5.9,
  //   before: { src: before3, alt: 'بیمار قبل از فیس‌لیفت' },
  //   after: { src: after3, alt: 'بیمار بعد از فیس‌لیفت' },
  // },
  {
    id: '12',
    effect: 'wave',
    procedureLabel: 'جراحی بینی',
    effectLabel: 'wave',
    focusY: 0.55,
    seed: 2.4,
    before: { src: before4, alt: 'بیمار قبل از جراحی بینی' },
    after: { src: after4, alt: 'بیمار بعد از جراحی بینی' },
  },
  {
    id: '13',
    effect: 'ripple',
    procedureLabel: 'جراحی بینی',
    effectLabel: 'ripple',
    focusY: 0.55,
    seed: 8.2,
    before: { src: before5, alt: 'بیمار قبل از جراحی بینی' },
    after: { src: after5, alt: 'بیمار بعد از جراحی بینی' },
  },
  // {
  //   id: '14',
  //   effect: 'crystalline',
  //   procedureLabel: 'جراحی بینی',
  //   effectLabel: 'crystalline',
  //   focusY: 0.55,
  //   seed: 6.6,
  //   before: { src: before6, alt: 'بیمار قبل از جراحی بینی' },
  //   after: { src: after6, alt: 'بیمار بعد از جراحی بینی' },
  // },
]

export default function ResultsPage() {
  return (
    <CosmeticComparator
      items={CASES}
      direction="rtl"
      showHero={false}
      showQuickNav={false}

      // Pass the shader comparator's own props through if needed:
      // showHero={false} showQuickNav={false}
      // The WebGL2 check decides between the shader system and the
      // tiered CSS/GSAP fallback automatically.
    />
  )
}

/**
 * Persian/RTL variant — swap in FA_COPY and set direction="rtl".
 *
 * import { FA_COPY } from '@/components/cosmetic-compare'
 * <CosmeticComparator items={CASES} direction="rtl" copy={FA_COPY} />
 */
