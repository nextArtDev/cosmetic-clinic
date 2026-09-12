"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import type {
  MayaBestSeller,
  MayaCollection,
  MayaFaq,
  MayaFeaturedTab,
  MayaHeroSlide,
  MayaProduct,
  MayaPromoTile,
  MayaTestimonial,
} from "../lib/data";
import { gsapSetup, setLenis } from "../lib/fx";
import { StoreProvider } from "./Store";
import { Preloader } from "./Preloader";
import { ScrollBar, BackToTop } from "./Motion";
import { MobileDock } from "./MobileDock";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Trending } from "./Trending";
import { CollectionCarousel } from "./Carousel";
import { Statement } from "./Statement";
import { FeaturedTabs } from "./FeaturedTabs";
import { Bundle } from "./Bundle";
import { StackedCollection } from "./StackedCollection";
import { Burst } from "./Burst";
import { BestSellers } from "./BestSellers";
import { VideoMarquee } from "./VideoMarquee";
import { Testimonials } from "./Testimonials";
import { MediaGrid, MediaWithText } from "./Showcase";
import { Faq } from "./Faq";
import { ScrollingText } from "./ScrollingText";
import { Footer } from "./Footer";

export type MayaData = {
  heroSlides: MayaHeroSlide[];
  collections: MayaCollection[];
  trending: MayaProduct[];
  bundleProducts: MayaProduct[];
  stackedProducts: MayaProduct[];
  featuredTabs: Array<MayaFeaturedTab & { products: MayaProduct[] }>;
  testimonials: MayaTestimonial[];
  faqs: MayaFaq[];
  bestSellers: MayaBestSeller[];
  promoTiles: MayaPromoTile[];
};

export function MayaApp({ data }: { data: MayaData }) {
  /* temporarily adapt the host document — fully restored on unmount,
     so the rest of the app stays untouched */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      lang: html.lang,
      dir: html.dir,
      bg: body.style.backgroundColor,
      color: body.style.color,
    };
    html.lang = "fa";
    html.dir = "rtl";
    body.style.backgroundColor = "#f2ede4";
    body.style.color = "#16130e";

    // the original theme's console signature — iranized
    console.log(
      "%cم%cا%cی%cا",
      "color:#9a6a3d;font-weight:bold;font-size:18px",
      "color:#16130e;font-weight:bold;font-size:18px",
      "color:#9a6a3d;font-weight:bold;font-size:18px",
      "color:#16130e;font-weight:bold;font-size:18px",
      "\nنسخهٔ ایرانی قالب Maya — مسیر ایزوله /maya",
    );

    return () => {
      html.lang = prev.lang;
      html.dir = prev.dir;
      body.style.backgroundColor = prev.bg;
      body.style.color = prev.color;
    };
  }, []);

  /* lenis smooth scroll + gsap sync */
  useEffect(() => {
    const { gsap, ScrollTrigger } = gsapSetup();
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // settle after first paint so triggers measure correctly
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 350);

    return () => {
      window.clearTimeout(t);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <StoreProvider>
      <Preloader />
      <ScrollBar />
      <Header collections={data.collections} />
      <main>
        <Hero slides={data.heroSlides} />
        <Trending products={data.trending} />
        <CollectionCarousel collections={data.collections} />
        <Statement collections={data.collections} />
        <FeaturedTabs tabs={data.featuredTabs} />
        <Bundle products={data.bundleProducts} />
        <StackedCollection products={data.stackedProducts} />
        <Burst products={data.trending.length >= 5 ? data.trending : data.bundleProducts} />
        <BestSellers items={data.bestSellers} />
        <VideoMarquee />
        <Testimonials items={data.testimonials} />
        <MediaGrid tiles={data.promoTiles} />
        <MediaWithText />
        <Faq items={data.faqs} />
        <ScrollingText />
      </main>
      <Footer />
      <MobileDock />
      <BackToTop />
    </StoreProvider>
  );
}
