import type { SVGProps } from 'react';

/** V15 — Minimal hand-drawn social glyphs (lucide-react no longer ships
 * brand icons). Stroke-based to match the rest of the icon system.
 */

type P = SVGProps<SVGSVGElement>;

const base: P = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function InstagramIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.1" cy="6.9" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TelegramIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M21 4.5 3.8 11.2c-.8.3-.7 1.4.1 1.6l4.3 1.4 1.6 4.9c.3.8 1.3.9 1.8.2l2.3-3" />
      <path d="M21 4.5 15.2 20c-.3.8-1.4.8-1.8 0l-2.1-5.1L21 4.5Z" />
    </svg>
  );
}

export function LinkedinIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V17" />
      <circle cx="8" cy="7.4" r="0.4" fill="currentColor" stroke="none" />
      <path d="M11.5 17v-3.8c0-1.4 1-2.4 2.4-2.4s2.4 1 2.4 2.4V17" />
      <path d="M11.5 10.5V17" />
    </svg>
  );
}

export function AparatIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="4" />
      <path d="m10.5 9.5 4.5 2.5-4.5 2.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
