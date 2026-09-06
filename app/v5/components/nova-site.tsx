'use client'

import type { ReactNode } from 'react'
import SmoothScroll from './providers/SmoothScroll'
import Preloader from './ui/Preloader'
import Header from './layout/Header'
import Footer from './layout/Footer'
import MobileQuickNav from './layout/MobileQuickNav'
import CookieConsent from './ui/CookieConsent'
import Hero from './sections/Hero'
import Profiles from './sections/Profiles'
import Advantages from './sections/Advantages'
import Pricing from './sections/Pricing'
import Results from './sections/Results'
import Resources from './sections/Resources'
import Diagnostic from './sections/Diagnostic'
import Faq from './sections/Faq'

/**
 * The full NOVA Capillaire document chrome, rendered inside the .v5 wrapper
 * (V5Shell). Everything the original root layout put on <body> lives here as
 * plain divs, so the production root layout is untouched.
 */
export default function NovaSite({ children }: { children?: ReactNode }) {
  return (
    <SmoothScroll>
      <Preloader />
      <Header />
      <main id="content">
        {children ?? (
          <>
            <Hero />
            <Profiles />
            <Advantages />
            <Pricing />
            <Results />
            <Resources />
            <Diagnostic />
            <Faq />
          </>
        )}
      </main>
      <Footer />
      <MobileQuickNav />
      <CookieConsent />
    </SmoothScroll>
  )
}
