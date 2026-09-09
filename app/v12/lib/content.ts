/**
 * /v12 content — the THE GRIND landing structure re-authored as a Persian
 * landing for a Sports Medicine specialist (متخصص طب ورزشی و توان‌بخشی).
 * Slugs/ids stay latin (URLs, storage keys); every user-facing string is
 * Persian. Numbers render with Persian digits. When v12 goes live, swap
 * strings/links from the CMS or Prisma.
 */

const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
export const toFa = (input: string | number) =>
  String(input).replace(/\d/g, (d) => faDigits[Number(d)])

export const doctor = {
  name: 'دکتر بهرام رستگار',
  short: 'دکتر رستگار',
  role: 'متخصص طب ورزشی و توان‌بخشی',
  tagline: 'بازگشت ایمن، سریع و علمی به اوجِ ورزشی',
  wordmark: 'دکتر رستگار',
  phone: '۰۲۱-۲۶۷۴۵۸۹۰',
  phoneHref: 'tel:+982126745890',
  address: 'تهران، خیابان ولیعصر، بالاتر از پارک ساعی، برج پزشکان مهر، طبقهٔ سوم',
  email: 'hello@rosteghar.example',
} as const

export const NAV_LINKS = [
  { label: 'درمان', href: '#treatment' },
  { label: 'توان‌بخشی', href: '#rehab' },
  { label: 'آزمایش‌ها', href: '#testing' },
  { label: 'نظر مراجعان', href: '#reviews' },
  { label: 'سؤالات', href: '#faq' },
] as const

/** Original CTA (#start) — the multi-step check form. */
export const BOOK_LINK = '#start'

export type TitleLine = { text: string; accent?: boolean; stroke?: boolean }

export const HERO = {
  badge: 'مراقبت ورزشی — علمی و فردی',
  title: [
    { text: 'تو در برابر' },
    { text: 'نسخهٔ دیروزِ', accent: true },
    { text: 'خودت', stroke: true },
  ] as TitleLine[],
  lead: 'تشخیص. درمان. توان‌بخشی. آماده‌سازی. یک برنامه، یک پزشک، یک تیم — و تویی که هر روز یک قدم برمی‌داری.',
  ctaPrimary: 'درخواست بررسی',
  ctaSecondaryLabel: 'برو به درمان',
  marqueeWords: ['تشخیص', 'درمان', 'توان‌بخشی', 'آماده‌سازی', 'تیم درمان', 'بازگشت'],
  // PLACEHOLDER (local project photo — Pexels unreachable from this
  // network). Original: https://images.pexels.com/photos/38453224/pexels-photo-38453224.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1400&w=1200
  image: '/images/doctors/2.jpeg',
  imageAlt: 'ورزشکار حین تمرین در سالن تاریک',
} as const

export const INTRO = {
  eyebrow: 'با یک پزشک که کنارت می‌ماند',
  paragraph:
    'بدون شعار، بدون میان‌بُر. مسیری برای بازگشت فیزیکی و ذهنی به ورزش — با پزشکی که کنارت می‌ایستد، تیمی که وضعیتت را می‌فهمد و برنامه‌ای که با زندگی خودت جور است. لازم نیست این مسیر را تنها طی کنی.',
  stats: [
    { to: 2100, suffix: '+', label: 'برنامهٔ تمرینی اصلاحی' },
    { to: 200, suffix: '+', label: 'ویدیوی آموزشی تمرین' },
    { to: 24, suffix: '/۷', label: 'در دسترس بودن تیم درمان' },
  ],
} as const

export type Feature = {
  id: string
  tag: string
  title: string[]
  body: string
  img: string
  alt: string
  points: string[]
}

export const FEATURES: Feature[] = [
  {
    id: 'treatment',
    tag: '۰۱ / درمان',
    title: ['درمانِ واقعی،', 'نه وعدهٔ توخالی'],
    body: 'فراتر از نسخه‌های عمومی. برنامهٔ درمانی تو هر روز با شرایط بدنی، هدف ورزشی و سبک زندگی خودت تنظیم و اصلاح می‌شود.',
    // PLACEHOLDER (local project photo). Original: https://images.pexels.com/photos/13951240/pexels-photo-13951240.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900
    img: '/images/doctors/1.jpeg',
    alt: 'پزشک ورزشی هنگام معاینه و راهنمایی ورزشکار',
    points: ['ویزیت اختصاصی', 'برنامهٔ شخصی‌سازی‌شده', 'پیگیری هفتگی'],
  },
  {
    id: 'rehab',
    tag: '۰۲ / توان‌بخشی',
    title: ['با هم قوی‌تر.', 'مردمی که می‌فهمند'],
    body: 'بیشتر از گروهی با هدف‌های مشابه؛ جایی که خودت باشی. به اشتراک‌گذاشتن موفقیت‌ها، پرسیدن سؤال‌ها، پیدا کردن انگیزه هر وقت لازم شد — و ساختن پیوند واقعی.',
    // PLACEHOLDER (local project photo). Original: https://images.pexels.com/photos/8692272/pexels-photo-8692272.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400
    img: '/images/doctors/3.jpg',
    alt: 'گروه ورزشکاران هنگام تمرین توان‌بخشی',
    points: ['پشتیبانی روزانه', 'جلسات دوره‌ای', 'پیوند واقعی'],
  },
  {
    id: 'testing',
    tag: '۰۳ / آزمایش‌ها',
    title: ['هر آنچه لازم داری،', 'در یک مجموعه'],
    body: 'ارزیابی‌های تخصصی، آزمون‌های عملکردی، برنامه‌های تمرینی شخصی و ماژول‌های آموزشی. هر جا که باشی: پزشک، برنامه و تیم درمان همراهت‌اند.',
    // PLACEHOLDER (local project photo). Original: https://images.pexels.com/photos/35540076/pexels-photo-35540076.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900
    img: '/images/doctors/4.jpeg',
    alt: 'ورزشکار در حال انجام آزمون‌های عملکردی',
    points: ['۲٫۱۰۰+ برنامهٔ تمرینی', '۲۰۰+ ویدیوی آموزشی', 'رهگیری پیشرفت'],
  },
]

export const FEATURES_HEADLINE = {
  eyebrow: 'چیزی که می‌گیری',
  lines: [
    { text: 'همهٔ چیزی که برای' },
    { text: 'رشد کردن', stroke: true },
    { text: 'لازم داری' },
  ] as TitleLine[],
} as const

export const MINDSET = {
  marqueeWords: ['رشد ذهنی', 'آرامش', 'مسیر', 'اعتمادبه‌نفس', 'نظم'],
  eyebrow: 'دکتر رستگار — طب ورزشی و رشد',
  title: [
    { text: 'آرامش، مسیر و' },
    { text: 'اعتمادبه‌نفس', accent: true },
  ] as TitleLine[],
  body: 'قوی‌شدن جسم مهم است، اما قوی‌شدن ذهن تفاوت را می‌سازد. با ماژول‌های آموزشی، جلسات آمادگی روانی و مشاورهٔ اختصاصی فقط بدن قوی‌تری نمی‌سازی — ذهن قوی‌تری هم می‌سازی.',
  cta: 'شروع مسیر رشد',
  // PLACEHOLDER (local project photo). Original: https://images.pexels.com/photos/38516877/pexels-photo-38516877.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=2000
  image: '/images/doctors/5.jpeg',
  imageAlt: 'سیلوئت ورزشکار در نور دراماتیک',
} as const

export type Review = {
  title: string
  body: string
  name: string
  result: string
}

export const REVIEWS: Review[] = [
  {
    title: 'بالاخره یک نظمی که ادامه‌اش می‌دهم',
    body: 'پزشکم واقعاً همراهم می‌کند و هر جا خودم نمی‌بینم، اصلاح می‌کند. حال بهتری دارم، آگاهانه‌تر تمرین می‌کنم و به‌جای حس‌با-حس، با برنامه جلو می‌روم.',
    name: 'سارا',
    result: '۶ ماه تحت درمان',
  },
  {
    title: 'در ۸ هفته احساسی کاملاً متفاوت',
    body: 'بدون انتظار خاصی شروع کردم و در دو ماه تقریباً ده کیلو اضافه وزن کم کردم. اما بزرگ‌ترین تفاوت در سرم بود: دیگر به اهدافم شک نمی‌کنم.',
    name: 'نیلوفر',
    result: '۱۰ کیلو کمتر در ۸ هفته',
  },
  {
    title: 'همراهیِ پزشک تفاوت را می‌سازد',
    body: 'برداشتن یک برنامه از اینترنت کار همه است. تفاوت وقتی است که کسی انگیزه‌ات را بالا نگه دارد وقتی کم می‌شود. به همین دلیل ادامه دادم — و الان نتیجه را می‌بینم.',
    name: 'امیر',
    result: 'آماده‌تر و قوی‌تر',
  },
  {
    title: 'خیلی بیشتر از فقط یک درمان',
    body: 'برنامه‌ها با شرایط بدنی من تنظیم شده، تمرین‌ها را همه‌جا می‌توانم انجام بدهم و در گفت‌وگو همیشه سریع جواب می‌گیرم. در یک ماه چهار کیلو کم کردم.',
    name: 'مریم',
    result: '۴ کیلو کمتر در ۱ ماه',
  },
  {
    title: 'ذهنم خیلی قوی‌تر شد',
    body: 'روش تمرینی کاملاً جدیدی یاد گرفتم و پشتکارم خیلی بیشتر شد. دویدن راحت‌تر شده و سرم آرام‌تر است.',
    name: 'کیان',
    result: 'آماده در ۸ هفته',
  },
  {
    title: 'جلسات آمادگی روانی طلا هستند',
    body: 'ماژول‌های آموزنده، تمرین‌های آرام‌بخش و تیمی که هر سؤالی را جواب می‌دهد. این یک برنامه نیست؛ یک سبک زندگی است.',
    name: 'زهرا',
    result: '۱ سال همراه',
  },
]

export const REVIEWS_HEADLINE = {
  eyebrow: 'تجربه‌ها',
  lines: [
    { text: 'حرف ما نیست؛' },
    { text: 'حرف', accent: true },
    { text: 'خودِ آن‌هاست', stroke: true },
  ] as TitleLine[],
  rating: '۸٫۵',
  ratingLabel: 'میانگین امتیاز مراجعان',
  dragHint: 'برای خواندن تجربه‌های بیشتر بکشید',
} as const

export const STORY = {
  // PLACEHOLDER (local project photo). Original: https://images.pexels.com/photos/32695885/pexels-photo-32695885.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800
  image: '/images/doctors/1.jpeg',
  imageAlt: 'دکتر رستگار در کلینیک طب ورزشی',
  badge: 'داستانِ پشتِ طب ورزشی رستگار',
  eyebrow: 'داستان پزشک',
  title: [
    { text: 'از گردابِ مصدومیت' },
    { text: 'تا آزادی', accent: true },
  ] as TitleLine[],
  intro:
    'همه‌چیز با یک پرسش ساده شروع شد که هر روز بلندتر می‌شد: من واقعاً می‌خواهم چه کسی باشم؟ نه روی کاغذ — واقعاً. و چرا احساس می‌کردم گیر کرده‌ام در حالی که توانِ بیشتری در من بود؟',
  full: [
    'در گردابِ مصدومیت و الگوهای تکراری و در سرِ خودم گیر کرده بودم. تا همان لحظه که تصمیم گرفتم: در همین مسیر نمی‌مانم. با برنامه‌های بزرگ شروع نکردم؛ با قدم‌های کوچک شروع کردم — حرکت‌کردن، تمرین‌کردن، هر روز انجام‌دادن کاری که لازم بود.',
    'قدم‌به‌قدم انرژی برگشت. نه میان‌بُر، نه مقایسه با دیگران. فقط ثبات. و در همین مسیر فهمیدم که بزرگ‌ترین مانع تقریباً همیشه خودت هستی — روتین‌هایت، بهانه‌هایت، تردیدت.',
    'ورزش برای من استعارهٔ زندگی شد: هر روز از نو حاضر شدن. این است «رستگار». و هر کس بر این مسیر مسلط شود، آزاد است. این را برای همه می‌خواهم — به همین دلیل این مجموعه ساخته شد.',
  ],
  readMore: 'کل داستان را بخوان',
  readLess: 'کمتر بخوان',
} as const

export const FAQS = [
  {
    q: 'طب ورزشیِ رستگار دقیقاً چیست؟',
    a: 'یک مجموعهٔ درمان و توان‌بخشی که کمک می‌کند از نظر جسمی، ذهنی و حرکتی رشد کنی. ویزیت اختصاصی پزشک ورزشی، آزمون‌های عملکردی، برنامهٔ تمرینی شخصی و جلسات دوره‌ای را با هم ترکیب می‌کنیم.',
  },
  {
    q: 'روند درمان چطور کار می‌کند؟',
    a: 'پس از ثبت‌نام با یک جلسهٔ دریافت کامل شروع می‌کنیم که در آن اهداف، سابقهٔ مصدومیت و چالش‌هایت را مرور می‌کنیم. سپس برنامهٔ درمانی و توان‌بخشی تو نوشته می‌شود، پیشرفتت رصد می‌شود و هر جا لازم باشد اصلاح می‌شود.',
  },
  {
    q: 'در این مجموعه چه خدماتی ارائه می‌شود؟',
    a: 'ویزیت و معاینهٔ تخصصی، آزمون‌های عملکردی و ارزیابی حرکتی، برنامهٔ تمرینی شخصی با ویدیوهای آموزشی، ماژول‌های آموزشی دربارهٔ ذهنیت و سبک زندگی، و همراهی پیوسته تا بازگشت کامل به ورزش.',
  },
  {
    q: 'هفته‌ای چقدر زمان لازم است؟',
    a: 'به هدفت بستگی دارد. به‌طور میانگین مراجعان دو تا پنج ساعت در هفته را برای تمرین، توان‌بخشی و آموزش کنار می‌گذارند. برنامه طوری چیده می‌شود که با زندگی واقعی تو جور باشد و پایدار بماند.',
  },
  {
    q: 'چه زمانی نتیجه را می‌بینم؟',
    a: 'از فرد به فرد فرق دارد. بیشتر مراجعان ظرف چند هفته نظم، انرژی و انگیزهٔ بیشتری احساس می‌کنند. نتایج جسمی و ذهنی قدم‌به‌قدم ساخته می‌شود — هدف تغییر پایدار است، نه درمان برق‌آسا.',
  },
  {
    q: 'می‌توانم اول بدون تعهد آشنا شوم؟',
    a: 'بله، همیشه. یک جلسهٔ آشنایی رایگان می‌گذاریم تا اهداف و شرایطت را مرور کنیم. از قبل دقیقاً می‌فهمی چه چیزی در انتظارت است و این مسیر برایت مناسب است یا نه.',
  },
] as const

export const FAQ_HEADLINE = {
  eyebrow: 'پرسش‌های پرتکرار',
  lines: [
    { text: 'همهٔ آنچه', stroke: true },
    { text: 'می‌خواهی', accent: true },
    { text: 'بدانی' },
  ] as TitleLine[],
} as const

export const LEAD_FORM = {
  headline: [
    { text: 'آمادهٔ تغییرِ' },
    { text: 'واقعی هستی؟', accent: true },
  ] as TitleLine[],
  sub: 'اولین قدم سخت‌ترین است — و در عین حال قدرتمندترین. بدون تعهد بررسی کن که مسیر درمان ما با اهداف تو می‌خواند یا نه.',
  steps: [
    {
      key: 'situation',
      question: 'الان بیشتر کدام حالت توصیفِ توست؟',
      options: [
        'گیر کرده‌ام در الگوهای همیشگی',
        'تمرین می‌کنم ولی نتیجه نمی‌گیرم',
        'انرژی و نظم ندارم',
        'می‌خواهم ذهنم قوی‌تر شود',
      ],
    },
    {
      key: 'goal',
      question: 'مهم‌ترین هدفت چیست؟',
      options: [
        'کاهش وزن و آمادگی بیشتر',
        'ساخت قدرت و عضله',
        'آرامش و اعتمادبه‌نفس بیشتر',
        'ادامهٔ یک سبک زندگی سالم',
      ],
    },
    {
      key: 'commitment',
      question: 'هفته‌ای چقدر زمان می‌توانی بگذاری؟',
      options: ['۱ تا ۲ ساعت', '۲ تا ۴ ساعت', '۴ تا ۶ ساعت', 'بیشتر از ۶ ساعت'],
    },
  ] as const,
  contactQuestion: 'بررسیِ تو را کجا بفرستیم؟',
  nameLabel: 'نام تو',
  emailLabel: 'ایمیل تو',
  submit: 'بررسیِ تطابق من',
  sending: 'در حال ارسال…',
  stepLabel: 'گام',
  back: '→ گام قبلی',
  successTitle: 'شروعِ خوبی بود',
  successBody: 'درخواستت رسید. تا ۲۴ ساعت آینده برای جلسهٔ آشناییِ رایگان با تو تماس می‌گیریم.',
  errors: {
    invalid: 'نام و یک ایمیل معتبر وارد کن.',
    generic: 'مشکلی پیش آمد. دوباره تلاش کن.',
  },
} as const

export type Answers = { situation: string; goal: string; commitment: string }

export const FOOTER = {
  marqueeCta: 'همین امروز شروع کن',
  tagline: 'تشخیص. درمان. توان‌بخشی. رشد. هر روز از نو — همراه تیمی که وضعیتت را می‌فهمد.',
  menuTitle: 'منو',
  followTitle: 'همراه ما باش',
  social: ['اینستاگرام', 'تلگرام', 'یوتیوب'],
  contactLabel: 'hello@rosteghar.example',
  copyright: '© {year} دکتر رستگار — نسخهٔ نمایشی',
  backToTop: 'بازگشت به بالا ↑',
} as const
