import type { Metadata, Viewport } from 'next'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Features from './components/Features'
import Mindset from './components/Mindset'
import Testimonials from './components/Testimonials'
import Story from './components/Story'
import Faq from './components/Faq'
import LeadForm from './components/LeadForm'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: 'دکتر بهرام رستگار — متخصص طب ورزشی و توان‌بخشی | v12',
  description:
    'بازآفرینی فرانت‌اند طرح THE GRIND به‌عنوان نسخهٔ v12: تشخیص، درمان و توان‌بخشی مصدومیت‌های ورزشی، بازگشت ایمن به ورزش و برنامهٔ تمرینی شخصی با دکتر بهرام رستگار. درخواست بررسی در چند دقیقه.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
}

export default function V12Page() {
  return (
    <main className="tg:relative">
      <Hero />
      <Intro />
      <Features />
      <Mindset />
      <Testimonials />
      <Story />
      <Faq />
      <LeadForm />
      <Footer />
    </main>
  )
}
