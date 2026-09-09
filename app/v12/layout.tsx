import type { ReactNode } from 'react'
import './globals.css'
import { V12Shell } from './components/V12Shell'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'

// /v12 is a self-contained frontend port (THE GRIND design recreation,
// chat-clone/the-grind-website), Iranized for a Sports Medicine
// specialist practice (طب ورزشی و توان‌بخشی). It deliberately renders NO
// shared chrome of the production site (no Navbar/Footer/Toaster markup),
// so nothing outside this subtree can style or script it. Its Tailwind
// build is fully tg:-prefixed and every custom rule is .v12-scoped or
// gated on html[data-v12-active] (set by V12Shell while a /v12 route is
// mounted), so it can never touch production routes. The root layout
// still owns <html>/<body>. Preloader and Navbar wrap every /v12 page
// from here. The leads API is a mock at /v12/api/leads (in-memory, no
// Prisma) — swap it for the real backend when this route goes live.
export default function V12Layout({ children }: { children: ReactNode }) {
  return (
    <V12Shell>
      <Preloader />
      <Navbar />
      {children}
    </V12Shell>
  )
}
