import type { Metadata, Viewport } from 'next'
import { Experience } from './components/shiraz'

export const metadata: Metadata = {
  title: 'دکتر مریم شریفی — متخصص زنان، زایمان و نازایی | v10',
  description:
    'بازآفرینی فرانت‌اند طرح NERVANA به‌عنوان نسخهٔ v10: مراقبت دوران بارداری، زایمان آرام، مشاورهٔ آنلاین و سلامت زنان با دکتر مریم شریفی. رزرو نوبت در چند دقیقه.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e7ddcc',
}

export default function V10Page() {
  return <Experience />
}
