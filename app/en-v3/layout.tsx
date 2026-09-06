import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { SiteShell } from './components/site-shell'
import './globals.css'

// /v3 is a self-contained frontend port (L’AGENCE Design Studio). The
// SiteShell is the ONLY wrapper it gets: it renders NO shared chrome from the
// production app (no Navbar/Footer/Toaster), scopes its own styles under
// .v3 / html[data-v3-active] (see globals.css), and unmounts cleanly. The
// root layout still owns <html>/<body>.
export const metadata: Metadata = {
  title: {
    default: 'L’AGENCE Design Studio — Image de marque & conception web',
    template: '%s — L’AGENCE Design Studio',
  },
  description:
    'Des identités singulières et des sites web sur mesure pour les marques beauté, bien-être, food et lifestyle. Créer le désir. Élever la perception.',
  openGraph: {
    title: 'L’AGENCE Design Studio',
    description:
      'Image de marque et conception web. Pour les marques qui font la différence.',
    locale: 'fr_FR',
    type: 'website',
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#f3f0eb',
}

export default function V3Layout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
