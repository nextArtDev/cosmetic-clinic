import type { ReactNode } from 'react';
import './styles/jacques.global.css';

// /v23 layout — a pass-through, exactly like every other /vN route.
//
// The only thing it contributes is the route's global stylesheet, whose single
// rule is gated on `html[data-v23-active]`. That attribute is set by the route
// shell while it is mounted and stripped on unmount, so the rule is inert on
// the home page and on every other route. The root layout still owns the
// document; nothing here touches <html>, <body> or the shared theme tokens.
export default function V23Layout({ children }: { children: ReactNode }) {
  return children;
}
