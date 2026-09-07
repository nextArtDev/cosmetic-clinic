import type { ReactNode } from 'react'
import './globals.css'

// /v7 is a self-contained frontend port (Dr. Grigoriak design recreation,
// chat-clone/grigoriak, Iranized for a laser specialist). It deliberately
// renders NO shared chrome (no Navbar/Footer/Toaster markup) so nothing
// outside this subtree can style or script it. There is no Tailwind import
// here at all: every rule is .v7-scoped or gated on html[data-v7-active]
// (set by v7-shell while a /v7 route is mounted), so it can never touch
// production routes. The root layout still owns <html>/<body>.
export default function V7Layout({ children }: { children: ReactNode }) {
  return children
}
