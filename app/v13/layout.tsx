import type { ReactNode } from 'react'
import './globals.css'
import { V13Shell } from './components/v13-shell'

// /v13 is a self-contained frontend port (thegrind.nl — Maciej Maćkowiak
// psychologist site, chat-clone/maciej), Iranized for a Persian
// psychologist (دکتر آرش نیک‌آیین), following the /v7 and /v11 pattern.
// It deliberately renders NO shared chrome of the production site (no
// Navbar/Footer/Toaster markup), so nothing outside this subtree can
// style or script it. There is no Tailwind import here: every rule is
// .v13-scoped or gated on html[data-v13-active] (set by v13-shell while a
// /v13 route is mounted), so it can never touch production routes. The
// root layout still owns <html>/<body>; this layout only mounts the
// port's own fonts around every /v13 page. The newsletter API is a mock
// at /v13/api/khabarnameh (in-memory, no Prisma) — swap it for the real
// backend when this route goes live.
export default function V13Layout({ children }: { children: ReactNode }) {
  return <V13Shell>{children}</V13Shell>
}
