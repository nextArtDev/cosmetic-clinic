/**
 * Stylized Iran silhouette pictogram replacing the original's poland.svg
 * in the hero (Rays spin behind it; the marker dot sits on Tehran). A
 * simplified outline is enough at 3em scale — same visual role.
 */
export default function IranMap({ className = '' }: { className?: string }) {
  return (
    <div className={`iran-map ${className}`} data-poland>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="نقشه ایران">
        <path
          fill="currentColor"
          d="M10 26 L20 20 L28 24 L36 18 L44 23 L52 19 L60 24 L68 21 L76 26 L83 35 L79 43 L87 51 L83 61 L89 70 L82 83 L73 88 L67 82 L59 88 L51 82 L42 86 L33 80 L25 86 L17 78 L11 69 L15 61 L9 51 L13 41 L9 33 Z"
        />
        <circle cx="42" cy="24.5" r="3.4" fill="#faf0d0" />
      </svg>
    </div>
  )
}
