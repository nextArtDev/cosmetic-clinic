import type { SVGProps } from 'react'

/* Arrow points toward inline-start (physical left) — RTL mirror of the
   original right-pointing arrow. scaleX(-1) is applied via CSS on hover;
   the base glyph here already faces left for Persian reading flow. */
export function ArrowLeft({
  color = 'currentColor',
  ...props
}: SVGProps<SVGSVGElement> & { color?: string }) {
  return (
    <svg
      width="22"
      height="10"
      viewBox="0 0 22 10"
      fill="none"
      aria-hidden="true"
      className="btn-arrow"
      {...props}
    >
      <path
        d="M1 5H21"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.6 1L1.4 5L5.6 9"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ArrowDown({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="40"
      viewBox="0 0 18 40"
      fill="none"
      aria-hidden="true"
      className="hero-arrow"
      {...props}
    >
      <path
        d="M9 0V38"
        stroke="#231F20"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 31L9 38L16 31"
        stroke="#231F20"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Star({ filled = true, ...props }: SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7 0.5L8.86 4.86L13.7 5.55L10.13 8.98L11.03 13.8L7 11.42L2.97 13.8L3.87 8.98L0.3 5.55L5.14 4.86L7 0.5Z"
        fill={filled ? '#EAA098' : 'none'}
        stroke="#EAA098"
        strokeWidth="1"
      />
    </svg>
  )
}

export function Telegram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 1.5C5.3 1.5 1.5 5.3 1.5 10C1.5 14.7 5.3 18.5 10 18.5C14.7 18.5 18.5 14.7 18.5 10C18.5 5.3 14.7 1.5 10 1.5ZM14.48 7.08L13.16 13.32C13.06 13.77 12.79 13.88 12.41 13.66L10.21 12.04L9.15 13.06C9.03 13.18 8.93 13.28 8.7 13.28L8.86 11.05L12.82 7.47C12.99 7.32 12.79 7.24 12.57 7.39L7.62 10.44L5.44 9.76C4.97 9.61 4.96 9.29 5.54 9.07L13.87 5.85C14.26 5.71 14.6 5.95 14.48 7.08Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function Instagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 2.2C7.03 2.2 6.62 2.21 5.45 2.27C4.34 2.32 3.67 2.51 3.15 2.71C2.5 2.97 2.01 3.3 1.52 3.79C1.03 4.28 0.7 4.77 0.44 5.42C0.24 5.94 0.05 6.61 0 7.72C-0.06 8.89 -0.07 9.3 -0.07 12.27C-0.07 15.24 -0.06 15.65 0 16.82C0.05 17.93 0.24 18.6 0.44 19.12C0.7 19.77 1.03 20.26 1.52 20.75C2.01 21.24 2.5 21.57 3.15 21.83C3.67 22.03 4.34 22.22 5.45 22.27C6.62 22.33 7.03 22.34 10 22.34C12.97 22.34 13.38 22.33 14.55 22.27C15.66 22.22 16.33 22.03 16.85 21.83C17.5 21.57 17.99 21.24 18.48 20.75C18.97 20.26 19.3 19.77 19.56 19.12C19.76 18.6 19.95 17.93 20 16.82C20.06 15.65 20.07 15.24 20.07 12.27C20.07 9.3 20.06 8.89 20 7.72C19.95 6.61 19.76 5.94 19.56 5.42C19.3 4.77 18.97 4.28 18.48 3.79C17.99 3.3 17.5 2.97 16.85 2.71C16.33 2.51 15.66 2.32 14.55 2.27C13.38 2.21 12.97 2.2 10 2.2Z"
        transform="translate(0 -2.2)"
        fill="currentColor"
      />
      <circle cx="10" cy="10" r="4.2" fill="currentColor" opacity="0" />
    </svg>
  )
}

export function Whatsapp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 1.8C5.4 1.8 1.8 5.4 1.8 10C1.8 11.5 2.2 12.9 3 14.1L1.8 18.2L6 17C7.2 17.7 8.6 18.2 10 18.2C14.6 18.2 18.2 14.6 18.2 10C18.2 5.4 14.6 1.8 10 1.8ZM14.1 12.9C13.9 13.4 13.1 13.9 12.7 13.9C12.3 14 11.8 14 11.3 13.9C10.9 13.8 10.4 13.6 9.9 13.3C8.5 12.6 7.4 11.5 6.7 10.1C6.4 9.6 6.2 9.1 6.1 8.7C6 8.2 6 7.7 6.1 7.3C6.1 6.9 6.6 6.1 7.1 5.9C7.3 5.8 7.5 5.8 7.7 5.9L8.3 7.1C8.4 7.3 8.3 7.5 8.2 7.7L7.9 8.2C7.8 8.4 7.8 8.5 7.9 8.7C8.2 9.3 8.7 9.8 9.3 10.1C9.5 10.2 9.6 10.2 9.8 10.1L10.3 9.8C10.5 9.7 10.7 9.6 10.9 9.7L12.1 10.3C12.3 10.4 12.3 10.6 12.2 10.9C12.1 11.5 14.1 12.5 14.1 12.9Z"
        fill="currentColor"
      />
    </svg>
  )
}

/* The original Flower (six pale-pink petals) — kept verbatim; it reads as a
   neutral wellness motif in the medical context too. */
export function Flower(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true" {...props}>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx="36"
          cy="20"
          rx="8"
          ry="15"
          fill="#EAA098"
          opacity="0.85"
          transform={`rotate(${deg} 36 36)`}
        />
      ))}
      <circle cx="36" cy="36" r="7" fill="#F2C8C1" />
    </svg>
  )
}

/* Wordmark — LIKHA's typographic logo becomes a Persian lockup for
   درنا طب with the same hairline rules and letterpress feel. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span
        className="display text-[3.2rem] text-ink md:text-[3.6rem]"
        style={{ paddingLeft: '0.5em' }}
      >
        درنا طب
      </span>
      <span className="mt-[0.9rem] flex w-full items-center gap-[1rem]">
        <span className="h-px flex-1 bg-ink/40" />
        <span className="whitespace-nowrap text-[0.9rem] font-semibold text-ink/70">
          قلب و ارتوپدی
        </span>
        <span className="h-px flex-1 bg-ink/40" />
      </span>
    </span>
  )
}
