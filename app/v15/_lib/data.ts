/** V15 — MOCK DATA for the delvaux/maison clone.
 * Every text/price here is mocked. When wiring the real backend, replace
 * these arrays with Prisma queries (the types below map 1:1 to simple
 * Prisma models, e.g. `model Product { id String name String ... }`).
 */

export type Product = {
  id: string;
  slug: string;
  name: string; // نام فارسی
  latinName: string; // نام لاتین
  category: string;
  price: number; // تومان
  image: string;
  tag?: 'جدید' | 'نمادین' | 'پرفروش';
  material: string;
  description: string;
};

export type Collection = {
  id: string;
  index: number;
  name: string;
  latinName: string;
  category: string;
  story: string;
  image: string;
};

export type CraftStep = {
  index: number;
  title: string;
  latin: string;
  body: string;
  image: string;
};

export type Era = {
  year: number;
  title: string;
  body: string;
};

/* ── کالکشن‌ها ─────────────────────────────────────────────────────────── */
export const COLLECTIONS: Collection[] = [
  {
    id: 'sarv',
    index: 1,
    name: 'سرو',
    latinName: 'SARV',
    category: 'کیف‌های ساخت‌یافته‌ی دسته‌دار',
    story: 'بلندقامت و آراسته، همچون سروی در باغِ ایرانی.',
    image: '/maison/collection-1.jpg',
  },
  {
    id: 'mahtab',
    index: 2,
    name: 'ماه‌تاب',
    latinName: 'MAHTAB',
    category: 'کراس‌بادی‌های روزانه',
    story: 'سبک و رها، برای قدم‌زدن در نورِ ماه.',
    image: '/maison/collection-2.jpg',
  },
  {
    id: 'negin',
    index: 3,
    name: 'نگین',
    latinName: 'NEGIN',
    category: 'کیف‌های کوچکِ شب',
    story: 'کوچک، اما با همان وقارِ همیشگی.',
    image: '/maison/product-2.jpg',
  },
  {
    id: 'kavir',
    index: 4,
    name: 'کویر',
    latinName: 'KAVIR',
    category: 'چرم‌های کوچک و اکسسوری',
    story: 'جزئیاتِ کوچک؛ جایی که صنعتگری آغاز می‌شود.',
    image: '/maison/collection-3.jpg',
  },
];

/* ── محصولات ───────────────────────────────────────────────────────────── */
export const PRODUCTS: Product[] = [
  {
    id: 'p-sarv',
    slug: 'sarv-grand',
    name: 'سروِ بزرگ',
    latinName: 'SARV GM',
    category: 'کیف دسته‌دار',
    price: 46_500_000,
    image: '/maison/collection-1.jpg',
    tag: 'نمادین',
    material: 'چرمِ گیاهی‌دباغی، رنگ عسلی',
    description: 'ساختاری تمام‌عیار با دسته‌ی پیچان و قفل برنجیِ دست‌ساز.',
  },
  {
    id: 'p-mahtab',
    slug: 'mahtab-mini',
    name: 'ماه‌تابِ مینی',
    latinName: 'MAHTAB MINI',
    category: 'کراس‌بادی',
    price: 28_900_000,
    image: '/maison/collection-2.jpg',
    tag: 'جدید',
    material: 'چرمِ کارامل، بندِ قابل‌تنظیم',
    description: 'همراهِ سبکِ روزها؛ با آسترِ کتانِ آسترکشی‌شده.',
  },
  {
    id: 'p-negin',
    slug: 'negin-soir',
    name: 'نگینِ شب',
    latinName: 'NEGIN SOIR',
    category: 'کیف کوچک',
    price: 22_400_000,
    image: '/maison/product-2.jpg',
    material: 'چرمِ قهوه‌ای اسپرسو، یراق برنجی',
    description: 'حجمی نرم و انحنایی که در دست، گم می‌شود.',
  },
  {
    id: 'p-kavir-tote',
    slug: 'kavir-tote',
    name: 'دست‌دوزِ کویر',
    latinName: 'KAVIR TOTE',
    category: 'توتِ روزانه',
    price: 39_800_000,
    image: '/maison/product-1.jpg',
    tag: 'پرفروش',
    material: 'چرمِ عسلی‌روشن، دوختِ زینی',
    description: 'جادار و بادوام؛ دوخته‌شده برای سال‌ها همراهی.',
  },
  {
    id: 'p-raha',
    slug: 'raha-ivory',
    name: 'رها — استخوانی',
    latinName: 'RAHA IVORY',
    category: 'کیف دسته‌مارپیچ',
    price: 52_000_000,
    image: '/maison/hero.jpg',
    tag: 'جدید',
    material: 'چرمِ کرمِ استخوانی، دسته‌ی پیچیده‌شده',
    description: 'نمادِ آرامشِ خانه؛ ساخته‌شده از یک تکه چرمِ بی‌نقص.',
  },
  {
    id: 'p-kavir-set',
    slug: 'kavir-slg-set',
    name: 'ستِ چرم‌های کوچک',
    latinName: 'KAVIR SLG SET',
    category: 'کیف‌پول و کارتی',
    price: 8_900_000,
    image: '/maison/collection-3.jpg',
    material: 'چرمِ گیاهی‌دباغی، مُهر گرمِ راگا',
    description: 'کیف‌پول، کارتی و جاسکُه‌ای؛ دعوتی به جهانِ راگا.',
  },
];
/* ── صنعتگری ───────────────────────────────────────────────────────────── */
export const CRAFT_STEPS: CraftStep[] = [
  {
    index: 1,
    title: 'انتخابِ پوست',
    latin: 'SELECTION',
    body: 'از هر صد پوست، تنها سه‌تای آن راهِ کارگاهِ راگا را در می‌یابد؛ چرمی گیاهی‌دباغی که با گذرِ سال، خواب نمی‌میرد — بیدارتر می‌شود.',
    image: '/maison/craft-leather.jpg',
  },
  {
    index: 2,
    title: 'برشِ دست',
    latin: 'CUTTING',
    body: 'هیچ قالبی جای چشمِ استادکار را نمی‌گیرد. هر قطعه در امتدادِ رگه‌های چرم بریده می‌شود تا در نقطه‌ی حساس، تسلیم نشود.',
    image: '/maison/craft-tools.jpg',
  },
  {
    index: 3,
    title: 'دوختِ زینی',
    latin: 'SADDLE STITCH',
    body: 'دو سوزن، یک نخِ موم‌زده؛ دوختی که اگر سال‌ها بعد بگسلد، باز هم رشته‌بندی‌اش از هم نمی‌گسلد. سنتِ زینی، امضای ماست.',
    image: '/maison/craft-hands.jpg',
  },
  {
    index: 4,
    title: 'لبه‌سوزنی و مُهر',
    latin: 'FINISHING',
    body: 'پنج لایه رنگِ لبه، هر لایه با گل‌سوزنیِ داغ صیقل می‌خورد؛ سپس مُهرِ گرم — نامی که تا نسل‌ها بر چرم می‌ماند.',
    image: '/maison/collection-1.jpg',
  },
];

/* ── روایتِ خانه (داده‌ی نمایشی) ────────────────────────────────────────── */
export const ERAS: Era[] = [
  {
    year: 1304,
    title: 'کارگاهِ سه نیمکت',
    body: 'در یکی از میان‌سراهای بازارِ بزرگِ تهران، محمود راگائی کارگاهی با سه نیمکت برپا می‌کند؛ زنگنه‌ی اولین «تِمه» از همین‌جا به گوش می‌رسد.',
  },
  {
    year: 1351,
    title: 'نسلِ دوم، نخستین «سرو»',
    body: 'دخترِ کارگاه، اوّلین الگوی «سرو» را می‌کشد؛ کیفی که سال‌ها بعد نمادِ خانه می‌شود و هنوز با همان الگو، دستِ مشتری می‌رسد.',
  },
  {
    year: 1379,
    title: 'پیوند با دبّاغان',
    body: 'بازگشت به دباغیِ گیاهی با بَرگ و پوستِ بلوط؛ همکاریِ مستقیم با دبّاغانِ کهنسال تا چرمی که «نفس» می‌کشد.',
  },
  {
    year: 1403,
    title: 'بوتیکِ بازدیدپذیر',
    body: 'گشایش فضای تازه در فرمانیه؛ جایی که دیوارِ شیشه‌ایِ کارگاه، دوختن را به تماشا می‌گذارد. (داده‌ی نمایشی — Mock)',
  },
];

/* ── ناوبری ────────────────────────────────────────────────────────────── */
export const NAV_LINKS = [
  { label: 'کالکشن‌ها', href: '#collections', index: '۰۱' },
  { label: 'صنعتگری', href: '#craft', index: '۰۲' },
  { label: 'خانه‌ی راگا', href: '#heritage', index: '۰۳' },
  { label: 'فروشگاه', href: '#shop', index: '۰۴' },
  { label: 'بوتیک', href: '#boutique', index: '۰۵' },
] as const;