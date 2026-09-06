import type { ReactNode } from 'react'
import './globals.css'

// /v2 is a self-contained frontend port (Doctor Shanina). It deliberately
// renders NO shared chrome (no Navbar/Footer/Toaster/preloader markup) so
// nothing outside this subtree can style or script it, and its own styles
// are fully .v2-scoped. The root layout still owns <html>/<body>.
export default function V2Layout({ children }: { children: ReactNode }) {
  return children
}
