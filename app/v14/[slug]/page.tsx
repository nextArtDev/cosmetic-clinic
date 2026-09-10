import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '../components/navbar'
import PageTransition from '../components/page-transition'
import SocialIcons from '../components/social-icons'
import SubpageContent from '../components/subpage-content'
import { SUBPAGES } from '../lib/site-content'

export function generateStaticParams() {
  return Object.keys(SUBPAGES).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = SUBPAGES[slug]
  return {
    title: page ? `${page.title} — دکتر آرش نیک‌آیین | v14` : 'دکتر آرش نیک‌آیین | v14',
    robots: { index: false, follow: false },
  }
}

export default async function V14SubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = SUBPAGES[slug]
  if (!page) notFound()

  return (
    <div
      className="page-wrapper v14-sub-page"
      style={{ backgroundColor: page.bg, minHeight: '100vh' }}
    >
      <Navbar />
      <SocialIcons />
      <PageTransition />
      <SubpageContent {...page} showNewsletter={slug === 'khabarnameh'} />
    </div>
  )
}
