import type { ReactNode } from 'react'
import './globals.css'
import { V14Shell } from './components/v14-shell'

// /v14 is a self-contained frontend port (thegrind.nl — Maciej Maćkowiak
// psychologist site, chat-clone/maciej), Iranized for a Persian
// psychologist (دکتر آرش نیک‌آیین), forked from /v13 with one difference:
// the DESKTOP horizontal-scroll journey is the ONLY layout. The original
// site (and /v13) falls back to a simplified vertical page on phones; v14
// keeps the 1368vw choreography at every viewport width instead, and
// scales the 1vw type system up on small screens (see the "v14
// mobile-usability pass" at the end of globals.css — scoped to <= 991px,
// so desktop rendering is identical to /v13). Isolation follows the /v7
// and /v11 pattern: it deliberately renders NO shared chrome of the
// production site, there is no Tailwind import, and every rule is
// .v14-scoped or gated on html[data-v14-active] (set by v14-shell while a
// /v14 route is mounted), so it can never touch production routes. The
// root layout still owns <html>/<body>; this layout only mounts the
// port's own fonts around every /v14 page. The newsletter API is a mock
// at /v14/api/khabarnameh (in-memory, no Prisma) — swap it for the real
// backend when this route goes live.
export default function V14Layout({ children }: { children: ReactNode }) {
  return <V14Shell>{children}</V14Shell>
}
