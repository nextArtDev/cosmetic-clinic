import type { Metadata } from 'next'
import MaisonApp from './_components/MaisonApp'

export const metadata: Metadata = {
  title: { absolute: 'Rāgā — Maison du Cuir | v15 demo' },
  description:
    'نسخه‌ی آزمایشی — پورتِ کاملاً ایزوله‌ی تجربه‌ی فروشگاهی «مِزون راگا» در /v15؛ بدون هیچ اثری بر home page یا سایر مسیرها.',
  robots: { index: false, follow: false },
}

export default function V15Page() {
  return <MaisonApp />
}