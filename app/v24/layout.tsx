import type { ReactNode } from 'react';
// Import order is load-bearing. `numa.vendor.css` is the reference's own CSS
// with every selector prefixed by #v24-root; `numa.theme.css` carries the
// Persian/RTL corrections and deliberately outranks it (it doubles the wrapper
// selector, so it wins on specificity rather than on order). Both are emitted
// into this route's chunk only.
import './styles/numa.vendor.css';
import './styles/numa.theme.css';
// The only rules that are not scoped under the wrapper: Lenis's five `html.lenis`
// declarations. Each is gated on `html[data-v24-active]`, which the route shell
// sets on mount and restores on unmount, so they are inert everywhere else.
import './styles/numa.global.css';

// /v24 layout — a pass-through, exactly like every other /vN route. The root
// layout still owns the document; nothing here touches <html>, <body> or the
// shared theme tokens.
export default function V24Layout({ children }: { children: ReactNode }) {
  return children;
}
