'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { ImageAsset, LinkData, NavNode } from '../types';

/**
 * /v23 primitives.
 *
 * Every component here reproduces the reference's own DOM contract — the same
 * `c-*` class names, the same modifier flags, and the same Vue-injected CSS
 * variables (`--52f2b47e`, `--ec47e5a6`, …) written as inline styles. That is
 * what makes the ported stylesheet in styles/jacques.module.css apply without
 * a single selector being rewritten.
 */

/* ── icons ───────────────────────────────────────────────────────────────── */

type IconName = 'plus' | 'arrow' | 'calendar' | 'cross' | 'facebook' | 'instagram';

/**
 * The reference's arrow points right because French reads left-to-right. In the
 * RTL port it is mirrored, so "onward" still points the way the eye travels.
 */
const PATHS: Record<IconName, ReactNode> = {
  plus: <path d="M12 4v16M4 12h16" />,
  arrow: <path d="M20 12H4m0 0 6-6m-6 6 6 6" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  cross: <path d="M6 6l12 12M18 6 6 18" />,
  facebook: <path d="M14 9h3V5h-3a4 4 0 0 0-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 0 1 0 0z" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" />
    </>
  ),
};

export function Icon({
  name,
  width = '2rem',
  className = '',
}: {
  name: IconName;
  width?: string;
  className?: string;
}) {
  const stroked = name === 'plus' || name === 'arrow' || name === 'cross' || name === 'calendar';
  return (
    <span
      className={`c-icon -${name} ${className}`.trim()}
      style={{ '--ec47e5a6': width } as CSSProperties}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroked ? 1.6 : 0}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {PATHS[name]}
      </svg>
    </span>
  );
}

/* ── logo ────────────────────────────────────────────────────────────────── */

/**
 * The reference's mark is a 30x30 SVG (the `.-logo` rule pins
 * `--logo-width: 3rem; --logo-ratio: 1`). A tooth silhouette keeps that exact
 * square footprint while saying something about the clinic.
 */
export function LogoMark({ className = '-tone-light' }: { className?: string }) {
  return (
    <span className={`c-logo ${className}`.trim()} aria-hidden="true">
      <svg className="-logo" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 4.4c-2.3-1.7-4.2-2.1-5.9-1.7C6.2 3.5 4 6.4 4 10.3c0 2.7.6 4.7 1.4 7.3.7 2.3 1 5 1.3 7.2.2 1.5.7 2.2 1.7 2.2 1.2 0 1.7-.9 2.1-2.7.4-1.8.7-4.1 2-4.1s1.6 2.3 2 4.1c.4 1.8.9 2.7 2.1 2.7 1 0 1.5-.7 1.7-2.2.3-2.2.6-4.9 1.3-7.2.8-2.6 1.4-4.6 1.4-7.3 0-3.9-2.2-6.8-5.1-7.6-1.7-.4-3.6 0-5.9 1.7Z" />
      </svg>
    </span>
  );
}

/**
 * The reference's three-line wordmark is an SVG whose `.<line>` groups slide up
 * on reveal (`.-descriptor .line { opacity: .0001; translateY(3rem) }`).
 *
 * A Persian wordmark cannot be lifted from that Latin SVG, so the same three
 * lines are typeset as text — but they keep the `.line line-N` contract, so the
 * reference's own reveal rule and stagger still drive them.
 */
export function LogoDescriptor({ lines }: { lines: readonly string[] }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setRevealed(true), 500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <span
      className={`c-logo -tone-light -descriptor jc-logo-descriptor ${
        revealed ? 'is-revealed' : ''
      }`.trim()}
    >
      {lines.map((line, i) => (
        <span className={`line line-${i + 1}`} key={line}>
          {line}
        </span>
      ))}
    </span>
  );
}

/* ── typography helpers ──────────────────────────────────────────────────── */

export function Surtitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`c-surtitle-with-icon ${className}`.trim()}>
      <Icon name="plus" width="1.6rem" />
      <span className="c-text-variant t-p1 c-surtitle-with-icon__text">{children}</span>
    </div>
  );
}

/* ── words list ──────────────────────────────────────────────────────────── */

/**
 * Three drifting labels. The animation is pure CSS in the reference — the
 * `-is-animated` flag is what fires the `slide-up` keyframes with a per-child
 * delay — so the only job here is to set the flag once the list is on screen.
 */
export function WordsList({
  words,
  className = '',
  long = false,
  animated: animatedProp,
}: {
  words: readonly string[];
  className?: string;
  long?: boolean;
  /** Overrides the built-in observer — the banner drives this from scroll. */
  animated?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const animated = animatedProp ?? inView;

  useEffect(() => {
    if (animatedProp !== undefined) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animatedProp]);

  return (
    <div
      ref={ref}
      className={`c-words-list ${animated ? '-is-animated' : ''} ${
        long ? '-is-long-animation' : ''
      } ${className}`.replace(/\s+/g, ' ').trim()}
    >
      {words.map((word, i) => (
        <div className="c-words-list__item" key={`word-${i}`}>
          <Surtitle className="c-words-list__item__copy">{word}</Surtitle>
        </div>
      ))}
    </div>
  );
}

/* ── picture (the reference's ImageBase) ─────────────────────────────────── */

/**
 * Reproduces ImageBase exactly: a wrapper carrying the ratio / fit / focal-point
 * variables, an optional 130%-tall parallax box (wired up in Experience), and a
 * plain <img>.
 *
 * A plain <img> rather than next/image is deliberate: the parallax wrapper
 * clips and transforms its child, which stalls next/image's lazy loading.
 */
export function Picture({
  asset,
  className = '',
  fixedRatio = false,
  ratio = 'portrait',
  fit = 'cover',
  rootRef,
}: {
  asset: ImageAsset;
  className?: string;
  fixedRatio?: boolean;
  ratio?: 'portrait' | 'landscape' | 'square' | 'fullscreen';
  fit?: 'cover' | 'contain' | 'none';
  /** Lets a caller animate the wrapper itself (the hero's blur reveal). */
  rootRef?: React.Ref<HTMLDivElement>;
}) {
  const [loaded, setLoaded] = useState(false);
  const aspect = (asset.width / asset.height).toFixed(3);

  return (
    <div
      ref={rootRef}
      className={[
        'c-image-base-picture',
        '-lazy',
        fit !== 'none' ? '-fit' : '',
        loaded ? 'is-image-loaded' : '',
        '-parallax',
        fixedRatio ? 'has-fixed-parallax-ratio' : '',
        fixedRatio ? `-parallax-ratio-${ratio}` : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--52f2b47e': aspect,
          '--53ca81f0': fit,
          '--35e5a892': asset.objectPosition,
        } as CSSProperties
      }
    >
      <div className="c-image-base-picture__parallax-wrapper">
        <picture className="c-image-base-picture-picture">
          <img
            className="c-image-base-picture-picture__img"
            src={asset.src}
            alt={asset.alt}
            width={asset.width}
            height={asset.height}
            onLoad={() => setLoaded(true)}
          />
        </picture>
      </div>
    </div>
  );
}

/* ── buttons ─────────────────────────────────────────────────────────────── */

type Theme = 'light' | 'base' | 'outline';

function buttonClasses(theme: Theme, icon?: IconName) {
  return [
    'queso-clickable',
    'c-raw-button',
    'is-hoverable',
    'c-button-primary',
    `-theme-${theme}`,
    icon ? '-has-icon' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * A link styled as a button. Internal `entry` links go through next/link so the
 * port behaves like the rest of the app; external ones stay plain anchors.
 */
export function ButtonLink({
  link,
  theme = 'base',
  icon,
  className = '',
  children,
}: {
  link: LinkData;
  theme?: Theme;
  icon?: IconName;
  className?: string;
  children?: ReactNode;
}) {
  const label = children ?? link.label;
  const body = (
    <>
      <span className="c-text-variant t-c1 c-raw-button__label">{label}</span>
      {icon ? <Icon name={icon} /> : null}
    </>
  );
  const cls = `${buttonClasses(theme, icon)} ${className}`.trim();

  if (link.internal) {
    return (
      <Link className={cls} href={link.value}>
        {body}
      </Link>
    );
  }
  return (
    <a className={cls} href={link.value}>
      {body}
    </a>
  );
}

/** Icon-only variant used by the header's appointment shortcut. */
export function IconLink({
  href,
  label,
  icon,
  theme = 'light',
  external,
}: {
  href: string;
  label: string;
  icon: IconName;
  theme?: 'light' | 'base';
  external?: boolean;
}) {
  const cls = `queso-clickable c-raw-button is-hoverable c-button-icon -theme-${theme}`;
  const body = (
    <>
      <Icon name={icon} className="c-button-icon__icon" />
      <span className="c-text-variant t-p1 c-raw-button__label">{label}</span>
    </>
  );
  if (external) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    );
  }
  return (
    <a className={cls} href={href}>
      {body}
    </a>
  );
}

/* ── navigation list ─────────────────────────────────────────────────────── */

export function NavList({ nodes, className = '' }: { nodes: NavNode[]; className?: string }) {
  return (
    <nav className={`c-nav-nodes ${className}`.trim()}>
      <ul className="c-nav-nodes__list">
        {nodes.map((node) => (
          <li
            className={`c-nav-nodes-item ${node.children.length ? '-has-children' : ''}`.trim()}
            key={node.id}
          >
            <a className="queso-clickable c-raw-button is-hoverable c-button-base c-nav-node" href={node.href}>
              <span className="c-text-variant t-p1 c-raw-button__label">{node.label}</span>
            </a>
            {node.children.length ? (
              <div className="c-nav-nodes-item__sub-nav">
                <ul className="c-nav-nodes-item__sub-nav__list">
                  {node.children.map((child) => (
                    <li className="c-nav-nodes-item__sub-nav__item" key={child.id}>
                      <a
                        className="queso-clickable c-raw-button is-hoverable c-button-base c-nav-node"
                        href={child.href}
                      >
                        <span className="c-text-variant t-c1 c-raw-button__label">{child.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
