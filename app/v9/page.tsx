import type { Metadata } from 'next'
import { HomePage } from './components/home-page'

export const metadata: Metadata = {
  title: 'کلینیک دندانپزشکی دکتر سپیده نادری — v9',
  description:
    'نسخه آزمایشی طراحی v9: بازآفرینی فرانت‌اند «Rafaela Salvato» برای یک کلینیک دندانپزشکی در تهران. مسیر غیرفهرست‌شده و مستقل از سایت اصلی.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <HomePage />
}
