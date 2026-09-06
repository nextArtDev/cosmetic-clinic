import Link from 'next/link'

// Scoped 404 for the /v3 subtree: it renders inside app/v3/layout.tsx (so it
// keeps the .v3 shell/styles) and never touches the production not-found.
export default function V3NotFound() {
  return <main id="v3-main-content" className="not-found"><p className="eyebrow">404 — Hors du cadre</p><h1>Un petit détour.<br />Une nouvelle <em>direction.</em></h1><p>Cette page n’existe pas, mais de belles choses vous attendent au studio.</p><Link href="/v3" className="arrow-link">Revenir à l’accueil <span aria-hidden="true">→</span></Link></main>
}
