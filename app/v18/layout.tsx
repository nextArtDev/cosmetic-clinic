import type { ReactNode } from 'react';
import './melius.tailwind.css';

// /v18 layout — mounts ONLY the port's own Tailwind entry around every /v18
// page: melius.tailwind.css is a dedicated Tailwind v4 CSS-first entry with the
// `mel:` prefix, a local @source allowlist and NO Preflight — it cannot
// override the application's utilities or theme variables. Direction/language
// stay on this wrapper; no document-level changes. The root layout still owns
// <html>/<body>, exactly like every other /vN route.
export default function V18Layout({ children }: { children: ReactNode }) {
  return (
    <div lang="fa" dir="rtl">
      {children}
    </div>
  );
}
