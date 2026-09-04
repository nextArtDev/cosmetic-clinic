import Link from 'next/link'
import { ViewTransition } from 'react'
import type { Metadata } from 'next'
// import CompareSlides from '@/components/Home/CompareSlides'
import Hero, { AmbientBackground } from '@/components/Home/Hero/Hero'
import Rotating from '@/components/Home/Hero/Rotaing'
import Highlights from '@/components/Home/Highlights'
import { ImageCarousel } from '@/components/Home/image-carousel/image-carousel'
import { MarqueeDemoVertical } from '@/components/Home/marquee/MarqueeVertical'
import StickyScrollVideo from '@/components/Home/StickyScrollVideo'
import HorizontalScrollCarousel from '@/components/Home/HorizontalScroll'
import PersonnelCarousel from '@/components/Home/orbit-carousel'
import { CalendarCheck, UserRound } from 'lucide-react'
import CompareSlides from '@/components/Home/CompareSlider'
import DCompareSlides from '@/components/Home/compare-slides/DCompareSlides'
import CreativeCompare from '@/components/Home/compare-slides/QCompare'
import ZShaderCompareSlides from '@/components/Home/compare-slides/ZSliders'
// import ResultsPage from '@/components/Home/compare-slides/claude/results-page'
import GlassShieldCard from '@/components/Home/GlassShieldCard'
import { GlassShieldShowcase } from '@/components/Home/GlassShieldPoster'
import { HoloGlassCard } from '@/components/Home/HoloGlassCard'
import { HoloBeautyConsole } from '@/components/Home/HoloBeautyConsole'
// import AdvanceBodyCarousel from '@/components/Home/body-carousel/AdvancedBodyCarousel'

import ScrollSlider from '@/components/Home/scroll-slider/ScrollSlider'
import HeroZoom from '@/components/Home/Hero/HeroZoom'
import AdvancedBodyCarousel from '@/components/Home/body-carousel/pot/AdvancedBodyCarousel'
import { ServicesIndex } from '@/components/Home/ServicesIndex'
import BeforeAfterSlider from '@/components/Home/BeforAfterScrollSlider'
import BeforeAfterRevealSlider from '@/components/Home/BeeforeAfterReveal'

import TestimonialsSwiper from '@/components/Home/marquee/TestimonialSwiper'
import { getFeaturedReviews, getReviewStats } from '@/lib/reviews'
import ResultsPage from '@/components/Home/compare-slides/claude2/example-usage'
import SurgeryBodyInteractive from '@/components/Home/SurgeryBodyInteractive'

import GlassSlider from '@/components/Home/GlassSlider'
import { MovingBento } from '@/components/Home/QBento'
import ParallaxCards from '@/components/Home/ParallaxCards'
import { ScrollShowcase } from '@/components/Home/Carousel'
// import ResultsPage from '@/components/Home/compare-slides/opt/results-page'

export const metadata: Metadata = {
  title: 'کلینیک جراحی پلاستیک و زیبایی — دکتر شبنم فضلی',
  description:
    'کلینیک تخصصی جراحی پلاستیک، زیبایی و ترمیمی دکتر شبنم فضلی؛ جراحی بینی، فیس‌لیفت، لیپوساکشن و پروتز. رزرو نوبت آنلاین در چند دقیقه.',
}

const items = [
  {
    id: '1',
    title: 'ابدومینوپلاستی',
    description: 'جراحی شکم',
    image: '/images/a/Abdiminoplasty.webp',
    href: '/',
  },
  {
    id: '2',
    title: 'بلفاپلاستی',
    description: 'لیفت ابرو',
    image: '/images/a/belfa-1.webp',
    href: '/',
  },
  {
    id: '3',
    title: 'لیفت بدن',
    image: '/images/a/body-countoring.webp',
    href: '/',
  },
  {
    id: '4',
    title: 'لیفت سینه',
    image: '/images/a/breast-lift.webp',
    href: '/',
  },
  {
    id: '5',
    title: 'لیفت ابرو',
    image: '/images/a/bro-lift.webp',
    href: '/',
  },
  {
    id: '6',
    title: 'لیپوساکشن غبغب',
    image: '/images/a/chin-implant.webp',
    href: '/',
  },
  {
    id: '7',
    title: 'لیفت صورت',
    image: '/images/a/face-lift.webp',
    href: '/',
  },
  {
    id: '8',
    title: 'لیپوساکشن',
    image: '/images/a/liposuction.webp',
    href: '/',
  },
  {
    id: '9',
    title: 'جراحی بینی',
    image: '/images/a/rhino.webp',
    href: '/',
  },
  {
    id: '10',
    title: 'پروتز سینه',
    image: '/images/a/breast.webp',
    href: '/',
  },
  {
    id: '11',
    title: 'تزریق ژل',
    image: '/images/a/injectables.webp',
    href: '/',
  },
]
export default async function Home() {
  const [reviews, stats] = await Promise.all([
    getFeaturedReviews(12),
    getReviewStats(),
  ])
  const statsLine =
    stats.count > 0
      ? `${stats.avgLabel} از ۵ · ${stats.countLabel} دیدگاه مراجع`
      : undefined

  return (
    <ViewTransition
      name="page"
      share="page-wipe"
      enter="page-wipe"
      exit="page-wipe"
      default="none"
    >
      <section className="relative max-w-screen h-full min-h-screen">
        {/* Single page-wide backdrop for every section below (the hero keeps
            its own copy inside the sticky viewport for stacking safety). */}
        <AmbientBackground fixed />
        <HeroZoom
          ratingStats={
            stats.count > 0
              ? { avgLabel: stats.avgLabel, countLabel: stats.countLabel }
              : undefined
          }
        />
        {/* <section className="overflow-x-hidden">
        <Hero />
      </section> */}
        {/* <section className="flex min-h-svh items-center justify-center overflow-hidden bg-[#020508] py-6">
        <HoloBeautyConsole
          beforeSrc="/images/doctors/1.jpeg"
          afterSrc="/images/doctors/2.jpeg"
          headerText="SIM-09 // LIPO-SCAN"
          captionText="Beauty Surgery Simulation"
        />
      </section>
      <section className="flex min-h-screen items-center justify-center bg-[radial-gradient(1200px_600px_at_50%_-10%,#ffffff, #dfe7ee_60%,#cfd9e2)] py-16">
        <HoloGlassCard
          imageSrc="/images/doctors/2.jpeg"
          badgeText="SCAN 04"
          sideLines={['Patient:', 'Tx Oncology']}
          footerText="Biotechnology"
          brandText="ADERTI ADLAB"
        />
      </section> */}
        {/* One AmbientBackground lives inside HeroZoom's sticky viewport
            (fixed variant below) — extra per-section copies were three
            full-viewport blurred rasters being composited at once. */}
        {/* <ParallaxCards items={items} /> */}

        {/* <section className="relative">
          <ServicesIndex items={items} />
        </section> */}
        {/* <SurgeryBodyInteractive /> */}
        {/* <div className="relative w-full h-full">
          <GlassSlider items={items} />
        </div> */}
        {/* <ParallaxBento items={items} /> */}
        <section className="flex min-h-screen items-center justify-center px-4 py-10">
          <GlassShieldShowcase
            imageSrc={'/images/lips.webp'}
            imageAlt="فیلر لب — نتیجه‌ای طبیعی"
            handle=""
            badge="تزریق ژل"
            title="فیلر لب"
            /* optional — override any part of the shield geometry */
            shield={{
              left: 25,
              top: 23,
              width: 65.2,
              height: 33.8,
              radius: 48,
            }}
            annotations={[
              {
                id: 'contour',
                text: 'آبرسانی و\nبرجسته‌سازی\nخط لب',
                textClassName: 'left-[4.5%] top-[37%] w-[24%] text-left',
                lines: [{ x1: 5, y1: 51, x2: 41, y2: 51, origin: 'left' }],
                dots: [{ x: 5, y: 51 }],
                delay: 0.7,
              },
              {
                id: 'volume',
                text: 'حجم‌دهی\nبه اندازهٔ کافی',
                textClassName: 'left-[73.5%] top-[36.5%] w-[23%] text-left',
                lines: [
                  { x1: 61, y1: 45.5, x2: 95, y2: 45.5, origin: 'right' },
                ],
                dots: [{ x: 95, y: 45.5 }],
                delay: 0.95,
              },
              {
                id: 'symmetry',
                text: 'متقارن‌تر،\nهماهنگ‌تر از همیشه',
                textClassName: 'left-[26%] top-[65.5%] w-[30%] text-center',
                lines: [{ x1: 57.6, y1: 58, x2: 57.6, y2: 68, origin: 'top' }],
                dots: [{ x: 57.6, y: 68 }],
                delay: 1.2,
              },
            ]}
          />
        </section>

        <BeforeAfterRevealSlider
          before={{
            src: '/images/b-a/facelift-b.webp',
            alt: 'بیمار قبل از لیفت صورت',
          }}
          after={{
            src: '/images/b-a/facelift-a.webp',
            alt: 'بیمار بعد از لیفت صورت',
          }}
          beforeSide="right"
          title="لیفت صورت"
          tags={['جراحی', '۶ ماه پس از عمل']}
          link="/cases/rhinoplasty-01"
          linkLabel="مشاهدهٔ پروندهٔ کامل"
          priority
        />
        <div className="relative h-full w-full py-10">
          {/* <ScrollSlider /> */}
          <BeforeAfterSlider />
        </div>
        {/* <section className="flex min-h-screen items-center justify-center px-4 py-10">
          <GlassShieldShowcase
            imageSrc={'/images/lips.webp'}
            imageAlt="فیلر لب — نتیجه‌ای طبیعی"
            handle=""
            badge="تزریق ژل"
            title="فیلر لب"
       
            shield={{
              left: 25,
              top: 23,
              width: 65.2,
              height: 33.8,
              radius: 48,
            }}
            annotations={[
              {
                id: 'contour',
                text: 'آبرسانی و\nبرجسته‌سازی\nخط لب',
                textClassName: 'left-[4.5%] top-[37%] w-[24%] text-left',
                lines: [{ x1: 5, y1: 51, x2: 41, y2: 51, origin: 'left' }],
                dots: [{ x: 5, y: 51 }],
                delay: 0.7,
              },
              {
                id: 'volume',
                text: 'حجم‌دهی\nبه اندازهٔ کافی',
                textClassName: 'left-[73.5%] top-[36.5%] w-[23%] text-left',
                lines: [
                  { x1: 61, y1: 45.5, x2: 95, y2: 45.5, origin: 'right' },
                ],
                dots: [{ x: 95, y: 45.5 }],
                delay: 0.95,
              },
              {
                id: 'symmetry',
                text: 'متقارن‌تر،\nهماهنگ‌تر از همیشه',
                textClassName: 'left-[26%] top-[65.5%] w-[30%] text-center',
                lines: [{ x1: 57.6, y1: 58, x2: 57.6, y2: 68, origin: 'top' }],
                dots: [{ x: 57.6, y: 68 }],
                delay: 1.2,
              },
            ]}
          />
        </section> */}
        {/* <section className="relative bg-white">
        <HorizontalScrollCarousel rtl className="overflow-x-hidden" />
      </section> */}
        {/* <PersonnelCarousel /> */}
        {/* <section className="relative min-h-[70vh] overflow-hidden flex items-center justify-center">
        <Rotating />
      </section>
      <Highlights />
      <section dir="ltr" className="relative">
        <ImageCarousel />
      </section> */}
        {/* <StickyScrollVideo /> */}
        <section id="results" className="scroll-mt-24">
          <ResultsPage />
        </section>
        {/* <CompareSlides />
         */}
        {/* <CreativeCompare /> */}
        {/* <DCompareSlides /> */}
        {/* <ZShaderCompareSlides /> */}
        {/* <section id="services" className="relative scroll-mt-24">
          <AdvancedBodyCarousel />
        </section> */}
        <div
          id="testimonials"
          dir="ltr"
          className="w-full h-full relative scroll-mt-24"
        >
          <TestimonialsSwiper reviews={reviews} statsLine={statsLine} />
        </div>
        {/* <section className="flex gap-2">
        <MarqueeDemoVertical />
      </section> */}
        {/* Floating actions — connect the landing page to the live booking flow */}
        {/* <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-3 sm:bottom-6 sm:left-6">
          <Link
            href="/booking"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gild-bright via-gilded to-gild-deep px-6 py-3.5 text-sm font-bold text-canvas-deep shadow-xl shadow-gilded/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gilded/40 active:scale-95"
          >
            <CalendarCheck
              size={18}
              className="transition-transform duration-300 group-hover:rotate-6"
            />
            رزرو نوبت آنلاین
          </Link>
          <Link
            href="/user"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-cream/40 bg-cream/85 px-5 py-2 text-[13px] font-semibold text-canvas-deep backdrop-blur-md transition-all duration-300 hover:bg-cream hover:scale-105 active:scale-95"
          >
            <UserRound size={14} />
            ویزیت‌های من
          </Link>
        </div> */}
      </section>
    </ViewTransition>
  )
}
