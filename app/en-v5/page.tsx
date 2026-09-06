import type { Metadata } from 'next'
import { V5Shell } from './components/v5-shell'
import NovaSite from './components/nova-site'

export const metadata: Metadata = {
  title: 'Greffe de cheveux à Paris | NOVA Capillaire — v5',
  description:
    'Portage expérimental du frontend NOVA Capillaire sur /v5 : diagnostic personnalisé, FUE Saphir, tarifs transparents et suivi 12 mois. Route non indexée.',
  robots: { index: false, follow: false },
}

export default function V5Page() {
  return (
    <V5Shell>
      <NovaSite />
    </V5Shell>
  )
}
