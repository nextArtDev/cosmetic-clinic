/**
 * /v6 content — mock data for the Iranized LIKHA port.
 * The original pulled treatments/products/quickLinks/reviews from Drizzle;
 * here they are static Persian content for a neurology + psychiatry
 * practice ("سیمای آرام"). Types mirror the Drizzle schema exactly so the
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
  name: 'سیمای آرام',
  tagline: 'ذهنی آرام، زندگی روشن',
  doctorNeuro: 'دکتر کیان فرهادی',
  doctorPsych: 'دکتر لیلا موسوی',
  phone: '۰۲۱-۲۲۹۰۱۷۳۴',
  phoneHref: 'tel:+982122901734',
  address: 'تهران، خیابان ولیعصر، نرسیده به پل علامه، برج آرامش، طبقه چهارم',
  mapsHref: 'https://maps.google.com/?q=Tehran+Valiasr',
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
  titleRightTop: 'آرامش ذهن',
  titleRightBottom: 'حقِ همہ است',
  titleLeftTop: 'نه',
  titleLeftBottom: 'اثری لوکس',
  introTagline: 'ذهنی آرام، زندگی روشن',
  marquee: [
    'کلینیک تخصصی مغز و اعصاب و روان',
    'درمان‌محور، نه برچسب‌محور',
    'روان‌درمانی علمی و کوتاه‌مدت',
    'شفاف و بدون قضاوت',
    'رضایت ۵ ستاره',
    'مشاوره واقعی، نسخه‌ی دقیق',
  ],
  quickTitleA: 'برای',
  quickTitleAccent: 'درکِ عمیقِ ذهن',
  quickTitleB: 'با علم و مهربانی',
}

export const quickLinks: QuickLink[] = [
  { id: 1, labelTop: 'کارتی', labelBottom: 'هدیه سلامتی', href: '#gift-cards', sortOrder: 0 },
  { id: 2, labelTop: 'خدمات', labelBottom: 'و تعرفه‌ها', href: '#treatments', sortOrder: 1 },
  { id: 3, labelTop: 'آدرس', labelBottom: 'و ساعت کاری', href: '#visit', sortOrder: 2 },
  { id: 4, labelTop: 'متخصص‌ها', labelBottom: 'را ببینید', href: '#my-pick', sortOrder: 3 },
]

/* ------------------------------------------------------------------ */
/* Treatments — neurology + psychiatry services                        */
/* ------------------------------------------------------------------ */

export const treatments: Treatment[] = [
  {
    id: 1,
    slug: 'eeg',
    title: 'نوار مغز (EEG)',
    blurb: 'ثبت دقیق فعالیت الکتریکی مغز برای تشخیص صرع و اختلالات نقشه‌خواب.',
    icon: '/img-v6/Anti-Wrinkes.svg',
    priceFrom: 'از ۹۵۰ هزار تومان',
    duration: '۴۵ دقیقه',
    sortOrder: 0,
    createdAt: null,
  },
  {
    id: 2,
    slug: 'emg-ncv',
    title: 'نوار عصب و عضله (EMG-NCV)',
    blurb: 'ارزیابی سرعت هدایت عصبی برای بی‌حسی، مورتارگژی و آسیب‌های عصبی.',
    icon: '/img-v6/Lip-Fillers-1.svg',
    priceFrom: 'از ۱۶۰۰ هزار تومان',
    duration: '۶۰ دقیقه',
    sortOrder: 1,
    createdAt: null,
  },
  {
    id: 3,
    slug: 'migraine-clinic',
    title: 'کلینیک سردرد و میگرن',
    blurb: 'پروتکل‌های روز دنیا برای میگرن مزمن؛ از بوتاکس پیشگیرانه تا CGRP.',
    icon: '/img-v6/ddddd-01.svg',
    priceFrom: 'از ۱۲۰۰ هزار تومان',
    duration: '۳۰ دقیقه',
    sortOrder: 2,
    createdAt: null,
  },
  {
    id: 4,
    slug: 'epilepsy-care',
    title: 'پیگیری صرع',
    blurb: 'تشخیص تخصصی، تنظیم دارو و پایش بلندمدت برای زندگی بدون تشنج.',
    icon: '/img-v6/Profhilio.svg',
    priceFrom: 'از ۱۴۰۰ هزار تومان',
    duration: '۴۵ دقیقه',
    sortOrder: 3,
    createdAt: null,
  },
  {
    id: 5,
    slug: 'psychotherapy',
    title: 'روان‌درمانی (CBT)',
    blurb: 'جلسات ساختارمند شناخت‌درمانی برای اضطراب، افسردگی و وسواس.',
    icon: '/img-v6/Micro-Needling.svg',
    priceFrom: 'از ۹۰۰ هزار تومان',
    duration: '۵۰ دقیقه',
    sortOrder: 4,
    createdAt: null,
  },
  {
    id: 6,
    slug: 'adhd-assessment',
    title: 'ارزیابی و درمان ADHD',
    blurb: 'تشخیص استاندارد بزرگسالی و کودکان، همراه با برنامه‌ی درمان ترکیبی.',
    icon: '/img-v6/fat-1.svg',
    priceFrom: 'از ۲۵۰۰ هزار تومان',
    duration: '۹۰ دقیقه',
    sortOrder: 5,
    createdAt: null,
  },
  {
    id: 7,
    slug: 'med-management',
    title: 'تنظیم داروی روان‌پزشکی',
    blurb: 'نسخه‌ی حداقلی و دقیق؛ شروع، تنظیم و توقف دارو زیر نظر متخصص.',
    icon: '/img-v6/Chemical-peel.svg',
    priceFrom: 'از ۸۵۰ هزار تومان',
    duration: '۳۰ دقیقه',
    sortOrder: 6,
    createdAt: null,
  },
  {
    id: 8,
    slug: 'sleep-medicine',
    title: 'طب خواب',
    blurb: 'تشخیص بی‌خوابی و آپنه خواب و درمان رفتاری‌دارویی بدون وابستگی.',
    icon: '/img-v6/surgery-01.svg',
    priceFrom: 'از ۱۱۰۰ هزار تومان',
    duration: '۴۵ دقیقه',
    sortOrder: 7,
    createdAt: null,
  },
]

/* ------------------------------------------------------------------ */
/* Doctors ("My Pick" — the two specialists)                           */
/* ------------------------------------------------------------------ */

export const doctors: Product[] = [
  {
    id: 1,
    slug: 'dr-kian-farhadi',
    title: 'دکتر کیان فرهادی — متخصص مغز و اعصاب',
    description:
      'بورد تخصصی عصب‌شناسی از دانشگاه علوم پزشکی تهران؛ فلوشیپ اختلالات حرکتی از مونیخ و پیشگام درمان میگرن با CGRP در ایران.',
    image: '/img-v6/home-hero.png',
    sortOrder: 0,
    createdAt: null,
  },
  {
    id: 2,
    slug: 'dr-leila-mousavi',
    title: 'دکتر لیلا موسوی — روان‌پزشک',
    description:
      'بورد روان‌پزشکی از دانشگاه علوم پزشکی شهید بهشتی؛ فلوشیپ روان‌درمانی کودک و نوجوان و مدرس دوره‌های CBT در ایران.',
    image: '/img-v6/image01.jpg',
    sortOrder: 1,
    createdAt: null,
  },
]

/* ------------------------------------------------------------------ */
/* Reviews                                                            */
/* ------------------------------------------------------------------ */

export const reviews: Review[] = [
  {
    id: 1,
    author: 'سارا م.',
    location: 'تهران، زعفرانیه',
    rating: 5,
    body: 'دکتر موسوی بدون قضاوت گوش داد و درمان را قدم‌به‌قدم توضیح داد؛ اولین بار بود که احساس کردم واقعاً فهمیده شدم.',
    sortOrder: 0,
  },
  {
    id: 2,
    author: 'امیر ر.',
    location: 'تهران، پونک',
    rating: 5,
    body: 'بعد از سال‌ها میگرن مزمن، پروتکل دکتر فرهادی طی سه ماه زندگی‌ام را عوض کرد. تعرفه‌ها هم از اول شفاف بود.',
    sortOrder: 1,
  },
  {
    id: 3,
    author: 'نگار ت.',
    location: 'کرج',
    rating: 5,
    body: 'برای ارزیابی ADHD پسرم مراجعه کردیم. صبور، دقیق و بدون نسخه‌ی اضافه. آرامش این کلینیک بی‌نظیر است.',
    sortOrder: 2,
  },
  {
    id: 4,
    author: 'حسین ک.',
    location: 'تهران، سعادت‌آباد',
    rating: 5,
    body: 'روان‌درمانی اینجا فقط حرف زدن نیست؛ ساختار دارد، جلسه‌بندی دارد و واقعاً جواب می‌دهد.',
    sortOrder: 3,
  },
]
