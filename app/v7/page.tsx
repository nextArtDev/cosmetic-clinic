import type { Metadata, Viewport } from 'next'
import { V7Shell } from './components/v7-shell'
import DoctorSite from './components/doctor-site'

export const metadata: Metadata = {
  title: 'لیزر مو و پوست | دکتر آرمان گریگوری — v7',
  description:
    'نسخه آزمایشی طراحی v7: بازآفرینی ساختار گریگوریاک برای یک متخصص لیزر مو و پوست در تهران. مسیر غیرفهرست‌شده و مستقل از سایت اصلی.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#090908',
}

export default function V7Page() {
  return (
    <V7Shell>
      <DoctorSite />
    </V7Shell>
  )
}
