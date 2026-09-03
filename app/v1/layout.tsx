import type { Metadata } from 'next'
import { Navbar } from './components/layout/navbar'
import { Footer } from './components/layout/footer'

// All /v1 pages read live database data (prisma) at request time. Skip
// static prerendering — the database only exists at runtime on the server.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: 'کلینیک ۴۰۴ — نوبت‌دهی آنلاین تخصصی',
    template: '%s | کلینیک ۴۰۴',
  },
  description:
    'کلینیک تخصصی ۴۰۴؛ رزرو نوبت آنلاین از پزشکان متخصص قلب، پوست، اطفال، ارتوپدی و داخلی. بدون نیاز به معرفی‌نامه.',
}

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-ink text-ivory antialiased">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
