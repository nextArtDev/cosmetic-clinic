import type { ReactNode } from 'react'
import './privy.tailwind.css'

// /v17 layout — mounts ONLY the port's own styles around every /v17 page:
// - privy.module.css: every selector is a local, hashed CSS-Module class;
//   custom props are --gold/--paper/… declared on the .experience wrapper,
//   never on :root.
// - privy.tailwind.css: a dedicated Tailwind v4 CSS-first entry with the
//   `pv:` prefix, a local @source allowlist and NO Preflight — it cannot
//   override the application's utilities or theme variables.
// Direction/language stay on this wrapper; no document-level changes. The
// root layout still owns <html>/<body>, exactly like every other /vN route.
export default function V17Layout({ children }: { children: ReactNode }) {
  return (
    <div lang="fa" dir="rtl" data-privy-root>
      {children}
    </div>
  )
}
