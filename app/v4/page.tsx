import type { Metadata } from 'next'
import ClinicSite from './components/clinic-site'
import { V4Shell } from './components/v4-shell'

export const metadata: Metadata = {
  title: 'کلینیک جراحی پلاستیک و زیبایی — دکتر شبنم فضلی | نمونهٔ طراحی v4',
  description:
    'بازطراحی آزمایشی رابط کلینیک دکتر شبنم فضلی در مسیر /v4؛ جراحی بینی، فیس‌لیفت، لیپوساکشن و پروتز با فرم رزرو نمونه. این مسیر نمایه‌سازی نمی‌شود.',
  robots: { index: false, follow: false },
}

export default function V4Page() {
  return (
    <V4Shell>
      <ClinicSite />
    </V4Shell>
  )
}
