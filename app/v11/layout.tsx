import type { ReactNode } from 'react'
import './globals.css'
import { V11Shell } from './components/v11-shell'
import SmoothScroll from './components/smooth-scroll'
import Nav from './components/nav'
import Cursor from './components/cursor'

// /v11 is a self-contained frontend port (ShowcaseMD design recreation,
// chat-clone/showcasemd-website), Iranized for an Obstetrician &
// Gynecologist practice (متخصص زنان و زایمان). It deliberately renders NO
// shared chrome of the production site (no Navbar/Footer/Toaster markup),
// so nothing outside this subtree can style or script it. Its Tailwind
// build is fully scmd:-prefixed and every custom rule is .v11-scoped or
// gated on html[data-v11-active] (set by v11-shell while a /v11 route is
// mounted), so it can never touch production routes. The root layout
// still owns <html>/<body>; this layout only mounts the port's own fonts,
// Lenis scroll, cursor and nav around every /v11 page. The demo/subscribe
// APIs are mocks at /v11/api/* (in-memory, no Prisma) — swap them for the
// real backend when this route goes live.
export default function V11Layout({ children }: { children: ReactNode }) {
  return (
    <V11Shell>
      <SmoothScroll>
        <Cursor />
        <Nav />
        {children}
      </SmoothScroll>
    </V11Shell>
  )
}
