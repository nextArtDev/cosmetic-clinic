/** Content model for the IRANFIT landing. Keep this stable when you swap
 *  the mock/Drizzle loader with your own Prisma backend. */

export interface IranfitPlan {
  slug: string;
  name: string;
  monthlyPrice: number; // toman
  yearlyPrice: number; // toman (per month, billed yearly)
  features: string[];
  popular: boolean;
}

export interface IranfitTestimonial {
  name: string;
  city: string;
  quote: string;
  rating: number; // 1..5
  result: string; // e.g. "۱۲ کیلو کاهش وزن در ۵ ماه"
  /** Portrait shown in the story card + the avatar strip. */
  avatar: string;
}

export interface IranfitPost {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  image: string;
  dateLabel: string;
}

export interface IranfitMonth {
  title: string;
  subtitle: string;
  description: string;
  weeks: string[];
  /** Preview clip shown behind the "signup to watch" gate. */
  video: string;
  poster: string;
  /** e.g. "۲۴ جلسه · ۳۲ دقیقه" */
  meta: string;
}

/** A coached programme branch (women / men) shown as a cinematic split card. */
export interface IranfitProgram {
  slug: string;
  title: string;
  subtitle: string;
  /** e.g. "۲۴ جلسه · خانگی و باشگاه" */
  meta: string;
  image: string;
  video: string;
  poster: string;
}

/** One client transformation pair for the drag-to-compare slider. */
export interface IranfitBeforeAfter {
  slug: string;
  name: string;
  city: string;
  /** e.g. "۱۸ کیلو کاهش وزن در ۷ ماه" */
  result: string;
  /** e.g. "۷ ماه" */
  duration: string;
  quote: string;
  image: string;
}

/** A photo in the "behind the scenes" gallery + lightbox. */
export interface IranfitGalleryItem {
  src: string;
  caption: string;
  /** Layout hints for the asymmetric grid. */
  wide?: boolean;
  tall?: boolean;
}

export interface IranfitContent {
  plans: IranfitPlan[];
  testimonials: IranfitTestimonial[];
  posts: IranfitPost[];
  months: IranfitMonth[];
  programs: IranfitProgram[];
  beforeAfter: IranfitBeforeAfter[];
  gallery: IranfitGalleryItem[];
}

/** Ordered table of contents used by the progress rail + scroll spy.
 *  Order mirrors the page: hero → programme → book → coach → programmes →
 *  pricing → before/after → app → stories → news → join. */
export const IRANFIT_SECTIONS = [
  { id: "hero", index: 1 },
  { id: "program", index: 2 },
  { id: "book", index: 3 },
  { id: "coach", index: 4 },
  { id: "programs", index: 5 },
  { id: "pricing", index: 6 },
  { id: "beforeafter", index: 7 },
  { id: "app", index: 8 },
  { id: "stories", index: 9 },
  { id: "news", index: 10 },
  { id: "join", index: 11 },
] as const;
