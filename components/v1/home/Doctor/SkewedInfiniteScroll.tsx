'use client'
import { ReactNode } from 'react'

const SkewedInfiniteScroll = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <div className="flex items-center justify-center">
        <div
          className="relative w-full max-w-screen-lg overflow-hidden"
          style={{
            maskComposite: 'intersect',
            maskImage: `
          linear-gradient(to right,  transparent, black 5rem),
          linear-gradient(to left,   transparent, black 5rem),
          linear-gradient(to bottom, transparent, black 5rem),
          linear-gradient(to top,    transparent, black 5rem)
        `,
          }}
        >
          <div className="mx-auto grid h-[250px] w-[300px] animate-skew-scroll grid-cols-1 gap-5 sm:w-[600px] sm:grid-cols-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkewedInfiniteScroll
