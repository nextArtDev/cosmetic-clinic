/* ============================================================
   MAYA — mock data layer.
   Every getter is async and returns plain serializable data,
   so it can be swapped 1:1 with Prisma/Drizzle queries later
   without touching any component.
   ============================================================ */

export type MayaProduct = {
  id: string;
  slug: string;
  title: string;
  price: number; // toman
  compareAt?: number;
  image: string;
  colors: string[]; // hex swatches
  sizes: string[];
  tag?: string;
  collection: string;
};

export type MayaCollection = {
  id: string;
  title: string;
  count: number;
  image: string;
};

export type MayaFeaturedTab = {
  id: string;
  heading: string;
  typed: string;
  paragraphs: string[];
  image: string;
  productIds: string[];
};

export type MayaTestimonial = {
  id: string;
  quote: string;
  name: string;
  city: string;
};

export type MayaFaq = { id: string; q: string; a: string };

export type MayaHeroSlide = {
  id: string;
  kicker: string;
  lines: [string, string];
  desc: string;
  image: string;
  position?: string;
};

/* ------------------------------ products ------------------------------ */

const PRODUCTS: MayaProduct[] = [
  {
    id: "p1",
    slug: "cream-sweatshirt",
    title: "سویشرت کرم فریز",
    price: 1_890_000,
    compareAt: 2_400_000,
    image: "/maya/img/prod-1.webp",
    colors: ["#d9cfbc", "#2a251d", "#8b8f7a"],
    sizes: ["S", "M", "L"],
    tag: "پرفروش",
    collection: "winter-luxe",
  },
  {
    id: "p2",
    slug: "straight-blue-jeans",
    title: "شلوار جین آبی راسته",
    price: 2_340_000,
    image: "/maya/img/prod-2.webp",
    colors: ["#33506e", "#16130e"],
    sizes: ["36", "38", "40"],
    collection: "summer-essentials",
  },
  {
    id: "p3",
    slug: "colorful-shirt-set",
    title: "ست پیراهن‌های رنگی",
    price: 3_120_000,
    compareAt: 3_900_000,
    image: "/maya/img/prod-3.webp",
    colors: ["#c97b4a", "#e5d5b8", "#7a86a1"],
    sizes: ["M", "L", "XL"],
    tag: "حراج",
    collection: "summer-drift",
  },
  {
    id: "p4",
    slug: "white-cotton-tee",
    title: "تیشرت سفید پنبه‌ای",
    price: 1_250_000,
    image: "/maya/img/prod-4.webp",
    colors: ["#f4f1ea", "#16130e", "#b9b0a0"],
    sizes: ["S", "M", "L", "XL"],
    collection: "summer-essentials",
  },
  {
    id: "p5",
    slug: "neutral-spring-set",
    title: "ست بهاری خنثی",
    price: 4_450_000,
    image: "/maya/img/prod-5.webp",
    colors: ["#d9cfbc", "#a99f8c"],
    sizes: ["M", "L"],
    tag: "جدید",
    collection: "winter-essentials",
  },
  {
    id: "p6",
    slug: "mom-fit-jeans",
    title: "شلوار جین مام‌استایل",
    price: 2_180_000,
    compareAt: 2_760_000,
    image: "/maya/img/prod-6.webp",
    colors: ["#33506e", "#8fa3b8"],
    sizes: ["36", "38", "40", "42"],
    collection: "sports-jacket",
  },
  {
    id: "p7",
    slug: "bright-daily-set",
    title: "ست روزمره روشن",
    price: 2_760_000,
    image: "/maya/img/prod-7.webp",
    colors: ["#efe9dc", "#c4b393"],
    sizes: ["S", "M", "L"],
    collection: "summer-drift",
  },
  {
    id: "p8",
    slug: "oversized-orange-tee",
    title: "تیشرت نارنجی اورسایز",
    price: 1_140_000,
    image: "/maya/img/prod-8.webp",
    colors: ["#d97f3e", "#16130e"],
    sizes: ["M", "L", "XL"],
    tag: "حراج",
    collection: "sportswear",
  },
];

/* ----------------------------- collections ---------------------------- */

const COLLECTIONS: MayaCollection[] = [
  { id: "winter-luxe", title: "زمستان لوکس", count: 24, image: "/maya/img/col-1.jpg" },
  { id: "sports-jacket", title: "کت اسپرت", count: 18, image: "/maya/img/col-2.jpg" },
  { id: "sportswear", title: "استایل ورزشی", count: 31, image: "/maya/img/col-6.jpg" },
  { id: "summer-essentials", title: "ضروری‌های تابستان", count: 27, image: "/maya/img/col-3.jpg" },
  { id: "summer-drift", title: "نسيم تابستان", count: 16, image: "/maya/img/col-4.jpg" },
  { id: "winter-essentials", title: "ضروری‌های زمستان", count: 22, image: "/maya/img/col-5.jpg" },
];

/* ------------------------------- hero --------------------------------- */

const HERO_SLIDES: MayaHeroSlide[] = [
  {
    id: "h1",
    kicker: "کالکشن پاییز و زمستان ۱۴۰۵",
    lines: ["مدِ بی‌زمان؛", "جوهرهٔ ظرافت"],
    desc: "پوشاکی که از ترندها فراتر می‌رود؛ طرح‌های کلاسیک، باوقار و ماندگار برای هر لحظهٔ زندگی.",
    image: "/maya/img/hero-1.webp",
    position: "center 30%",
  },
  {
    id: "h2",
    kicker: "دوخت ایرانی، پارچه درجه‌یک",
    lines: ["استایلی که", "به تو اعتماد می‌دهد"],
    desc: "هر بخیه با وسواس دوخته شده تا راحتی و زیبایی را هم‌زمان تجربه کنی.",
    image: "/maya/img/hero-2.webp",
    position: "center 20%",
  },
  {
    id: "h3",
    kicker: "ارسال رایگان سراسر ایران",
    lines: ["در هر لحظه،", "بی‌نیاز از تلاش بدرخش"],
    desc: "از لایه‌های گرم زمستانی تا ضروری‌های خنک تابستان؛ کمدت را با مایا کامل کن.",
    image: "/maya/img/hero-3.webp",
    position: "center 30%",
  },
];

/* ---------------------------- featured tabs --------------------------- */

const FEATURED_TABS: MayaFeaturedTab[] = [
  {
    id: "winter-warmth",
    heading: "خودت را در گرمای زمستان بپیچ",
    typed: "گرمای زمستان، با وقار",
    paragraphs: [
      "امسال زمستان، گرم و شیک بمان! لایه‌های لطیف، کاپشن‌های ترند و ضروری‌های فصل سرد را اینجا پیدا کن؛ از بافت‌های پشمی تا پوتین‌های جسورانه.",
      "هر جزئیات، از بافت‌های مخملی تا پرداخت‌های مجلسی، برای تجربه‌ای بهتر از زمستان انتخاب شده است.",
    ],
    image: "/maya/img/tab-1.jpg",
    productIds: ["p1", "p5", "p6"],
  },
  {
    id: "stylish-layers",
    heading: "لایه‌های شیک برای استایلی بی‌نقص",
    typed: "لایه‌لایه، تا کمال",
    paragraphs: [
      "کالکشن منتخب ما شامل کت‌های خوش‌دوخت، بافت‌های هوشمند و پوشاک لایه‌ای است که تو را گرم نگه می‌دارد و در عین حال حرفی برای گفتن دارد.",
      "این لایه‌ها به‌گونه‌ای طراحی شده‌اند که بی‌نقص با هم ست شوند؛ با هر لایه، عمق و شخصیت بیشتری به استایلت ببخش.",
    ],
    image: "/maya/img/tab-2.webp",
    productIds: ["p2", "p4", "p7"],
  },
  {
    id: "strong-moves",
    heading: "سبک قدرتمند برای حرکت‌های قاطع",
    typed: "قوی حرکت کن",
    paragraphs: [
      "از خیاطی مینیمال تا آیتم‌های جسورانه؛ هر قطعه برای توانمندسازی هر حرکت تو طراحی شده — در جلسه، در خیابان، در مسیر موفقیت.",
      "فرمی مثل پوست دوم و ظاهری که توجه می‌خواهد؛ چون وقتی قوی به نظر برسی، قوی‌تر حرکت می‌کنی.",
    ],
    image: "/maya/img/tab-3.webp",
    productIds: ["p3", "p6", "p8"],
  },
];

/* ---------------------------- testimonials ---------------------------- */

const TESTIMONIALS: MayaTestimonial[] = [
  {
    id: "t1",
    quote:
      "چند ماهی است که از مایا خرید می‌کنم و با اطمینان می‌گویم یکی از بهترین تجربه‌های خرید آنلاینم بوده؛ از ثبت سفارش روان تا ارسال سریع، همه‌چیز درجه‌یک.",
    name: "سارا محمدی",
    city: "تهران",
  },
  {
    id: "t2",
    quote:
      "از کالکشن «گرم و شیک» چند آیتم سفارش دادم و واقعاً راضی‌ام. پالتو هم گرم است هم ترند؛ کلی تعریفش را شنیدم! پارچه باکیفیت و سایزش دقیق است.",
    name: "امیرحسین کریمی",
    city: "اصفهان",
  },
  {
    id: "t3",
    quote:
      "به‌عنوان کسی که به محیط‌زیست اهمیت می‌دهد، خیلی خوشحال شدم برندی پیدا کنم که کالکشن دوستدار طبیعت دارد و از استایل هم هیچ کم نمی‌آورد.",
    name: "نگار احمدی",
    city: "شیراز",
  },
  {
    id: "t4",
    quote:
      "کل تجربهٔ خرید فوق‌العاده بود. سایت کاربرپسند است و دقیقاً همان چیزی را پیدا کردم که می‌خواستم. سفارشم سالم رسید و تن‌خور لباس‌ها عالی است.",
    name: "سینا رضایی",
    city: "مشهد",
  },
  {
    id: "t5",
    quote:
      "بیش از یک سال است مشتری ثابتم و به‌خاطر کیفیت و طراحی‌های شیک برمی‌گردم؛ چه لباس روزمره بخواهم چه مجلسی، همیشه چیزی به سلیقه‌ام پیدا می‌شود.",
    name: "درسا کاظمی",
    city: "تبریز",
  },
  {
    id: "t6",
    quote:
      "از کالکشن «ترند و راحت» خریدم و از کیفیت و طراحی واقعاً تحت تأثیر قرار گرفتم. آیتم‌ها آن‌قدر کاربردی‌اند که از سر کار تا مهمانی آخر هفته می‌پوشمشان.",
    name: "کیان موسوی",
    city: "رشت",
  },
];

/* -------------------------------- faqs -------------------------------- */

const FAQS: MayaFaq[] = [
  {
    id: "f1",
    q: "شرایط بازگشت و تعویض کالا چیست؟",
    a: "تا ۷ روز پس از تحویل، بدون قیدوشرط می‌توانی کالا را بازگردانی یا تعویض کنی؛ کافیست اقلام استفاده‌نشده، با بسته‌بندی و اتیکت سالم باشند. درخواست را از بخش «پیگیری سفارش» ثبت کن یا با پشتیبانی در تماس باش.",
  },
  {
    id: "f2",
    q: "اگر کالای آسیب‌دیده یا اشتباهی دریافت کنم چه کار کنم؟",
    a: "از این اتفاق واقعاً متأسفیم. تا ۴۸ ساعت پس از تحویل، با شماره سفارش و عکس کالا به پشتیبانی پیام بده تا در سریع‌ترین زمان ممکن موضوع را رایگان جبران کنیم.",
  },
  {
    id: "f3",
    q: "چطور سفارشم را پیگیری کنم؟",
    a: "به‌محض ارسال، کد رهگیری تیپاکس یا پست برایت پیامک می‌شود. همچنین با ورود به حساب کاربری و بخش «سفارش‌های من» می‌توانی وضعیت مرسوله را لحظه‌ای ببینی.",
  },
  {
    id: "f4",
    q: "روش‌های پرداخت چیست؟",
    a: "پرداخت آنلاین از طریق درگاه امن زرین‌پال با تمام کارت‌های عضو شتاب انجام می‌شود. برای سفارش‌های بالای ۱۰ میلیون تومان، امکان پرداخت در دو قسط هم فراهم است.",
  },
  {
    id: "f5",
    q: "می‌توانم سفارشم را پس از ثبت، تغییر دهم یا لغو کنم؟",
    a: "سفارش‌ها سریع پردازش می‌شوند تا زود به دستت برسند؛ بنابراین تغییر یا لغو فقط تا چند ساعت پس از ثبت ممکن است. بلافاصله با پشتیبانی تماس بگیر تا حتماً راهی پیدا کنیم.",
  },
];

/* ------------------------------ best sellers --------------------------- */

export type MayaBestSeller = {
  id: string;
  title: string;
  price: number;
  image: string;
  note: string;
};

const BEST_SELLERS: MayaBestSeller[] = [
  { id: "b1", title: "پیراهن تابستانه", price: 1_200_000, image: "/maya/img/col-3.jpg", note: "نخی و خنک" },
  { id: "b2", title: "بافت زنانه پشمی", price: 4_500_000, image: "/maya/img/col-4.jpg", note: "بافت دست‌نرم" },
  { id: "b3", title: "تیشرت لش", price: 3_500_000, image: "/maya/img/prod-8.webp", note: "اورسایز ترند" },
  { id: "b4", title: "پالتوی پشمی بلند", price: 4_500_000, image: "/maya/img/col-1.jpg", note: "کلاسیک زمستانی" },
  { id: "b5", title: "نیم‌تنه اسپرت", price: 1_650_000, image: "/maya/img/col-6.jpg", note: "تمرین روزانه" },
];

/* ------------------------------ promo cards ---------------------------- */

export type MayaPromoTile = {
  id: string;
  title: string;
  desc: string;
  image: string;
  size: "lg" | "sm";
};

const PROMO_TILES: MayaPromoTile[] = [
  {
    id: "g1",
    title: "گرم بمان و شیک",
    desc: "با کالکشن «گرم و شیک» بدون کم‌زدن از استایل، راحت بمان.",
    image: "/maya/img/grid-2.webp",
    size: "lg",
  },
  {
    id: "g2",
    title: "تا ۵۰٪ تخفیف",
    desc: "بهترین زمان برای تازه‌کردن استایلت؛ روی آیتم‌های منتخب.",
    image: "/maya/img/grid-3.webp",
    size: "sm",
  },
  {
    id: "g3",
    title: "شیک و کاربردی",
    desc: "تعادل بی‌نقصِ زیبایی و کاربرد را اینجا پیدا کن.",
    image: "/maya/img/grid-4.webp",
    size: "sm",
  },
  {
    id: "g4",
    title: "گرم بمان، خاص به نظر برس",
    desc: "قطعاتی که گرما می‌بخشند و استایلت را جسورانه نگه می‌دارند.",
    image: "/maya/img/grid-1.webp",
    size: "sm",
  },
];

/* ------------------------------- getters ------------------------------- */
/* Swap the bodies of these functions with Prisma queries when ready.     */

export async function getProducts(): Promise<MayaProduct[]> {
  return PRODUCTS;
}
export async function getTrendingProducts(): Promise<MayaProduct[]> {
  return PRODUCTS.slice(0, 4);
}
export async function getBundleProducts(): Promise<MayaProduct[]> {
  return PRODUCTS;
}
export async function getCollections(): Promise<MayaCollection[]> {
  return COLLECTIONS;
}
export async function getHeroSlides(): Promise<MayaHeroSlide[]> {
  return HERO_SLIDES;
}
export async function getFeaturedTabs(): Promise<
  Array<MayaFeaturedTab & { products: MayaProduct[] }>
> {
  return FEATURED_TABS.map((t) => ({
    ...t,
    products: t.productIds
      .map((id) => PRODUCTS.find((p) => p.id === id))
      .filter((p): p is MayaProduct => Boolean(p)),
  }));
}
export async function getTestimonials(): Promise<MayaTestimonial[]> {
  return TESTIMONIALS;
}
export async function getFaqs(): Promise<MayaFaq[]> {
  return FAQS;
}
export async function getBestSellers(): Promise<MayaBestSeller[]> {
  return BEST_SELLERS;
}
export async function getPromoTiles(): Promise<MayaPromoTile[]> {
  return PROMO_TILES;
}
