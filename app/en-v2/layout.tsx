import type { ReactNode } from 'react'
import './globals.css'

// English (original) version of the shanina port. Same isolation rules as
// /v2: no shared chrome, fully .v2-scoped styles, root layout owns html/body.
export default function V2CopyLayout({ children }: { children: ReactNode }) {
  return children
}
