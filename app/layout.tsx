import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: {
    default: 'جراحی پلاستیک و زیبایی — دکتر نگین فضلی',
    template: '%s | دکتر نگین فضلی',
  },
  description:
    'کلینیک جراحی پلاستیک، زیبایی و ترمیمی دکتر نگین فضلی؛ رینوپلاستی، فیس‌لیفت، لیپوساکشن و پروتز. رزرو نوبت آنلاین و پرداخت آنلاین.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fa-IR"
      dir="rtl"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col suppressHydrationWarning">
        <Toaster richColors position="top-center" />
        {children}
      </body>
    </html>
  )
}
