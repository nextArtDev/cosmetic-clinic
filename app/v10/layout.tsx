import type { ReactNode } from 'react'
import './globals.css'
import { V10Shell } from './components/v10-shell'
import { CartProvider } from './components/cart-provider'
import { SiteHeader } from './components/site-header'
import { SmoothScroll } from './components/smooth-scroll'
import { Dialogs } from './components/dialogs'

// /v10 is a self-contained frontend port (NERVANA design recreation,
// chat-clone/nervana), Iranized for an Obstetrician & Gynecologist
// practice (متخصص زنان و زایمان). It deliberately renders NO shared chrome
// of the production site (no Navbar/Footer/Toaster markup), so nothing
// outside this subtree can style or script it. Its Tailwind build is fully
// nv:-prefixed and every custom rule is .v10-scoped or gated on
// html[data-v10-active] (set by v10-shell while a /v10 route is mounted),
// so it can never touch production routes. The root layout still owns
// <html>/<body>. Header, dialogs and Lenis wrap every /v10 page from here.
// The cart API is a mock at /v10/api/* (in-memory, no Prisma) — swap it
// for the real backend when this route goes live.
export default function V10Layout({ children }: { children: ReactNode }) {
  return (
    <V10Shell>
      <CartProvider>
        <SmoothScroll />
        <SiteHeader />
        {children}
        <Dialogs />
      </CartProvider>
    </V10Shell>
  )
}
