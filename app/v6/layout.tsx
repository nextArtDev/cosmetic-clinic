import type { ReactNode } from 'react'
import './globals.css'

// /v6 is a self-contained frontend port (LIKHA Aesthetic design recreation,
// chat-clone/likha-aesthetics — iranized for a cardiology + orthopedic
// practice). It deliberately renders NO shared chrome (no Navbar/Footer/
// Toaster markup) so nothing outside this subtree can style or script it.
// Its Tailwind build is fully lk:-prefixed and every custom rule is
// .v6-scoped or gated on html[data-v6-active] (set by v6-shell while a
// /v6 route is mounted), so it can never touch production routes. The root
// layout still owns <html>/<body>.
export default function V6Layout({ children }: { children: ReactNode }) {
  return children
}
