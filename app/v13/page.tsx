import type { Metadata, Viewport } from 'next'
import CookieBanner from './components/cookie-banner'
import HomeExperience from './components/home-experience'
import Navbar from './components/navbar'
import PageTransition from './components/page-transition'
import SocialIcons from './components/social-icons'

export const metadata: Metadata = {
  title: 'دکتر آرش نیک‌آیین — روان‌درمانی در تهران و آنلاین | v13',
  description:
    'من دکتر آرش نیک‌آیین هستم؛ روان‌شناس و درمانگر شناختی‌رفتاری. در اتاق من پذیرش، همدلی و صداقت پیدا می‌کنید، فارغ از اینکه کی هستید.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#243d30',
}

export default function V13HomePage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <SocialIcons />
      <PageTransition />
      <HomeExperience />
      <div className="scrollbar" aria-hidden="true">
        <div className="scroll-item main" data-scroll-item />
      </div>
      <CookieBanner />
    </div>
  )
}
