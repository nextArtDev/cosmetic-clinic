import type { Metadata } from 'next'
import ClinicSite from './components/clinic-site'
import { V4Shell } from './components/v4-shell'

export const metadata: Metadata = {
  title: 'PEGASUS CLINIC | 呼び起こす、美しさ',
  description:
    'あなたらしい美しさを、一緒に。浜松駅前の美容外科・美容皮膚科 PEGASUS CLINICのデザインを再現した、インタラクティブなデモサイトです。',
  robots: { index: false, follow: false },
}

export default function V4Page() {
  return (
    <V4Shell>
      <ClinicSite />
    </V4Shell>
  )
}
