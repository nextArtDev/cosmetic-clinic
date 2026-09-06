import type { ReactNode } from 'react'
import './globals.css'

// /v5 is a self-contained frontend port (NOVA Capillaire design recreation,
// chat-clone/nova-capillaire). It deliberately renders NO shared chrome (no
// Navbar/Footer/Toaster markup) so nothing outside this subtree can style or
// script it. Its Tailwind build is fully nc:-prefixed and every custom rule
// is .v5-scoped or gated on html[data-v5-active] (set by v5-shell while a
// /v5 route is mounted), so it can never touch production routes. The root
// layout still owns <html>/<body>.
export default function V5Layout({ children }: { children: ReactNode }) {
  return children
}
