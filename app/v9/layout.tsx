import type { ReactNode } from 'react'
import './globals.css'
import { V9Shell } from './components/v9-shell'
import { SiteShell } from './components/site-shell'

// /v9 is a self-contained frontend port (Rafaela Salvato dermatologia design
// recreation, chat-clone/httpsricardoseola-salvato, Iranized for a dental
// clinic). It deliberately renders NO shared chrome of the production site
// (no Navbar/Footer/Toaster markup), so nothing outside this subtree can
// style or script it. There is no Tailwind import here at all: every rule in
// v9/globals.css is .v9-scoped or gated on html[data-v9-active] (set by
// v9-shell while a /v9 route is mounted), so it can never touch production
// routes. The root layout still owns <html>/<body>. Nav, footer and the
// booking dialog wrap every /v9 page from here (same architecture as the
// source site). The booking API is a mock at /v9/api/appointments
// (in-memory, no Prisma) — swap it for the real backend when this route
// goes live.
export default function V9Layout({ children }: { children: ReactNode }) {
  return (
    <V9Shell>
      <SiteShell>{children}</SiteShell>
    </V9Shell>
  )
}
