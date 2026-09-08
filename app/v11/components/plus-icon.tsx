export default function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <span className={`plus-icon ${className}`} aria-hidden>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 17 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="1.10919"
          height="16.6379"
          transform="matrix(1 1.74846e-07 1.74846e-07 -1 7.99023 17.4785)"
          fill="currentColor"
        />
        <rect
          width="1.10919"
          height="16.6379"
          transform="matrix(1.31134e-07 -1 -1 -1.31134e-07 16.8633 9.71484)"
          fill="currentColor"
        />
      </svg>
    </span>
  )
}
