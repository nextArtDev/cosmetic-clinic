import type { Metadata, Viewport } from 'next'
import { ShaninaSite } from './components/shanina-site'
import './globals.css'

export const metadata: Metadata = {
  title: 'دکتر شبنم فضلی — مراقبت تخصصی از پوست و زیبایی شما',
  description:
    'رویکردی جامع به پوست سالم و زیبا. مشاوره‌های آنلاین شخصی‌سازی‌شده پوست با دکتر شبنم فضلی، پزشک زیبایی با بیش از ۲۰ سال تجربه.',
  openGraph: {
    title: 'دکتر شبنم فضلی — پوست شما. قصه شما. مراقبت شما.',
    description: 'توصیه‌های شخصی پوست، در هر نقطه از دنیا که باشید.',
    images: [
      { url: '/v2/images/hero-bg-d-scaled.webp', width: 2560, height: 1357 },
    ],
    type: 'website',
  },
  robots: { index: false, follow: false },
}
export const viewport: Viewport = {
  themeColor: '#e7ddcc',
}

export default function V2Page() {
  return <ShaninaSite />
}
