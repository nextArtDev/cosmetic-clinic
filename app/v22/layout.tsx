import type { ReactNode } from 'react';

// /v22 layout — a pass-through. The آریاسنگ port ships all of its own styles
// in a single route-local sheet (components/elitone.module.css scopes every
// rule under `.experience`, with @font-face for the route-local /v22 fonts)
// plus a prefixed, preflight-free route-local Tailwind entry. Nothing here
// touches <html>/<body>, shared theme variables, or global scroll behavior,
// so the home page and every other route are untouched — exactly like every
// other /vN route, the root layout still owns the document.
export default function V22Layout({ children }: { children: ReactNode }) {
  return children;
}
