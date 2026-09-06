import type { Metadata } from 'next'
import { V5Shell } from './components/v5-shell'
import NovaSite from './components/nova-site'

export const metadata: Metadata = {
  title: 'کاشت مو در تهران | کلینیک تخصصی — v5',
  description:
    'نسخه آزمایشی طراحی v5: مشاوره شخصی، روش SBAR، تعرفه شفاف و پیگیری ۱۲ ماهه. مسیر غیرفهرست‌شده.',
  robots: { index: false, follow: false },
}

export default function V5Page() {
  return (
    <V5Shell>
      <NovaSite />
    </V5Shell>
  )
}
