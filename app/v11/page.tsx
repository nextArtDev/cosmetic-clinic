import type { Metadata, Viewport } from 'next'
import Hero from './components/hero'
import Numbers from './components/numbers'
import Practice from './components/practice'
import Steps from './components/steps'
import Solutions from './components/solutions'
import Brands from './components/brands'
import Reviews from './components/reviews'
import CTA from './components/cta'
import Footer from './components/footer'
import { countDemoRequests } from './lib/mock-store'

export const metadata: Metadata = {
  title: 'مدنما — محتوای مانیتور اتاق انتظار برای کلینیک مغز و اعصاب | v11',
  description:
    'بازآفرینی فرانت‌اند طرح ShowcaseMD به‌عنوان نسخهٔ v11: با پخش ویدیوهای منتخب از خدمات شما روی مانیتورهای اتاق انتظار، گفت‌وگو و نوبت‌دهی کلینیک مغز و اعصاب دکتر آرمان صالحی، متخصص نورولوژی، بیشتر می‌شود.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f8f7f2',
}

export const dynamic = 'force-dynamic'

export default function V11Page() {
  const count = countDemoRequests()

  return (
    <main className="scmd:relative scmd:w-full">
      <Hero />
      <Numbers />
      <Practice />
      <Steps />
      <Solutions />
      <Brands />
      <Reviews />
      <CTA initialCount={count} />
      <Footer />
    </main>
  )
}
