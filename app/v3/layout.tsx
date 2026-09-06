import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { SiteShell } from './components/site-shell'
import { shabnamV3 } from './fonts'
import './globals.css'

// /v3 is a self-contained frontend port (editorial design in the style of
// L’AGENCE Design Studio) carrying the real content of the clinic (Dr.
// Shabnam Fazli). The SiteShell is the ONLY wrapper it gets: it renders NO
// shared chrome from the production app (no Navbar/Footer/Toaster), scopes
// its own styles under .v3 / html[data-v3-active] (see globals.css), and
// unmounts cleanly. The root layout still owns <html>/<body>.
export const metadata: Metadata = {
  title: {
    default: 'کلینیک جراحی پلاستیک و زیبایی — دکتر شبنم فضلی',
    template: '%s | دکتر شبنم فضلی',
  },
  description:
    'کلینیک تخصصی جراحی پلاستیک، زیبایی و ترمیمی دکتر شبنم فضلی؛ جراحی بینی، فیس‌لیفت، لیپوساکشن و پروتز. رزرو نوبت آنلاین در چند دقیقه.',
  openGraph: {
    title: 'کلینیک جراحی پلاستیک و زیبایی — دکتر شبنم فضلی',
    description:
      'کلینیک تخصصی جراحی پلاستیک، زیبایی و ترمیمی دکتر شبنم فضلی؛ جراحی بینی، فیس‌لیفت، لیپوساکشن و پروتز. رزرو نوبت آنلاین در چند دقیقه.',
    locale: 'fa_IR',
    type: 'website',
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#f3f0eb',
}

export default function V3Layout({ children }: { children: ReactNode }) {
  return (
    <div className={shabnamV3.variable}>
      <SiteShell>{children}</SiteShell>
    </div>
  )
}
