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
}

export interface IranfitContent {
  plans: IranfitPlan[];
  testimonials: IranfitTestimonial[];
  posts: IranfitPost[];
  months: IranfitMonth[];
}

export const IRANFIT_SECTIONS = [
  { id: "hero", index: 1 },
  { id: "program", index: 2 },
  { id: "book", index: 3 },
  { id: "pricing", index: 4 },
  { id: "app", index: 5 },
  { id: "stories", index: 6 },
  { id: "coach", index: 7 },
  { id: "news", index: 8 },
  { id: "join", index: 9 },
] as const;
