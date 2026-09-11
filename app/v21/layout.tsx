import type { ReactNode } from 'react';

// /v21 layout — a pass-through. The UNION port ships all of its own styles in
// two route-local sheets (components/union.module.css scopes every rule under
// `.experience`, with @font-face for the route-local /union/ fonts; components/
// union.tailwind.css emits only `union:`-prefixed utilities, no preflight).
// Nothing here touches <html>/<body>, shared theme variables, or global scroll
// behavior, so the home page and every other route are untouched — exactly
// like every other /vN route, the root layout still owns the document.
export default function V21Layout({ children }: { children: ReactNode }) {
  return children;
}
