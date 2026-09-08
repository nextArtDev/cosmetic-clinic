import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { V8Shell } from './components/v8-shell'
import ClinicSite from './components/clinic-site'
import './globals.css'

// /v8 is a self-contained frontend port (Clingr design recreation,
// chat-clone/clinger, Iranized for a cardiology / orthopedics /
// neurology / psychiatry clinic). It deliberately renders NO shared
// chrome of the production site (no Navbar/Footer/Toaster markup), so
// nothing outside this subtree can style or script it. There is NO
// Tailwind import here: every rule in v8/globals.css is .v8-scoped or
// gated on html[data-v8-active] (set by v8-shell while a /v8 route is
// mounted), so it can never touch production routes. The root layout
// still owns <html>/<body>. Forms + reviews post to mock APIs under
// /v8/api (in-memory, no Prisma) — swap them for the real backend when
// this route goes live.
export const metadata: Metadata = {
  title: 'کلینیک قلب مهر — دکتر آرش صادقی، متخصص قلب و عروق — نسخه v8',
  description:
    'نسخه آزمایشی طراحی v8: کلینیک تخصصی قلب و عروق دکتر آرش صادقی؛ نوار قلب، اکو، تست ورزش و نوبت‌دهی آنلاین. مسیر غیرفهرست‌شده.',
  robots: { index: false, follow: false },
}

export default function V8Layout({ children }: { children: ReactNode }) {
  return (
    <V8Shell>
      <ClinicSite />
    </V8Shell>
  )
}
