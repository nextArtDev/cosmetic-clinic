'use server'

import { getDoctors, getIllnesses, getSpecializations } from '@/app/v1/lib/data'

export interface V1SearchParams {
  query?: string | null
  type?: string | null
}

export interface V1SearchResult {
  title: string
  type: string
  id: string
}

const searchableHomeTypes = ['specialization', 'doctor', 'illness']

/**
 * Global search across specializations / doctors / illnesses, mirroring
 * kosar-localized's globalHomeSearch but over the medical404 data layer.
 */
export async function v1GlobalSearch(
  params: V1SearchParams,
): Promise<string> {
  const { query, type } = params
  if (!query) return JSON.stringify([])

  const q = query.toLowerCase()
  const matches = (field: string) => field?.toLowerCase().includes(q)

  const [specializations, doctors, illnesses] = await Promise.all([
    getSpecializations(),
    getDoctors(),
    getIllnesses(),
  ])

  const typeLower = type?.toLowerCase()
  const results: V1SearchResult[] = []

  const collect = (
    type: string,
    list: { name: string; description?: string; slug: string }[],
    take: number,
  ) => {
    const hits = list
      .filter((item) => matches(item.name) || matches(item.description ?? ''))
      .slice(0, take)
      .map((item) => ({ title: item.name, type, id: item.slug }))
    results.push(...hits)
  }

  if (!typeLower || !searchableHomeTypes.includes(typeLower)) {
    collect('doctor', doctors, 3)
    collect('specialization', specializations, 3)
    collect('illness', illnesses, 3)
  } else {
    if (typeLower === 'doctor') collect('doctor', doctors, 5)
    if (typeLower === 'specialization')
      collect('specialization', specializations, 5)
    if (typeLower === 'illness') collect('illness', illnesses, 5)
  }

  return JSON.stringify(results)
}
