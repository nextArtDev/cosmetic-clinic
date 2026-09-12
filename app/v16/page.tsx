import {
  getBestSellers,
  getBundleProducts,
  getCollections,
  getFaqs,
  getFeaturedTabs,
  getHeroSlides,
  getPromoTiles,
  getStackedProducts,
  getTestimonials,
  getTrendingProducts,
} from "./lib/data";
import { MayaApp, type MayaData } from "./components/MayaApp";

// /v16 — animation-complete Maya storefront port (chat-clone/shpfy-in-v2-maya,
// reference: maya-theme-empower.myshopify.com). GSAP/ScrollTrigger/Lenis stay
// inside this subtree; the mock getters are Prisma-swappable without touching UI.
export const metadata = {
  title: { absolute: "مایا | فروشگاه مد و پوشاک ایرانی — v16 demo" },
  description:
    "مایا — ظرافت بی‌زمان با روندهای مدرن. پوشاک ایرانی با پارچه درجه‌یک و طراحی یکتا. ارسال رایگان به سراسر ایران.",
  robots: { index: false, follow: false },
};

export default async function V16Page() {
  const [
    heroSlides,
    collections,
    trending,
    bundleProducts,
    stackedProducts,
    featuredTabs,
    testimonials,
    faqs,
    bestSellers,
    promoTiles,
  ] = await Promise.all([
    getHeroSlides(),
    getCollections(),
    getTrendingProducts(),
    getBundleProducts(),
    getStackedProducts(),
    getFeaturedTabs(),
    getTestimonials(),
    getFaqs(),
    getBestSellers(),
    getPromoTiles(),
  ]);

  const data: MayaData = {
    heroSlides,
    collections,
    trending,
    bundleProducts,
    stackedProducts,
    featuredTabs,
    testimonials,
    faqs,
    bestSellers,
    promoTiles,
  };

  return <MayaApp data={data} />;
}
