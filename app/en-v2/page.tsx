import type { Metadata } from 'next'
import { ShaninaSite } from './components/shanina-site'
import './globals.css'

export const metadata: Metadata = {
  title: 'Doctor Shanina — Expert care for your skin & beauty',
  description:
    'A holistic approach to healthy, beautiful skin. Personalized online skincare consultations with Dr. Anna Shanina, a cosmetic doctor with 20 years of experience.',
  openGraph: {
    title: 'Doctor Shanina — Your skin. Your story. Your care.',
    description: 'Personalized skincare advice, wherever you are in the world.',
    images: [
      { url: '/v2/images/hero-bg-d-scaled.webp', width: 2560, height: 1357 },
    ],
    type: 'website',
  },
  robots: { index: false, follow: false },
}

export default function V2Page() {
  return <ShaninaSite />
}
