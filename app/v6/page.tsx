import type { Metadata } from 'next'
import { V6Shell } from './components/v6-shell'
import SiteChrome from './components/SiteChrome'
import Hero from './components/Hero'
import QuickLinks from './components/QuickLinks'
import Treatments from './components/Treatments'
import Feature from './components/Feature'
import MyPick from './components/MyPick'
import Reviews from './components/Reviews'
import Visit from './components/Visit'
import CrossSell from './components/CrossSell'
import EnquiryForm from './components/EnquiryForm'
import Footer from './components/Footer'
import { treatments, doctors, quickLinks, reviews } from './lib/data'

export const metadata: Metadata = {
  title: 'کلینیک قلب و ارتوپدی درنا طب | v6',
  description:
    'نسخه آزمایشی طراحی v6: بازطراحی الگوی Likha برای کلینیک قلب و ارتوپدی. مسیر غیرفهرست‌شده.',
  robots: { index: false, follow: false },
}

export default function V6Page() {
  return (
    <V6Shell>
      <SiteChrome>
        <div id="page" className="home light">
          <Hero />
          <QuickLinks links={quickLinks} />
          <Treatments items={treatments} />
          <Feature />
          <MyPick items={doctors} />
          <Reviews items={reviews} />
          <Visit />
          <CrossSell />
          <EnquiryForm />
          <Footer />
        </div>
      </SiteChrome>
    </V6Shell>
  )
}
