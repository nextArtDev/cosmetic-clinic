'use client';

import { blog } from '../data';
import styles from './elitone.module.css';

/* ────────────────────────────────────────────────────────────────
   Brand mark — an abstract cut-stone glyph in the مهر (seal) tradition,
   standing in for the reference's wordmark SVG.
   ──────────────────────────────────────────────────────────────── */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M60 4 L116 60 L60 116 L4 60 Z" fill="currentColor" opacity="0.14" />
      <path
        d="M60 4 L116 60 L60 116 L4 60 Z M60 22 L98 60 L60 98 L22 60 Z"
        fill="currentColor"
        opacity="0.4"
      />
      <path d="M60 4 L60 116" stroke="currentColor" strokeWidth="3" />
      <path d="M4 60 L116 60" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────
   Marquee — upstream `.marquee--container > .marquee`, four copies of the
   same word on a 40s linear loop, revealed on tease hover.
   ──────────────────────────────────────────────────────────────── */
export function Marquee({ title }: { title?: string }) {
  const label = title ?? blog.readMore;
  return (
    <div className={styles.esMarqueeBox} aria-hidden="true">
      <div className={styles.esMarqueeTrack}>
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} data-title={label} />
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Animation hooks, applied as data attributes. The root component runs a
   single querySelectorAll pass over them (exactly like upstream's
   `e.animated = { titles: …, excerpts: …, separators: … }`).
   ──────────────────────────────────────────────────────────────── */
export const ANIM = {
  title: { 'data-es-anim': 'title' } as const,
  excerpt: { 'data-es-anim': 'excerpt' } as const,
  separator: { 'data-es-anim': 'separator' } as const,
};

export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' ');
