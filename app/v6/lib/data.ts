/**
 * /v6 content — mock data for the Iranized LIKHA port.
 * The original pulled treatments/products/quickLinks/reviews from Drizzle;
 * here they are static Persian content for a cardiology + orthopedic
 * practice ("درنا طب"). Types mirror the Drizzle schema exactly so the
 * page can later be wired to real Prisma models without component changes.
 */

export type Treatment = {
  id: number
  slug: string
  title: string
  blurb: string
  icon: string
  priceFrom: string
  duration: string
  sortOrder: number
  createdAt: null
}

export type Product = {
  id: number
  slug: string
  title: string
  description: string
  image: string
  sortOrder: number
  createdAt: null
}

export type QuickLink = {
  id: number
  labelTop: string
  labelBottom: string
  href: string
  sortOrder: number
}

export type Review = {
  id: number
  author: string
  location: string
  rating: number
  body: string
  sortOrder: number
}

/* ------------------------------------------------------------------ */
/* Practice identity                                                   */
/* ------------------------------------------------------------------ */

export const site = {
  name: 'درنا طب',
  tagline: 'قلب سالم، استخوان محکم',
  doctorCardio: 'دکتر آرش صادقی',
  doctorOrtho: 'دکتر مهین رستمی',
  phone: '۰۲۱-۲۶۷۴۵۳۲۱',
  phoneHref: 'tel:+982126745321',
  address: 'تهران، خیابان شریعتی، بالاتر از میدان تجریش، برج سلامت، طبقه پنجم',
  mapsHref: 'https://maps.google.com/?q=Tehran+Tajrish',
  hours: [
    { k: 'شنبه تا چهارشنبه', v: '۹:۰۰ – ۱۹:۰۰' },
    { k: 'پنجشنبه', v: '۹:۰۰ – ۱۴:۰۰' },
    { k: 'جمعه', v: 'تعطیل' },
    { k: 'پارکینگ', v: 'آسانسور اختصاصی' },
  ],
}

/* ------------------------------------------------------------------ */
/* Hero / intro                                                        */
/* ------------------------------------------------------------------ */

export const hero = {
  titleRightTop: 'سلامتی',
  titleRightBottom: 'حقِ همہ است',
  titleLeftTop: 'نه',
  titleLeftBottom: 'امتیازی خاص',
  introTagline: 'قلب سالم، استخوان محکم',
  marquee: [
    'کلینیک تخصصی قلب و ارتوپدی',
    'پزشک‌محور، نه دستگاه‌محور',
    'درمان‌های کم‌تهاجمی',
    'شفاف و منصفانه',
    'رضایت ۵ ستاره',
    'تجربه‌ی جراحی بی‌درد',
  ],
  quickTitleA: 'برای',
  quickTitleAccent: 'خلقِ سلامتی',
  quickTitleB: 'با تخصص و دقت',
}

export const quickLinks: QuickLink[] = [
  { id: 1, labelTop: 'کارتی', labelBottom: 'هدیه سلامتی', href: '#gift-cards', sortOrder: 0 },
  { id: 2, labelTop: 'خدمات', labelBottom: 'و تعرفه‌ها', href: '#treatments', sortOrder: 1 },
  { id: 3, labelTop: 'آدرس', labelBottom: 'و ساعت کاری', href: '#visit', sortOrder: 2 },
  { id: 4, labelTop: 'انتخاب', labelBottom: 'دکتر‌ها', href: '#my-pick', sortOrder: 3 },
]

/* ------------------------------------------------------------------ */
/* Treatments — cardiology + orthopedic services                        */
/* ------------------------------------------------------------------ */

export const treatments: Treatment[] = [
  {
    id: 1,
    slug: 'echo-cardio',
    title: 'اکوکاردیوگرافی',
    blurb: 'تصویربرداری دقیق از ساختار و عملکرد قلب با دستگاه‌های روز.',
    icon: '/img-v6/Anti-Wrinkes.svg',
    priceFrom: 'از ۹۵۰ هزار تومان',
    duration: '۳۰ دقیقه',
    sortOrder: 0,
    createdAt: null,
  },
  {
    id: 2,
    slug: 'angiography',
    title: 'آنژیوگرافی',
    blurb: 'تشخیص و درمان تنگی عروق کرونر با روش‌های کم‌تهاجمی.',
    icon: '/img-v6/Lip-Fillers-1.svg',
    priceFrom: 'از ۴۵ میلیون تومان',
    duration: '۴۵ دقیقه',
    sortOrder: 1,
    createdAt: null,
  },
  {
    id: 3,
    slug: 'holter',
    title: 'هولتر ریتم قلب',
    blurb: 'پایش ۲۴ ساعته‌ی ضربان قلب برای یافتن ریتم‌های پنهان.',
    icon: '/img-v6/ddddd-01.svg',
    priceFrom: 'از ۱۲۰۰ هزار تومان',
    duration: '۲۴ ساعت',
    sortOrder: 2,
    createdAt: null,
  },
  {
    id: 4,
    slug: 'sport-cardio',
    title: 'پزشکی ورزشی قلب',
    blurb: 'ارزیابی ظرفیت قلبی ورزشکاران و طراحی برنامه‌ی تمرین امن.',
    icon: '/img-v6/Profhilio.svg',
    priceFrom: 'از ۸۵۰ هزار تومان',
    duration: '۴۵ دقیقه',
    sortOrder: 3,
    createdAt: null,
  },
  {
    id: 5,
    slug: 'arthroscopy',
    title: 'آرتروسکوپی',
    blurb: 'جراحی مفصل با برش‌های میلی‌متری و بازسازی سریع.',
    icon: '/img-v6/Micro-Needling.svg',
    priceFrom: 'از ۸۵ میلیون تومان',
    duration: '۶۰ دقیقه',
    sortOrder: 4,
    createdAt: null,
  },
  {
    id: 6,
    slug: 'knee-replacement',
    title: 'تعویض مفصل زانو',
    blurb: 'پروتزهای نسل جدید با طراحی اختصاصی برای هر بیمار.',
    icon: '/img-v6/fat-1.svg',
    priceFrom: 'از ۳۲۰ میلیون تومان',
    duration: '۹۰ دقیقه',
    sortOrder: 5,
    createdAt: null,
  },
  {
    id: 7,
    slug: 'spine',
    title: 'تخصصی ستون فقرات',
    blurb: 'درمان کمردرد، دیسک و انحنای ستون فقرات بدون جراحی باز.',
    icon: '/img-v6/Chemical-peel.svg',
    priceFrom: 'از ۱۵۰۰ هزار تومان',
    duration: '۴۵ دقیقه',
    sortOrder: 6,
    createdAt: null,
  },
  {
    id: 8,
    slug: 'fracture',
    title: 'جراحی شکستگی',
    blurb: 'مراقبت اورژانسی و تثبیت دقیق شکستگی‌های پیچیده.',
    icon: '/img-v6/surgery-01.svg',
    priceFrom: 'از ۶۰ میلیون تومان',
    duration: 'متغیر',
    sortOrder: 7,
    createdAt: null,
  },
]

/* ------------------------------------------------------------------ */
/* Doctors ("My Pick" — the two specialists)                            */
/* ------------------------------------------------------------------ */

export const doctors: Product[] = [
  {
    id: 1,
    slug: 'dr-arash-sadeghi',
    title: 'دکتر آرش صادقی — متخصص قلب و عروق',
    description:
      'فلوشیپ آنژیوپلاستی از دانشگاه علوم پزشکی تهران؛ بیش از ۴۰۰۰ آنژیوگرافی موفق و تخصص در روش‌های کم‌تهاجمی.',
    image: '/img-v6/home-hero.png',
    sortOrder: 0,
    createdAt: null,
  },
  {
    id: 2,
    slug: 'dr-mahin-rostami',
    title: 'دکتر مهین رستمی — متخصص ارتوپدی',
    description:
      'فلوشیپ جراحی مفصل از فرانسه؛ پیشگام آرتروسکوپی در ایران و طراح پروتزهای اختصاصی زانو برای آناتومی ایرانی.',
    image: '/img-v6/image01.jpg',
    sortOrder: 1,
    createdAt: null,
  },
]

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export const reviews: Review[] = [
  {
    id: 1,
    author: 'مهدی ک.',
    location: 'تهران، سعادت‌آباد',
    rating: 5,
    body: 'دکتر صادقی هر گزینه را با صبر توضیح داد و هیچ‌وقت درمان اضافه تجویز نکرد.',
    sortOrder: 0,
  },
  {
    id: 2,
    author: 'نسرین ب.',
    location: 'کرج',
    rating: 5,
    body: 'سه سال است به درنا طب مراجعه می‌کنم. آرامش کلینیک و شفافیت تعرفه‌ها بی‌نظیر است.',
    sortOrder: 1,
  },
  {
    id: 3,
    author: 'رضا م.',
    location: 'تهران، پونک',
    rating: 5,
    body: 'سال‌ها از آرتروسکوپی می‌ترسیدم. سوابق جراحی دکتر رستمی کاملاً اطمینانم را برطرف کرد.',
    sortOrder: 2,
  },
  {
    id: 4,
    author: 'لیلا ح.',
    location: 'تهران، شهرک غرب',
    rating: 5,
    body: 'منصفانه، دقیق و فوق‌العاده ماهر. اینجا واقعاً سلامتی یک حق است، نه امتیاز.',
    sortOrder: 3,
  },
]
