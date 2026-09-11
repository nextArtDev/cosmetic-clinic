import type { ReactNode } from 'react';
import './flowers.tailwind.css';

// /v19 layout — mounts ONLY the port's own Tailwind entry around every /v19
// page: flowers.tailwind.css is the upstream route-only Tailwind v4 CSS-first
// entry with the `fl:` prefix, `source(none)` and NO Preflight — it can only
// emit `.fl\:*` utilities used inside app/v19/_components, so it cannot
// override the application's utilities or theme variables. Direction/language
// stay on this wrapper; no document-level changes. The root layout still owns
// <html>/<body>, exactly like every other /vN route.
export default function V19Layout({ children }: { children: ReactNode }) {
  return (
    <div lang="fa" dir="rtl">
      {children}
    </div>
  );
}
