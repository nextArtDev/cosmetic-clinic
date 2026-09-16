/* ============================================================
   آریاسنگ — mock content repository (/v22)
   Every Persian string the experience renders comes from here.
   This stands in for the real backend: replace `aryasangRepository`
   with a Prisma implementation later — the component contract
   (the exported types + listPosts/listShowrooms) stays identical.
   ============================================================ */

export type NavItem = {
  label: string
  href: string
  /** Full-screen menu hover preview (upstream `[data-menu-main] figure.image`). */
  image?: string
  children?: { label: string; href: string }[]
}

export type Shortcut = {
  label: string
  caption: string
  href: string
}

export type ProductCategory = {
  id: string
  name: string
  image: string
  href: string
}

export type Showroom = {
  id: string
  name: string
  role: string
  address: string
  phone: string
  email: string
  mapsLabel: string
  mapsHref: string
}

export type BlogPost = {
  id: string
  date: string
  title: string
  excerpt: string
  category: string
  image: string
  href: string
}

export const brand = {
  name: 'آریاسنگ',
  latin: 'ARYASANG',
  tagline: 'سنگِ طبیعیِ لوکسِ ایران',
  established: '۱۳۸۳',
} as const

export const nav: NavItem[] = [
  { label: 'موجودیِ آنلاین', href: '#inventory' },
  {
    label: 'محصولات',
    href: '#products',
    children: [
      { label: 'مرمرها', href: '#products' },
      { label: 'اُنیکس و سنگ‌ها', href: '#products' },
      { label: 'موزاییک‌ها', href: '#products' },
      { label: 'فینیش‌ها', href: '#products' },
      { label: 'سنگ‌فرش و دکور', href: '#products' },
    ],
  },
  { label: 'دربارهٔ ما', href: '#about' },
  { label: 'نشانگاه‌ها', href: '#showrooms' },
  { label: 'پروژه‌ها', href: '#projects' },
  { label: 'فروشگاه', href: '#shop' },
]

export const menuPrimary: NavItem[] = [
  {
    label: 'موجودیِ آنلاین',
    href: '#inventory',
    image: '/v22/img/showroom-warehouse.webp',
  },
  {
    label: 'فروشگاهِ آنلاین',
    href: '#shop',
    image: '/v22/img/p-finitures.webp',
  },
  { label: 'صفحهٔ اصلی', href: '#top', image: '/v22/img/hero-calacatta.webp' },
  {
    label: 'دربارهٔ ما',
    href: '#about',
    image: '/v22/img/portrait-founder.webp',
  },
  {
    label: 'مواد و سنگ‌ها',
    href: '#products',
    image: '/v22/img/p-mosaics.webp',
  },
  { label: 'پروژه‌ها', href: '#projects', image: '/v22/img/quarry-01.webp' },
]

export const menuSecondary: NavItem[] = [
  { label: 'راهنمای نگهداری', href: '#blog' },
  { label: 'اخبار و دانستنی‌ها', href: '#blog' },
]

export const socials = [
  { label: 'اینستاگرام', href: '#instagram' },
  { label: 'تلگرام', href: '#telegram' },
  { label: 'یوتیوب', href: '#youtube' },
] as const

export const hero = {
  titleLines: ['سنگِ ما.', 'انتخابِ لوکسِ شما.', 'برتریِ ایرانی.'],
  cta: 'کاوشِ مواد و سنگ‌ها',
  quote:
    'لوکسِ واقعی هرگز آمادهٔ پوشیدن نیست؛ نمی‌تواند سری‌ساخته شود. لوکس، منحصربه‌فرد است، برای همان پروژهٔ خاص و همان شخص طراحی و اندازه‌گیری می‌شود، نیازمند چیره‌دستیِ بی‌نظیر است و از موادِ اولیهٔ استثنایی می‌سازد.',
  quoteAuthor: 'فرهاد میرزایی، بنیان‌گذارِ آریاسنگ',
  shortcuts: [
    { label: 'موجودیِ آنلاین', caption: 'کاوش', href: '#inventory' },
    { label: 'محصولات', caption: 'کاوش', href: '#products' },
    { label: 'نشانگاه‌ها', caption: 'کاوش', href: '#showrooms' },
  ] satisfies Shortcut[],
  slides: [
    {
      image: '/v22/img/hero-calacatta.webp',
      alt: 'مرمرِ کالاکاتای بوک‌مچ، آریاسنگ',
    },
    { image: '/v22/img/p-marbles.webp', alt: 'اسلبِ مرمرِ سفید، آریاسنگ' },
    {
      image: '/v22/img/texture-marble.webp',
      alt: 'بافتِ مرمرِ طبیعی، آریاسنگ',
    },
  ],
} as const

export const about = {
  eyebrow: 'آریاسنگ',
  body: 'آریاسنگ، شرکتِ ایرانیِ نمادِ سنگ‌های لوکسِ سراسرِ ایران است؛ متخصصِ تولید و فرآوریِ اسلب‌ها و بلوک‌های سنگِ طبیعی برای خلقِ پروژه‌های طراحیِ فوق‌لوکس. موادِ پیشرو، مرمرهای سفیدِ گران‌بها هستند — پیش از همه دهبید، صدرا و هرسین — که گسترده‌ترین انتخابِ آن‌ها را در اختیار داریم، و در کنارِ آن‌ها مرمرهای نامیِ دیگر، اُنیکس و سنگ‌های رنگارنگِ ایران، تا یکی از لوکس‌ترین مجموعه‌های سنگِ طبیعیِ کشور را پدید آوریم.',
  cta: 'دربارهٔ آریاسنگ',
  founderName: 'فرهاد میرزایی',
  founderRole: 'بنیان‌گذار و مدیرِ هنری',
  portrait: '/v22/img/portrait-founder.webp',
  quarryImages: [
    { image: '/v22/img/quarry-01.webp', alt: 'معدنِ مرمرِ دهبید، فارس' },
    { image: '/v22/img/quarry-02.webp', alt: 'معدنِ مرمرِ دهبید، فارس' },
  ],
} as const

export const products = {
  eyebrow: 'محصولات',
  titleLines: ['طبیعتِ زیباترین', 'شاهکارها را', 'برای ما می‌نقشد'],
  separator: 'آریاسنگ',
  items: [
    {
      id: 'onyx',
      name: 'اُنیکس و سنگ‌ها',
      image: '/v22/img/p-onyx.webp',
      href: '#products',
    },
    {
      id: 'marbles',
      name: 'مرمرها',
      image: '/v22/img/p-marbles.webp',
      href: '#products',
    },
    {
      id: 'mosaics',
      name: 'موزاییک‌ها',
      image: '/v22/img/p-mosaics.webp',
      href: '#products',
    },
    {
      id: 'furnishing',
      name: 'سنگ‌فرش و دکور',
      image: '/v22/img/p-furnishing.webp',
      href: '#products',
    },
    {
      id: 'finitures',
      name: 'فینیش‌ها',
      image: '/v22/img/p-finitures.webp',
      href: '#products',
    },
  ] satisfies ProductCategory[],
} as const

/* Upstream `section.cta-shortcuts` — two editorial CTAs above the footer. */
export const ctaShortcuts = [
  {
    tagline: 'اخبار',
    body: 'عضوِ خانوادهٔ آریاسنگ شوید و از تازه‌ترین گزیده‌های سنگ و پروژه‌ها آگاه شوید.',
    cta: 'بیشتر بخوانید',
    href: '#blog',
  },
  {
    tagline: 'کمکی لازم دارید؟',
    body: 'آنچه می‌جستید را نیافتید؟ کارشناسانِ ما شما را تا انتخابِ ماده همراهی می‌کنند.',
    cta: 'تماس با ما',
    href: '#contact',
  },
] as const

export const showrooms = {
  eyebrow: 'با ما در تماس باشید',
  title: 'نشانگاه‌های ما',
  breadcrumb: ['خانه', 'نشانگاه‌ها'],
  intro:
    'در نشانگاه‌های «بخشِ اسلب — اصفهان» و «مرمرِ پارس — تهران» می‌توانید گونه‌گونیِ باشگاهه از مرمرهای سفیدِ گران‌بها، اُنیکس‌های کمیاب و سنگ‌های طبیعیِ رنگارنگ را از نزدیک ببینید؛ زیباترین و اصیل‌ترین جلوه‌های زیباییِ طبیعیِ ایران. تمامِ مرمرهای نمایشی، در ایران فرآوری می‌شوند. فضاهای نمایش، کاملاً به‌اندیشهٔ مشتری طراحی شده‌اند و کلِّ مجموعه چینش شده است که بازدیدکنندهٔ گرامی به جهانِ زیباییِ طبیعی وارد شود و جادوی هر ماده را درک کند.',
  covers: {
    background: '/v22/img/hero-showroom.webp',
    tile: '/v22/img/texture-marble.webp',
    portrait: '/v22/img/showroom-warehouse.webp',
  },
  items: [
    {
      id: 'isfahan',
      name: 'آریاسنگ — بخشِ اسلب',
      role: 'اصفهان',
      address: 'شهرکِ صنعتیِ محمودآباد، خیابانِ سنگ‌کاران، پلاک ۲۴۴',
      phone: '۰۳۱ ۳۲۲۲۲۰۲۰',
      email: 'info@aryasang.ir',
      mapsLabel: 'مسیر در نقشه',
      mapsHref: '#map-isfahan',
    },
    {
      id: 'tehran',
      name: 'مرمرِ پارس — شعبهٔ تهران',
      role: 'تهران',
      address: 'بازارِ سنگِ شهرِ ری، خیابانِ داوران، پلاک ۱۲',
      phone: '۰۲۱ ۳۳۳۳۴۴۵۵',
      email: 'tehran@aryasang.ir',
      mapsLabel: 'مسیر در نقشه',
      mapsHref: '#map-tehran',
    },
  ] satisfies Showroom[],
} as const

export const blog = {
  eyebrow: 'تازه‌ترین نوشته‌ها',
  title: 'وبلاگِ ما',
  cta: 'همهٔ اخبار',
  /** Upstream `.marquee--container` `span[data-title]` on every tease cover. */
  readMore: 'بیشتر بخوانید',
  posts: [
    {
      id: 'dehbid',
      date: '۱۵ اردیبهشت ۱۴۰۳',
      title: 'دهبید — مرمرِ کارهای بزرگ',
      excerpt:
        'به زودی به آن دیوارهای سفید رسیدیم: نامش، نامِ خواهری‌ست که در آفتاب می‌درخشد. با سنگِ بومیِ این دیار، ابَرپروژه‌هایی خلق شد‌اند که قرن‌هاست می‌ایستند...',
      category: 'مرمر',
      image: '/v22/img/blog-dehbid.webp',
      href: '#blog',
    },
    {
      id: 'onyx',
      date: '۱۹ خرداد ۱۴۰۳',
      title: 'اُنیکس — یکی از شگفتی‌های جهان',
      excerpt:
        'اُنیکس یکی از شگفتی‌های جهان است. سنگی که نور را در خود جای می‌دهد و از درون می‌درخشد، تا دیواری از اُنیکس، پنجره‌ای رو به سوی نور گردد...',
      category: 'اُنیکس',
      image: '/v22/img/blog-onyx.webp',
      href: '#blog',
    },
    {
      id: 'harsin',
      date: '۱۲ مهر ۱۴۰۳',
      title: 'هرسین — کشفِ طلای سفیدِ زاگرس',
      excerpt:
        'مرمرِ هرسین یکی از محبوب‌ترین موادِ جهان است؛ همهٔ ویژگی‌هایی که در یک مرمرِ بی‌نقص جستجو می‌شود را دارد: بافتی همگن، سفیدیِ خالص و مقاومتی بی‌نظیر...',
      category: 'مرمر',
      image: '/v22/img/blog-lasa.webp',
      href: '#blog',
    },
  ] satisfies BlogPost[],
} as const

export const contact = {
  eyebrow: 'با ما در تماس باشید',
  title: 'ارتباط با ما',
  formTitle: 'فرم را پر کنید',
  fields: {
    firstname: 'نام',
    lastname: 'نامِ خانوادگی',
    email: 'ایمیل',
    phone: 'شمارهٔ تماس',
    subject: 'موضوع',
    message: 'پیام شما',
  },
  subjects: [
    'رزرو بازدید از نشانگاه',
    'درخواست پیش‌فاکتور',
    'اطلاعات و مشاوره',
  ],
  consent:
    'با آگاهی از سیاستِ حریمِ خصوصی و مادهٔ ۱۳ آیین‌نامهٔ اجراییِ قانونِ حفاظت از داده‌ها، اعلام می‌دارم که محتوای آن را خوانده و درک کرده‌ام.',
  submit: 'ارسال درخواست',
  ctaProjects: 'پروژه‌های ما را ببینید',
} as const

export const footer = {
  news: {
    title: 'اخبار',
    body: 'عضوِ خانوادهٔ آریاسنگ شوید.',
    cta: 'بیشتر بخوانید',
  },
  help: {
    title: 'کمکی لازم دارید؟',
    body: 'آنچه می‌جستید را نیافتید؟ با ما در تماس باشید.',
    cta: 'تماس با ما',
  },
  newsletter: {
    title: 'خبرنامه',
    label: 'ایمیل',
    cta: 'عضویت در خبرنامه',
    consent:
      'با آگاهی از سیاستِ حریمِ خصوصی، با عضویت در خبرنامه موافقت می‌کنم.',
  },
  columns: {
    contact: 'با ما در تماس باشید',
    info: 'اطلاعات',
    support: 'پشتیبانی',
    follow: 'ما را دنبال کنید',
  },
  infoLinks: [
    { label: 'انبارِ اسلب', href: '#inventory' },
    { label: 'نشانگاه‌ها', href: '#showrooms' },
  ],
  supportLinks: [
    { label: 'تماس با ما', href: '#contact' },
    { label: 'حریمِ خصوصی', href: '#privacy' },
  ],
  legal: 'تمامی حقوق محفوظ است © ۱۴۰۴ — آریاسنگ',
  vat: 'شمارهٔ ثبت ۱۰۳۸۰۴۵ — شناسهٔ ملی ۱۰۸۶۱۷۴۴۵۹۲',
  /** Upstream `footer` — a fixed-attachment cover behind the whole block. */
  cover: '/v22/img/texture-marble.webp',
} as const

/* ---------------------------------------------------------------
   Repository — the single seam to replace with Prisma later.
   For now it resolves synchronously from the mock objects above,
   shaped exactly like the eventual async DB queries will be.
   --------------------------------------------------------------- */
export const aryasangRepository = {
  listPosts: async (): Promise<BlogPost[]> => blog.posts,
  listShowrooms: async (): Promise<Showroom[]> => showrooms.items,
  listProducts: async (): Promise<ProductCategory[]> => products.items,
}
