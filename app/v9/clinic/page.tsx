import type { Metadata } from 'next'
import { ClinicPage } from '../components/clinic-page'

export const metadata: Metadata = {
  title: 'کلینیک',
  description:
    'با کلینیک دندانپزشکی دکتر سپیده نادری در تهران آشنا شوید؛ فضایی دلنشین با فناوری پیشرفته، تیمی متخصص و مراقبتی اختصاصی.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <ClinicPage />
}
