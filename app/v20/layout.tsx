import type { ReactNode } from 'react';
import { vazirmatnV20 } from './fonts';
import './iranfit.css';

// /v20 layout — mounts ONLY the port's own stylesheet and font variable
// around every /v20 page. iranfit.css scopes every rule under `.iranfit-root`
// (custom props are declared there, never on :root), so the home page and
// every other route are untouched. Direction/language stay on the experience
// wrapper inside Landing; no document-level changes. The root layout still
// owns <html>/<body>, exactly like every other /vN route.
export default function V20Layout({ children }: { children: ReactNode }) {
  return <div className={vazirmatnV20.variable}>{children}</div>;
}
