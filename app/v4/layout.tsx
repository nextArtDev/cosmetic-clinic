import type { ReactNode } from 'react'
import './globals.css'

// /v4 is a self-contained frontend port (PEGASUS CLINIC design recreation).
// It deliberately renders NO shared chrome (no Navbar/Footer/Toaster markup)
// so nothing outside this subtree can style or script it, and its own styles
// are fully .v4-scoped. The root layout still owns <html>/<body>.
export default function V4Layout({ children }: { children: ReactNode }) {
  return children
}
