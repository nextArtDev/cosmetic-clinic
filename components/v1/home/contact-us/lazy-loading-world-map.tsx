'use client'
import { lazy, Suspense } from 'react'

// Lazy load the WorldMap component
const WorldMap = lazy(() =>
  import('./world-map').then((module) => ({
    default: module.WorldMap,
  }))
)

// Loading skeleton component
const MapSkeleton = () => (
  <div className="w-full aspect-[2/1] glass rounded-lg relative font-sans glass animate-pulse">
    <div className="w-full h-full rounded-lg glass flex items-center justify-center" />
  </div>
)

interface LazyWorldMapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string }
    end: { lat: number; lng: number; label?: string }
  }>
  lineColor?: string
}

export function LazyWorldMap(props: LazyWorldMapProps) {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <WorldMap {...props} />
    </Suspense>
  )
}

export { WorldMap }
