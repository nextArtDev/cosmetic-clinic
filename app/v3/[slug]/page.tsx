import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StandardPageView } from '../components/page-views'
import { pageTitles } from '../lib/content'

export function generateStaticParams() {
  return Object.keys(pageTitles).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return { title: pageTitles[slug] || 'صفحه پیدا نشد' }
}

export default async function V3StudioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!Object.hasOwn(pageTitles, slug)) notFound()
  return <StandardPageView slug={slug} />
}
