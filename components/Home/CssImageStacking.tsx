'use client'
import { ReactLenis } from 'lenis/react'

export default function CssImageStacking() {
  return (
    <ReactLenis root>
      <section className="text-foreground w-full bg-background">
        <>
          <div className="sm:sticky sm:top-0 w-full">
            <figure className="w-full h-screen flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1718969604981-de826f44ce15?w=1200&auto=format&fit=crop"
                alt=""
                className="transition-all duration-300 h-[80%] w-[55%] align-bottom object-cover rounded-md"
              />
            </figure>
          </div>
          <div className="sm:sticky sm:top-2 w-full">
            <figure className="w-full h-screen flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1476180814856-a36609db0493?w=1200&auto=format&fit=crop"
                alt=""
                className="transition-all duration-300 h-[80%] w-[60%] align-bottom object-cover rounded-md [box-shadow:0_-5px_16px_4px_rgba(0,0,0,0.8),0_2px_4px_-1px_rgba(0,0,0,0.06)]"
              />
            </figure>
          </div>
          <div className="sm:sticky sm:top-4 w-full">
            <figure className="w-full h-screen flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1595407660626-db35dcd16609?w=1200&auto=format&fit=crop"
                alt=""
                className="transition-all duration-300 h-[80%] w-[65%] align-bottom object-cover rounded-md"
              />
            </figure>
          </div>
          <div className="sm:sticky sm:top-6 w-full">
            <figure className="w-full h-screen flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1599054799131-4b09c73a63cf?w=1200&auto=format&fit=crop"
                alt=""
                className="transition-all duration-300 h-[80%] w-[70%] align-bottom object-cover rounded-md"
              />
            </figure>
          </div>
          <div className="sm:sticky sm:top-8 w-full">
            <figure className="w-full h-screen flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1719963532023-01b573d1d584?w=1200&auto=format&fit=crop"
                alt=""
                className="transition-all duration-300 h-[80%] w-[75%] align-bottom object-cover rounded-md"
              />
            </figure>
          </div>
          <div className="sm:sticky sm:top-12 w-full">
            <figure className="w-full h-screen flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1714328101501-3594de6cb80f?w=1200&auto=format&fit=crop"
                alt=""
                className="transition-all duration-300 h-[80%] w-[80%] align-bottom object-cover rounded-md"
              />
            </figure>
          </div>
        </>
      </section>
    </ReactLenis>
  )
}
