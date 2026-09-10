import type { ReactNode } from 'react'
import './globals.css'
import { V15Shell } from './components/v15-shell'

// /v15 is a self-contained frontend port (delvaux/maison experience,
// https://int.delvaux.com/en — chat-clone/delvaux-clone-with-persian-),
// following the proven /v7 → /v13 isolation pattern. It deliberately
// renders NO shared chrome of the production site, imports NO Tailwind,
// and every rule is .v15-scoped or gated on html[data-v15-active] (set by
// v15-shell while a /v15 route is mounted, removed on unmount), so
// nothing here can affect the home page or any other route. The root
// layout still owns <html>/<body>; this layout only mounts the port's
// own styles around every /v15 page.
export default function V15Layout({ children }: { children: ReactNode }) {
  return <V15Shell>{children}</V15Shell>
}