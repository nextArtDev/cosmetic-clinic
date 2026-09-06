import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { projects } from '../../lib/content'
import { ProjectDetailView } from '../../components/page-views'

export function generateStaticParams() {
  return projects.map(project => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find(item => item.slug === slug)
  return { title: project?.name || 'Projet introuvable', description: project?.description }
}

export default async function V3ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projects.find(item => item.slug === slug)
  if (!project) notFound()
  return <ProjectDetailView project={project} />
}
