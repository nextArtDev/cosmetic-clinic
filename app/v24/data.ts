import type {
  ClinicSettings,
  Doctor,
  HomeContent,
  NavItem,
  Service,
  Testimonial,
  V24Repository,
} from './types';

/**
 * /v24 mock content — the fictional «کلینیک دندانپزشکی سپیدار» in Tehran.
 *
 * This is the only file to replace when the real backend arrives: implement
 * `V24Repository` against Prisma and swap the export. Nothing else in the route
 * knows where the data comes from — pages await the repository on the server
 * and hand plain values to the components.
 *
 * Images point at the mirrored reference assets in `public/v24/img`, so the
 * layout is byte-for-byte the reference's while the copy is the clinic's.
 */

const img = (file: string) => `/v24/img/${file}`;

const settings: ClinicSettings = {
  name: 'کلینیک دندانپزشکی سپیدار',
  tagline: 'درمان تخصصی دندان، بدون درد و بدون استرس',
  phone: '۰۲۱-۹۱۰۰۲۲۳۳',
  address: 'تهران، سعادت‌آباد، بلوار دریا، پلاک ۱۲۴، طبقه‌ی سوم',
  hours: 'شنبه تا پنج‌شنبه، ۹ تا ۲۱',
  instagram: 'sepidar.dental',
};

const navigation: NavItem[] = [
  { label: 'مزایا', href: '#ipon7iswy_0' },
  { label: 'سیستم هوشمند', href: '#i42v46q53_0' },
  { label: 'اپلیکیشن', href: '#ipjetsbot_0' },
  { label: 'راهنما', href: '#idz1fqixi_0' },
];

// Iranian names and specialties — the reference's own team block was a Russian
// clinic's roster, so none of it carries over except the section's shape.
const doctors: Doctor[] = [
  { name: 'دکتر سارا زبیری', role: 'متخصص ایمپلنت', focus: 'جراحی و کاشت' },
  { name: 'دکتر نگار موسوی', role: 'متخصص پروتز', focus: 'روکش و لمینت' },
  { name: 'دکتر داریوش رضایی', role: 'متخصص درمان ریشه', focus: 'اندودانتیکس' },
  { name: 'دکتر الناز بهرامی', role: 'متخصص دندانپزشکی کودکان', focus: 'کودکان' },
  { name: 'دکتر یلدا پورکاوه', role: 'متخصص لثه', focus: 'پریودانتیکس' },
  { name: 'دکتر نازنین لوکایی', role: 'متخصص ارتودنسی', focus: 'ارتودنسی ثابت و نامرئی' },
  { name: 'دکتر آناهیتا کاظمی', role: 'متخصص زیبایی', focus: 'طرح لبخند' },
  { name: 'دکتر آرش ایلخانی', role: 'متخصص تصویربرداری', focus: 'CBCT و رادیولوژی' },
  { name: 'دکتر مهسا منافی', role: 'دندانپزشک عمومی', focus: 'ترمیم و ترمیم همرنگ' },
  { name: 'دکتر کتایون مهدوی', role: 'متخصص بیهوشی', focus: 'بی‌هوشی و بی‌دردی' },
  { name: 'دکتر شیرین اورعی', role: 'مسئول کنترل عفونت', focus: 'استریلیزاسیون' },
];

const services: Service[] = [
  {
    slug: 'implant',
    name: 'ایمپلنت دندان',
    summary: 'جایگزینی دندان از دست‌رفته با فیکسچر تیتانیومی و روکش سرامیکی.',
    intro:
      'ایمپلنت، ریشه‌ی مصنوعی دندان است که در استخوان فک قرار می‌گیرد و پس از جوش خوردن، پایه‌ی یک دندان ثابت می‌شود. در کلینیک سپیدار همه‌ی مراحل با تصویربرداری سه‌بعدی و راهنمای جراحی دیجیتال برنامه‌ریزی می‌شود تا دقت جای‌گذاری بیشتر و دوره‌ی ترمیم کوتاه‌تر باشد.',
    duration: '۳ تا ۶ ماه',
    price: 'از ۱۸ میلیون تومان',
    image: img('pompa-g5gCtosP.jpg'),
    includes: [
      'تصویربرداری CBCT و طراحی دیجیتال',
      'جراحی با بی‌حسی موضعی و بی‌دردی کامل',
      'فیکسچر و روکش با ضمانت کتبی',
      'پیگیری سه‌ماهه پس از جراحی',
    ],
  },
  {
    slug: 'orthodontics',
    name: 'ارتودنسی',
    summary: 'مرتب‌سازی دندان‌ها با براکت ثابت یا پلاک‌های نامرئی شفاف.',
    intro:
      'ارتودنسی فقط مرتب‌کردن ظاهر دندان‌ها نیست؛ رابطه‌ی درست فک‌ها روی جویدن، تکلم و سلامت لثه هم اثر می‌گذارد. در نخستین جلسه، وضعیت دندان‌ها و فک‌ها بررسی و یک نقشه‌ی درمان شفاف با زمان‌بندی مشخص به شما ارائه می‌شود.',
    duration: '۱۲ تا ۲۴ ماه',
    price: 'از ۲۵ میلیون تومان',
    image: img('img_1-zCUYOpQ7.jpg'),
    includes: [
      'مشاوره‌ی تخصصی و ثبت پرونده‌ی تصویری',
      'انتخاب براکت فلزی، سرامیکی یا پلاک شفاف',
      'ویزیت‌های دوره‌ای ماهانه',
      'نگهدارنده پس از پایان درمان',
    ],
  },
  {
    slug: 'cosmetic',
    name: 'طرح لبخند و لمینت',
    summary: 'بازطراحی خط لبخند با لمینت سرامیکی و کامپوزیت.',
    intro:
      'طرح لبخند یک برنامه‌ی درمانی است که پیش از هر تراش، نتیجه را روی تصویر شما شبیه‌سازی می‌کند. شما پیش از شروع، ظاهر نهایی را می‌بینید و بعد تصمیم می‌گیرید — هیچ چیزی بدون تأیید شما تغییر نمی‌کند.',
    duration: '۲ تا ۴ جلسه',
    price: 'از ۳۲ میلیون تومان',
    image: img('img_2x-xQQYEHHl.jpg'),
    includes: [
      'عکس، اسکن و شبیه‌سازی دیجیتال لبخند',
      'لمینت سرامیکی یا کامپوزیت مستقیم',
      'تنظیم رنگ با بافت طبیعی دندان',
      'بازبینی نتیجه پس از یک ماه',
    ],
  },
  {
    slug: 'root-canal',
    name: 'درمان ریشه',
    summary: 'نجات دندان آسیب‌دیده با درمان کانال و بی‌دردی کامل.',
    intro:
      'وقتی پوسیدگی به عصب می‌رسد، درمان ریشه جایگزین کشیدن دندان است. با ابزارهای روتاری و دستگاه‌های اندازه‌گیری دقیق، درمان در یک یا دو جلسه و بدون درد انجام می‌شود.',
    duration: '۱ تا ۲ جلسه',
    price: 'از ۶ میلیون تومان',
    image: img('img_3-jJu6ub9E.jpg'),
    includes: [
      'بی‌حسی عمیق و کنترل درد در تمام مراحل',
      'تمیزکاری و پرکردن کانال با ابزار روتاری',
      'ترمیم نهایی با کامپوزیت یا روکش',
      'رادیوگرافی کنترل پس از درمان',
    ],
  },
  {
    slug: 'pediatric',
    name: 'دندانپزشکی کودکان',
    summary: 'فضایی آرام و بازیمحور برای نخستین تجربه‌ی دندانپزشکی کودک.',
    intro:
      'ترس از دندانپزشکی معمولاً در کودکی شکل می‌گیرد. تیم ما با زبان کودکانه، آشنایی تدریجی و بدون اجبار، جلسه‌ی اول را به یک تجربه‌ی عادی تبدیل می‌کند تا مراجعه‌های بعدی بدون مقاومت باشد.',
    duration: '۲۰ تا ۴۰ دقیقه',
    price: 'از ۲ میلیون تومان',
    image: img('scene-8_image-1-M4qDLhV9.jpg'),
    includes: [
      'جلسه‌ی آشنایی رایگان پیش از درمان',
      'فلورایدتراپی و فیشورسیلانت',
      'درمان زیر بی‌هوشی برای کودکان کم‌همکار',
      'آموزش بهداشت دهان به والدین',
    ],
  },
  {
    slug: 'whitening',
    name: 'سفیدکردن دندان',
    summary: 'روشن‌کردن درجه‌ی رنگ دندان با بلیچینگ در مطب یا در خانه.',
    intro:
      'سفیدکردن، رنگ دندان را روشن می‌کند و ساختار آن را تغییر نمی‌دهد. پیش از بلیچینگ، سلامت لثه و دندان‌ها بررسی می‌شود تا نتیجه یکدست و بدون حساسیت باشد.',
    duration: '۱ جلسه',
    price: 'از ۴ میلیون تومان',
    image: img('scene-8_image-2-uQRAhopC.jpg'),
    includes: [
      'بررسی و جرم‌گیری پیش از بلیچینگ',
      'بلیچینگ در مطب با نور آبی',
      'کیت خانگی برای تثبیت نتیجه',
      'دستورالعمل مراقبت پس از درمان',
    ],
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      'سال‌ها از صندلی دندانپزشکی می‌ترسیدم و هر جلسه را تا آخرین لحظه عقب می‌انداختم. اینجا بدون درد و استرس درمان شدم و حالا با خیال راحت لبخند می‌زنم',
    name: 'سارا محمدی',
    role: 'دانشجوی معماری',
  },
  {
    quote:
      'قبل از شروع، نتیجه‌ی نهایی را روی تصویر خودم دیدم و بعد تصمیم گرفتم. برای اولین بار حس کردم کنترل همه‌چیز دست خودم است، نه دست کسی که قرار است تراش کند.',
    name: 'امیر رضایی',
    role: 'برنامه‌نویس',
  },
  {
    quote:
      'دخترم هفت سالش است و جلسه‌ی اول را با بازی و بدون گریه گذراند. حالا خودش می‌پرسد کی دوباره می‌رویم دندانپزشکی',
    name: 'مریم حسینی',
    role: 'دبیر ریاضی',
  },
];

const home: HomeContent = {
  heroTitle: 'یک تجربه‌ی تازه از آرامش در درمان دندان',
  heroLead:
    'کلینیک سپیدار مسیر درمان شما را هوشمندانه برنامه‌ریزی می‌کند، تا بدون نگرانی، زندگی روزمره‌تان را ادامه دهید',
  stats: [
    {
      value: '۱۲',
      unit: 'هزار',
      title: 'بیش از ۱۲ هزار درمان موفق',
      description:
        'بیش از دوازده هزار درمان موفق در این کلینیک انجام شده و هر سال بر تجربه‌ی تیم ما افزوده می‌شود',
    },
    {
      value: '۹۸',
      unit: 'درصد',
      title: '۹۸٪ رضایت بیماران',
      description: 'بیماران ما کیفیت درمان و برخورد تیم را نمره‌ی نزدیک به صد داده‌اند',
    },
    {
      value: '۲۴',
      unit: 'ساعت',
      title: 'پاسخ‌گویی ۲۴ ساعته',
      description:
        'خط اورژانس و پشتیبانی درمانی ما شبانه‌روز در دسترس شماست، حتی پس از پایان درمان',
    },
  ],
  services,
  doctors,
  testimonials,
};

/**
 * Mock repository. Every method is async so the signatures already match a
 * database-backed implementation — swapping the body for a Prisma query is the
 * whole migration.
 */
export const mockRepository: V24Repository = {
  async getHome() {
    return home;
  },
  async listServices() {
    return services;
  },
  async getService(slug: string) {
    return services.find((s) => s.slug === slug) ?? null;
  },
  async listDoctors() {
    return doctors;
  },
  async getNavigation() {
    return navigation;
  },
  async getSettings() {
    return settings;
  },
};

export { services, doctors, testimonials, navigation, settings };
