'use client'

import { V15Provider } from '../_lib/store'
import SmoothScroll from './SmoothScroll'
import Preloader from './Preloader'
import Header from './Header'
import MenuOverlay from './MenuOverlay'
import Hero from './Hero'
import Marquee from './Marquee'
import Manifesto from './Manifesto'
import Collections from './Collections'
import Craft from './Craft'
import Editorial from './Editorial'
import Heritage from './Heritage'
import Shop from './Shop'
import Boutique from './Boutique'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import Toasts from './Toasts'

/**
 * «مِزون راگا» — single-route luxury maison experience, ported exactly
 * from the delvaux/maison clone. Fully self-contained: own smooth-scroll
 * (Lenis), state provider, preloader, overlays and data. Nothing here
 * imports from (or mutates) the rest of the application.
 */
export default function MaisonApp() {
  return (
    <V15Provider>
      <SmoothScroll>
        <Preloader />
        <div className="v15-grain" aria-hidden />
        <Header />
        <MenuOverlay />
        <main>
          <Hero />
          <Marquee />
          <Manifesto />
          <Collections />
          <Craft />
          <Editorial />
          <Heritage />
          <DrawnDivider />
          <Shop />
          <Boutique />
          <Marquee dark />
        </main>
        <Footer />
        <CartDrawer />
        <Toasts />
      </SmoothScroll>
    </V15Provider>
  )
}

function DrawnDivider() {
  return <div className="mx-5 h-px bg-[color:var(--v15-line)] md:mx-10" aria-hidden />
}