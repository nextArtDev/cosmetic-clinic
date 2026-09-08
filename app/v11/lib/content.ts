/**
 * /v11 content — Iranized port of the ShowcaseMD landing copy for a
 * fictional Neurology clinic (کلینیک مغز و اعصاب دکتر آرمان صالحی،
 * تهران). The product concept (curated waiting-room screen content) is
 * rebranded as «مدنما». All copy is Persian with Persian digits; CTA
 * links point to the in-page demo form (#cta) instead of the original
 * Calendly URL. When this route becomes the real v11, swap strings/links
 * from the CMS or Prisma.
 */

export const BRAND = {
  name: 'مدنما',
  doctor: 'دکتر آرمان صالحی',
  specialty: 'متخصص مغز و اعصاب (نورولوژیست)',
} as const

export type RevealPart = {
  text: string
  className?: string
  /**
   * When set, the leading digits of `text` render as an animated
   * Persian count-up (reference site's "170+ projets" stat behavior);
   * the remainder (e.g. «٪») becomes the counter suffix.
   */
  count?: number
}

export const NAV_LINKS = [
  { label: 'چطور کار می‌کند', href: '#how-it-works', img: '/v11/img/menu/location.webp' },
  { label: 'مشکلاتی که حل می‌کنیم', href: '#solutions', img: '/v11/img/menu/comfort.webp' },
  { label: 'برندهای همکار', href: '#brands', img: '/v11/img/menu/default.avif' },
  { label: 'نظر مراجعان', href: '#reviews', img: '/v11/img/menu/technology.webp' },
]

/** Original site linked to Calendly; the mock routes to the in-page form. */
export const BOOK_LINK = '#cta'

export const HERO = {
  title: [
    { text: 'زمان انتظارِ' },
    { text: 'بیمار', className: 'h1-awesome' },
    { text: 'را به' },
    { text: 'نوبت', className: 'h1-awesome' },
    { text: 'تبدیل کنید', className: 'pink-wrap' },
  ] as RevealPart[],
  screenText: [
    { text: 'با پخش ویدیوهای منتخب از' },
    { text: 'خدمات شما', className: 'awesome-wrap-70' },
    { text: 'روی مانیتورهای اتاق انتظار،' },
    { text: 'گفت‌وگو و نوبت‌دهی', className: 'awesome-wrap-70' },
    { text: 'را در کلینیک خود بیشتر کنید' },
  ] as RevealPart[],
  /* Placeholder clip from the existing public assets — the real reel
     video replaces it when the route goes live. */
  video: '/v9/videos/care.mp4',
}

export const NUMBERS = {
  title: [
    { text: 'توانِ' },
    { text: 'مانیتورهای دیجیتال', className: 'h2-awesome' },
    { text: 'را در' },
    { text: 'کلینیک شما', className: 'h2-awesome' },
    { text: 'آزاد کنید' },
  ] as RevealPart[],
  items: [
    {
      icon: '/v11/img/icons/analytics.svg',
      heading: 'ویدیو، تصمیم بیمار را می‌سازد',
      description: [
        { text: '۸۷٪', className: 'semibold-wrap', count: 87 },
        { text: 'از مراجعان', className: 'semibold-wrap' },
        { text: 'پس از دیدن ویدیوی یک خدمت، با اطمینان بیشتری آن را انتخاب می‌کنند.' },
      ] as RevealPart[],
    },
    {
      icon: '/v11/img/icons/person-clock.svg',
      heading: 'یادگیری با ویدیو ۹ برابر بیشتر است',
      description: [
        { text: '۹۵٪', className: 'semibold-wrap', count: 95 },
        { text: 'از یک پیام', className: 'semibold-wrap' },
        { text: 'در قالب ویدیو در ذهن می‌ماند؛ در برابرِ' },
        { text: 'تنها', className: 'semibold-wrap' },
        { text: '۱۰٪', className: 'semibold-wrap', count: 10 },
        { text: 'در قالب متن.', className: 'semibold-wrap' },
      ] as RevealPart[],
    },
    {
      icon: '/v11/img/icons/people.svg',
      heading: 'بیمارانِ شما دنبال اطلاعات‌اند',
      description: [
        { text: '۶۱٪', className: 'semibold-wrap', count: 61 },
        { text: 'از مراجعان', className: 'semibold-wrap' },
        { text: 'همان لحظه‌ای که در کلینیک‌اند، دنبال شناختن خدمات بیشترند؛ اما تیمِ پرکار فرصت توضیح‌دادن ندارد.' },
      ] as RevealPart[],
    },
  ],
}

export const PRACTICE = {
  title: [
    { text: 'کلینیکِ شما' },
    { text: 'نقطهٔ تمرکز', className: 'h2-awesome' },
    { text: '+', className: 'pink-wrap' },
  ] as RevealPart[],
  description:
    'ما بهترین محتوایی که از خدمات شما ساخته‌اید — از نوار مغز (EEG) و نوار عصب‌و‌عضله (EMG/NCV) و کلینیک سردرد و صرع تا پیگیری سکتهٔ مغزی و اختلالات خواب — به یک پخش منظم تصویری با به‌روزرسانی لحظه‌ای تبدیل می‌کنیم؛ تا شما ستارهٔ کلینیک‌تان باشید، همان‌جا که بیمار بیش از هر جای دیگر باید ببیندتان.',
  image: '/v11/img/practice.avif',
}

export const STEPS = {
  title: [
    { text: 'وقت آن است که بدون حتی یک کلمه،' },
    { text: 'بیمار را غافلگیر و آگاه کنید', className: 'h2-awesome' },
  ] as RevealPart[],
  description:
    'وقتی بیمار تمام آنچه را که ارائه می‌دهید می‌بیند، شروع به پرسیدن می‌کند. با نمایش دامنهٔ کامل خدمات — از کلینیک میگرن و صرع و اختلالات خواب تا تشخیص و پیگیری سکتهٔ مغزی — از طریق یک روایت تصویری خوش‌ساخت روی مانیتورهای دیجیتال کلینیک، در بهترین لحظه با بیمار دیدار می‌کنید — همان لحظه‌ای که برای یادگیری آماده‌تر است. نتیجه؟ کنجکاوی بیشتر، گفت‌وگوی بیشتر با تیمتان و نوبت‌های ثبت‌شدهٔ بیشتر.',
  items: [
    'ورود به کلینیک',
    'محتوای اختصاصی شما',
    'معرفی خدمات',
    'قبل و بعدِ درمان',
    'سازوکار درمان',
    'روایت مراجعان',
    'غافلگیر و آگاه',
  ],
}

export const SOLUTIONS = {
  title: [
    { text: 'ما همان' },
    { text: 'یک راه‌حلیم', className: 'h2-awesome' },
  ] as RevealPart[],
  description:
    'زحمت جست‌وجو، تدوین، مدیریت، زمان و استرس را از دوش شما برمی‌داریم تا روی مهم‌ترین کار تمرکز کنید: مراقبت از سلامت مغز و اعصاب بیماران.',
  cards: [
    {
      problem: [
        { text: 'بیماران نمی‌دانند' },
        { text: 'چه خدماتی دارید', className: 'h3-awesome' },
      ] as RevealPart[],
      problemText:
        'بیمار بدون شناختن دامنهٔ کامل خدمات، مطب را ترک می‌کند و پتانسیل مراقبت‌تان هدر می‌رود.',
      solution: [
        { text: 'آموزش' },
        { text: 'بدون حرف‌زدن', className: 'h3-awesome' },
      ] as RevealPart[],
      solutionText:
        'ما روایتی تصویری از خدمات شما می‌سازیم — همان‌جا روی مانیتورهای مطب — تا بیمار پیش از رسیدن به اتاق ویزیت، خودش سؤالش را پیدا کند.',
    },
    {
      problem: [
        { text: 'محتوا زیاد است،' },
        { text: 'وقت کم', className: 'h3-awesome' },
      ] as RevealPart[],
      problemText:
        'غورکردن میان انبوه ویدیوها، کلیپ‌ها و پست‌های شبکه‌های اجتماعی ساعتی زمان می‌برد که شما ندارید.',
      solution: [
        { text: 'هوش مصنوعیِ ما' },
        { text: 'کارِ سنگین را می‌کند', className: 'h3-awesome' },
      ] as RevealPart[],
      solutionText:
        'سیستم ما به‌طور خودکار بهترین محتوای شما را پیدا، مرتب و در یک پخش یکپارچه و جذاب جمع می‌کند. بدون هیچ جست‌وجویی.',
    },
    {
      problem: [
        { text: 'شما' },
        { text: 'تدوینگر نیستید', className: 'h3-awesome' },
      ] as RevealPart[],
      problemText:
        'برای ساختنِ پخش ویدیویی به‌تنهایی باید طراحی، تدوین، قالب‌بندی و برندینگ را یاد بگیرید.',
      solution: [
        { text: 'کارِ خلاقانه' },
        { text: 'با ما', className: 'h3-awesome' },
      ] as RevealPart[],
      solutionText:
        'از تدوین تا موشن‌گرافیک، از برندینگ تا چیدمان — همه‌اش با ما. پخش شما حرفه‌ای، صیقلی و کاملاً هم‌سبک با برندتان می‌شود.',
    },
    {
      problem: [
        { text: 'وقتِ' },
        { text: 'ندارید', className: 'h3-awesome' },
      ] as RevealPart[],
      problemText:
        'شما و تیمتان آن‌قدر مشغولید که ساخت، مدیریت و به‌روزرسانی منظم مانیتورها ممکن نیست.',
      solution: [
        { text: 'یک‌بار تنظیم،' },
        { text: 'همیشه فعال', className: 'h3-awesome' },
      ] as RevealPart[],
      solutionText:
        'سرویس کانسیرج ما پخش شما را پشت صحنه انتخاب و به‌روز می‌کند. همه‌چیز کلیدخورده و آماده است — بدون درگیرکردن تیم شما.',
    },
    {
      problem: [
        { text: 'محتوا زود' },
        { text: 'کهنه می‌شود', className: 'h3-awesome' },
      ] as RevealPart[],
      problemText:
        'هر روز ویدیو و اطلاعیهٔ تازه‌ای ساخته می‌شود؛ اما به‌روزرسانی دستی، فرایندی کند و پرمشقت است.',
      solution: [
        { text: 'همیشه تازه،' },
        { text: 'همیشه به‌روز', className: 'h3-awesome' },
      ] as RevealPart[],
      solutionText:
        'با مدنما کلیپ تازه بارگذاری کنید — یا کار را به ما بسپارید. پخش شما (کامپایل تصویری الگوریتمی) همان لحظه با محتوایتان تغییر می‌کند.',
    },
    {
      problem: [
        { text: 'بیمار در مطب شما' },
        { text: 'باید راحت‌تر باشد', className: 'h3-awesome' },
        { text: '' },
      ] as RevealPart[],
      problemText:
        'مطب‌هایی که از ویدیو و ابزارهای دیجیتال مدرن استفاده می‌کنند، پیشرفته‌تر و قابل‌اعتمادتر به نظر می‌رسند.',
      solution: [
        { text: 'آموزش و' },
        { text: 'تحسین بیماران', className: 'h3-awesome' },
      ] as RevealPart[],
      solutionText:
        'مدنما تجربه‌ای مدرن و باکیفیت برای بیماران شما می‌سازد؛ تجربه‌ای که آموزش می‌دهد و مطب شما را از دیگران متمایز می‌کند.',
    },
  ],
}

export const BRANDS = {
  title: [
    { text: 'برندهای شما' },
    { text: 'روی مانیتورهای شما', className: 'h2-awesome' },
  ] as RevealPart[],
  description:
    'با معرفی بی‌وقفهٔ برندهای معتبر تجهیزات و مکمل‌های درمانی، سود مطب خود را بالا ببرید.',
  logos: [
    '/v11/img/brands/b01.avif',
    '/v11/img/brands/b02.svg',
    '/v11/img/brands/b03.svg',
    '/v11/img/brands/b04.svg',
    '/v11/img/brands/b05.svg',
    '/v11/img/brands/b06.svg',
    '/v11/img/brands/b07.svg',
    '/v11/img/brands/b08.avif',
    '/v11/img/brands/b09.avif',
    '/v11/img/brands/b10.avif',
    '/v11/img/brands/b11.avif',
    '/v11/img/brands/b12.avif',
    '/v11/img/brands/b13.avif',
  ],
}

export const REVIEWS = {
  title: [
    { text: 'مراجعانِ ما' },
    { text: 'چه می‌گویند', className: 'h2-awesome' },
  ] as RevealPart[],
  items: [
    {
      photo: '/v11/img/review-1.avif',
      name: 'دکتر شیدا کاظمی',
      role: 'کلینیک مغز و اعصاب، تهران',
      text: 'باورم نمی‌شد یک مانیتور در اتاق انتظار این‌قدر تأثیر بگذارد؛ اما واقعاً شده است. مراجعان به چیزی که پخش می‌شود دقت می‌کنند و خیلی‌ها دربارهٔ خدمات تشخیصی مثل نوار مغز و نوار عصب‌و‌عضله یا کلینیک سردرد که از وجودشان بی‌خبر بودند سؤال پرسیده‌اند. محتوا دقیقاً حس کلینیک خودمان را می‌دهد، نه یک تبلیغ کلی. صادقانه، ساده‌ترین ارتقایی بود که تاکنون برای کلینیکمان انجام داده‌ایم.',
    },
    {
      photo: '/v11/img/review-2.avif',
      name: 'دکتر امیر رستمی',
      role: 'مرکز تشخیصی نورولوژی و خواب، کرج',
      text: 'مدنما روند کار ما را واقعاً متحول کرد! این سامانه فرایندها را منظم می‌کند، آماده‌سازی بیمار برای ویزیت و نوارهای تشخیصی را بهتر می‌کند و کیفیت مراقبت را بالا می‌برد. رابط کاربری ساده است، قابلیت‌هایش دقیقاً پاسخ‌گوی نیاز یک کلینیک نورولوژی است و تیم پشتیبانی همیشه پاسخ‌گو و همراه است. به هر همکاری که دنبال ارتقای کلینیکش است، مدنما را بی‌قید و شرط پیشنهاد می‌کنم.',
    },
    {
      photo: '/v11/img/review-3.avif',
      name: 'مریم احمدی',
      role: 'مراجعِ کلینیک',
      text: 'اول فکر می‌کردم «خوب است داشته باشیم»، اما مدنما تأثیری غافلگیرکننده داشت. از وقتی نصب شده، داخل اتاق ویزیت دربارهٔ همان آزمایش‌ها و درمان‌هایی که روی مانیتور دیده‌ام سؤال می‌کنم؛ انگار یک آموزش‌دهندهٔ آرام در سالن انتظار نشسته — بدون هیچ زحمتی از طرف تیم، اما با نتیجهٔ واقعی. نصبش هم روان بود و تیم، همه‌چیز را ساده کرد.',
    },
  ],
}

export const CTA = {
  title: [
    { text: 'دموی رایگان رزرو کنید و' },
    { text: 'درآمد کلینیک‌تان را بالا ببرید', className: 'h2-awesome' },
  ] as RevealPart[],
}
