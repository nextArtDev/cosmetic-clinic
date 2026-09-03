'use client'

import { usePageLoadProgress } from '@/hooks/use-page-load-progress'
import { Preloader } from './Preloader'

export function HomeShell({ children }: { children: React.ReactNode }) {
  const { progress, isReady } = usePageLoadProgress()

  return (
    <>
      <Preloader progress={progress} isReady={isReady} />
      {children}
    </>
  )
}
