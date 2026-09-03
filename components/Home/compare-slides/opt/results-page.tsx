/**
 * Production integration for the home page. Server component: photo imports
 * and the item list stay out of the client bundle (only serializable data
 * crosses the RSC boundary), and the heavy system is deferred below.
 *
 * Every `id` is unique — ids double as React keys and `#stage-<id>` anchors,
 * so duplicates break both. Your previous list repeated `blepharoplasty-03`
 * five times, which is why quick-nav jumps always landed on the same frame.
 */

import beforeBlepho from '@/public/images/b-a/belfa1-b.webp'
import afterBlepho from '@/public/images/b-a/belfa1-a.webp'
import beforeChin from '@/public/images/b-a/chins-b.webp'
import afterChin from '@/public/images/b-a/chins-a-r.webp'
import beforeChinAlt from '@/public/images/b-a/chins1-b.webp'
import afterChinAlt from '@/public/images/b-a/chins1-a.webp'
import beforeBrow from '@/public/images/b-a/ebro1-b.webp'
import afterBrow from '@/public/images/b-a/ebro1-a.webp'
import beforeFacelift from '@/public/images/b-a/face-lift1-b.webp'
import afterFacelift from '@/public/images/b-a/face-lift1-a.webp'
import beforeRhino from '@/public/images/b-a/rhinoplasti-before.webp'
import afterRhino from '@/public/images/b-a/rhinoplasti-after.webp'
import beforeSubmental from '@/public/images/b-a/Submental-before-r.webp'
import afterSubmental from '@/public/images/b-a/Submental-after.webp'

import DeferredComparator from './deferred-comparator'
import type { ComparisonItem } from './types'

const CASES: ComparisonItem[] = [
  {
    id: 'blepharoplasty-ripple',
    effect: 'ripple',
    procedureLabel: 'جراحی پلک',
    effectLabel: 'ripple',
    focusY: 0.55,
    seed: 7.3,
    before: { src: beforeBlepho, alt: 'بیمار پیش از جراحی پلک، نمای روبه‌رو' },
    after: { src: afterBlepho, alt: 'بیمار پس از جراحی پلک، نمای روبه‌رو' },
  },
  {
    id: 'chin-surgery-iris',
    effect: 'iris',
    procedureLabel: 'جراحی چانه',
    effectLabel: 'iris',
    focusY: 0.55,
    seed: 4.4,
    before: {
      src: beforeChinAlt,
      alt: 'بیمار پیش از جراحی چانه، نمای روبه‌رو',
    },
    after: { src: afterChinAlt, alt: 'بیمار پس از جراحی چانه، نمای روبه‌رو' },
  },
  {
    id: 'brow-lift-laser',
    effect: 'laser',
    procedureLabel: 'لیفت ابرو',
    effectLabel: 'laser',
    focusY: 0.55,
    seed: 2.8,
    before: { src: beforeBrow, alt: 'بیمار پیش از لیفت ابرو، نمای روبه‌رو' },
    after: { src: afterBrow, alt: 'بیمار پس از لیفت ابرو، نمای روبه‌رو' },
  },
  {
    id: 'facelift-peel',
    effect: 'peel',
    procedureLabel: 'فیس‌لیفت',
    effectLabel: 'peel',
    focusY: 0.55,
    seed: 9.1,
    before: { src: beforeFacelift, alt: 'بیمار پیش از فیس‌لیفت، نمای روبه‌رو' },
    after: { src: afterFacelift, alt: 'بیمار پس از فیس‌لیفت، نمای روبه‌رو' },
  },
  {
    id: 'rhinoplasty-silk',
    effect: 'silk',
    procedureLabel: 'جراحی بینی',
    effectLabel: 'silk',
    focusY: 0.84,
    seed: 5.6,
    before: { src: beforeRhino, alt: 'بیمار پیش از جراحی بینی، نمای روبه‌رو' },
    after: { src: afterRhino, alt: 'بیمار پس از جراحی بینی، نمای روبه‌رو' },
  },
  {
    id: 'submental-contouring-ink',
    effect: 'ink',
    procedureLabel: 'فرم‌دهی زیرچانه',
    effectLabel: 'ink',
    focusY: 0.55,
    seed: 3.2,
    before: {
      src: beforeSubmental,
      alt: 'بیمار پیش از فرم‌دهی زیرچانه، نمای روبه‌رو',
    },
    after: {
      src: afterSubmental,
      alt: 'بیمار پس از فرم‌دهی زیرچانه، نمای روبه‌رو',
    },
  },
  {
    id: 'blepharoplasty-tear',
    effect: 'tear',
    procedureLabel: 'جراحی پلک',
    effectLabel: 'tear',
    focusY: 0.84,
    seed: 7.9,
    before: { src: beforeBlepho, alt: 'بیمار پیش از جراحی پلک، نمای روبه‌رو' },
    after: { src: afterBlepho, alt: 'بیمار پس از جراحی پلک، نمای روبه‌رو' },
  },
  {
    id: 'chin-surgery-mosaic',
    effect: 'mosaic',
    procedureLabel: 'جراحی چانه',
    effectLabel: 'mosaic',
    focusY: 0.55,
    seed: 6.1,
    before: { src: beforeChin, alt: 'بیمار پیش از جراحی چانه، نمای سه‌رخ' },
    after: { src: afterChin, alt: 'بیمار پس از جراحی چانه، نمای سه‌رخ' },
  },
]

export default function ResultsPage() {
  // `copyPreset` is a plain string on purpose: ComparatorCopy carries label
  // functions, which can't cross the Server→Client boundary.
  return <DeferredComparator items={CASES} direction="rtl" copyPreset="fa" />
}
