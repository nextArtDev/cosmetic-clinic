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
      {/* Full-screen dark cover matching the preloader's dark stage — so
          route transitions read as a dark wipe, not a spinner. When the
          new page streams in its ViewTransition captures this dark cover
          as the old snapshot, creating a seamless dark-to-dark crossfade
          before the new page's preloader curtain exits. */}
      <div
        className="fixed inset-0 z-[150] flex flex-col justify-between p-8 md:p-14"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 28%, oklch(21% 0.03 50) 0%, oklch(12% 0.012 44) 70%)',
          backgroundColor: 'oklch(13% 0.014 46)',
        }}
      >
        {/* Top bar — matches preloader branding */}
        <div className="flex items-center justify-between">
          <span className="text-[0.7rem] font-light uppercase tracking-[0.3em] text-[#c9a667]">
            در حال بارگذاری
          </span>
          <span className="text-[0.7rem] font-light uppercase tracking-[0.3em] text-[#c9a667]">
            کلینیک دکتر فضلی
          </span>
        </div>

        {/* Subtle bottom progress pulse — not a spinner */}
        <div
          className="h-px w-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="h-full w-1/3 animate-[loading-shimmer_1.2s_ease-in-out_infinite]"
            style={{ background: '#c9a667' }}
          />
        </div>
      </div>
    </ViewTransition>
  )
}
