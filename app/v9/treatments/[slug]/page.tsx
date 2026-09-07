import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { treatments } from '../../lib/content'
import { TreatmentPage } from '../../components/treatment-page'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return treatments.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = treatments.find((item) => item.slug === slug)
  return {
    title: category?.title || 'درمان پیدا نشد',
    description: category?.description,
    robots: { index: false, follow: false },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const category = treatments.find((item) => item.slug === slug)
  if (!category) notFound()
  return <TreatmentPage key={category.slug} category={category} />
}
