/// <reference types="react/canary" />

import { ViewTransition } from 'react'

export default function Loading() {
  return (
    <ViewTransition
      name="page"
      share="page-wipe"
      enter="page-wipe"
      exit="page-wipe"
      default="none"
    >
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <span className="size-9 animate-pulse rounded-full border-2 border-gold/25 border-t-gold" />
      </div>
    </ViewTransition>
  )
}
