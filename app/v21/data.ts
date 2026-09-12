export type Screening = {
  id: string;
  city: string;
  venue: string;
  date: string;
  time: string;
  status: 'upcoming' | 'past';
  detail: string;
};

export type CrewMember = {
  name: string;
  role: string;
  image: string;
  bio: string;
};

export type PressQuote = {
  outlet: string;
  author: string;
  text: string;
  link: string;
};

export type Statement = {
  heading: string;
  paragraph: string;
  link?: string;
  image: string;
};

export type MerchItem = {
  title: string;
  image: string;
};

export const film = {
  title: 'اتحاد',
  originalTitle: 'UNION',
  trailer: 'https://s3.amazonaws.com/webflow-prod-assets/686b9f10d392b2f22095f17c/697b49b16cb7401e9f495fa3_union-of-trailer.mp4',
  poster: '/union/poster.webp',
  duration: '۱۰۲ دقیقه',
  year: '۲۰۲۴',
};

// --- Awards / laurels (the original site uses 7 partner logos in the hero) ---
export const awards = [
  { sub: 'برنده جایزه ویژه هیئت داوران', label: 'ساندنس', year: '۲۰۲۴' },
  { sub: 'نمایش پیشنهادی', label: 'سینما حقیقت', year: '۲۰۲۴' },
  { sub: 'انتخاب رسمی جشنواره', label: 'هات داکس', year: '۲۰۲۴' },
  { sub: 'انتخاب رسمی جشنواره', label: 'شفیلد داک‌فست', year: '۲۰۲۴' },
  { sub: 'انتخاب رسمی جشنواره', label: 'ویژنز دو رئل', year: '۲۰۲۴' },
  { sub: 'نامزد بهترین مستند', label: 'پی‌بادی', year: '۲۰۲۴' },
  { sub: 'انتخاب رسمی', label: 'هیپنوتیک فست', year: '۲۰۲۴' },
];

// --- Screenings (upcoming + past) — Persian adaptation of the original US cities ---
export const screenings: Screening[] = [
  { id: 'tehran', city: 'تهران', venue: 'هنرمندان', date: '۲۴ آبان ۱۴۰۵', time: '۱۸:۳۰', status: 'upcoming', detail: 'نمایش فیلم و گفت‌وگو با عوامل' },
  { id: 'isfahan', city: 'اصفهان', venue: 'سینما سوره', date: '۲۸ آبان ۱۴۰۵', time: '۱۹:۰۰', status: 'upcoming', detail: 'نمایش ویژه با زیرنویس فارسی' },
  { id: 'shiraz', city: 'شیراز', venue: 'پردیس هنر شهر آفتاب', date: '۵ آذر ۱۴۰۵', time: '۱۸:۰۰', status: 'upcoming', detail: 'اکران و نشست سینمای مستند' },
  { id: 'mashhad', city: 'مشهد', venue: 'سینما هویزه', date: '۱۲ آذر ۱۴۰۵', time: '۲۰:۰۰', status: 'upcoming', detail: 'نمایش ویژه با بحث و گفت‌وگو' },
  { id: 'tabriz', city: 'تبریز', venue: 'پردیس سینمایی ۲۲ بهمن', date: '۲۰ آذر ۱۴۰۵', time: '۱۹:۰۰', status: 'upcoming', detail: 'نمایش با حضور منتقدان' },
  { id: 'rasht', city: 'رشت', venue: 'تماشاخانه هامون', date: '۱۵ مهر ۱۴۰۵', time: '۱۸:۳۰', status: 'past', detail: 'نمایش و گفت‌وگو با مخاطبان' },
  { id: 'mashhad-past', city: 'مشهد', venue: 'سینما هویزه', date: '۹ مهر ۱۴۰۵', time: '۱۹:۰۰', status: 'past', detail: 'نمایش ویژه سینمای مستند' },
  { id: 'ahvaz', city: 'اهواز', venue: 'پردیس سینمایی کیان', date: '۲ مهر ۱۴۰۵', time: '۱۸:۰۰', status: 'past', detail: 'نمایش با زیرنویس فارسی' },
  { id: 'kerman', city: 'کرمان', venue: 'سینما فرهنگ', date: '۲۵ شهریور ۱۴۰۵', time: '۲۰:۰۰', status: 'past', detail: 'نمایش و نشست' },
];

// --- Team: 8 cards like the original Embla slider. The extra 4 reuse stills as
//     placeholders for cinematographer, additional editor, composer. ---
export const team: CrewMember[] = [
  { name: 'استیون مِینگ', role: 'کارگردان، فیلم‌بردار، تدوینگر، تهیه‌کننده', image: '/union/team-1.webp', bio: 'استیون مینگ، مستندساز برنده جایزه امی، در آثارش به سراغ داستان‌های کمتر شنیده‌شده و تجربه‌های انسانی می‌رود. او در «اتحاد» مبارزه روزمره کارگران را از نزدیک و بی‌واسطه روایت می‌کند.' },
  { name: 'برت استوری', role: 'کارگردان، تهیه‌کننده', image: '/union/team-2.webp', bio: 'برت استوری فیلم‌ساز و نویسنده‌ای است که مرزهای سینمای مستند اجتماعی را گسترش می‌دهد. نگاه او به رابطه انسان، کار و جامعه، بخش مهمی از زبان تصویری این فیلم است.' },
  { name: 'مارس ورون', role: 'تهیه‌کننده', image: '/union/team-3.webp', bio: 'مارس ورون فیلم‌ساز، موسیقی‌دان و تهیه‌کننده است. او به روایت‌هایی باور دارد که تجربه جمعی انسان‌ها را به تصویر می‌کشند و فرصتی برای شنیدن صداهای تازه فراهم می‌کنند.' },
  { name: 'سامانتا کرلی', role: 'تهیه‌کننده', image: '/union/team-4.webp', bio: 'سامانتا کرلی تهیه‌کننده مستند و از بنیان‌گذاران مجموعه لول گراند است. او از هنرمندان مستقل و داستان‌هایی حمایت می‌کند که دریچه‌ای تازه به جهان پیرامون باز می‌کنند.' },
  { name: 'مارتین دی‌چیکو', role: 'فیلم‌بردار، تهیه‌کننده', image: '/union/still-1.webp', bio: 'مارتین دی‌چیکو فیلم‌بردار و کارگردانی است که با مستندسازان برجسته‌ای چون استیون مینگ و برت استوری همکاری کرده است.' },
  { name: 'بلر مک‌کلِندون', role: 'تدوینگر', image: '/union/still-2.webp', bio: 'بلر مک‌کلندون نویسنده و تدوینگر ساکن نیویورک است که آثارش در ساندنس، کن، تریبکا و تورنتو به نمایش درآمده است.' },
  { name: 'مالیکا زوحالی-وورال', role: 'تدوینگر', image: '/union/still-3.webp', bio: 'مالیکا زوحالی-وورال تدوینگر و کارگردان بریتانیایی-مراکشی است که برنده جایزه امی نیز بوده و در جشنواره‌های بزرگ جهانی حضور داشته است.' },
  { name: 'رابرت آیکی آبری لو', role: 'آهنگساز', image: '/union/still-4.webp', bio: 'رابرت آیکی آبری لو هنرمند و آهنگسازی است که با هنرمندانی چون نیا داکاستا و یانس فورد همکاری کرده و در چند سال اخیر بر ساخت موسیقی فیلم متمرکز شده است.' },
];

// --- Additional crew & executive producers — three dashed-border sections like
//     the original. ---
export const additionalCrew = [
  {
    id: 'exec',
    heading: 'تهیه‌کنندگان اجرایی',
    items: ['جنی راسکین', 'لورن هیبر', 'جرالین وایت درایفوس', 'خانواده ویلا', 'دیوید لوین', 'جسیکا گریمشاو', 'نیک شومیکر', 'دان اولمستد'],
  },
  {
    id: 'assoc',
    heading: 'تهیه‌کنندگان همکار',
    items: ['کلسی کونیگ', 'باربارا و اریک دابکین', 'پائولا فروله و استیو کوهن', 'ناتاشا و دیوید دالبی', 'مریل متنی', 'پیر هاسر', 'چلسی هالیگان', 'رایان پارکر', 'الکساندر کارپنتر', 'اندرو نیل'],
  },
  {
    id: 'coexec',
    heading: 'تهیه‌کنندگان اجرایی همکار',
    items: ['هانا الیاس', 'وایات وینبورن'],
  },
];

// --- Statements — four alternating dark items with images, mirroring the
//     original "statement-list" pattern (Bret Story, Stephen Maing, Producers,
//     Film team). ---
export const statements: Statement[] = [
  {
    heading: 'بیانیه تیم فیلم',
    paragraph: '«از اوج قدرت اتحادیه‌ها در دهه‌های ۱۹۵۰ و ۱۹۶۰، جهانی‌شدن و زوال صنعتی، جنبش کارگری آمریکا را به‌سوی افت شدید سوق داده است. هیچ شرکتی بهتر از آمازون نماد این دو روند یعنی ضداتحادی‌گری و جهانی‌سازی زنجیره تأمین نیست.»',
    link: 'بیشتر بخوانید',
    image: '/union/still-1.webp',
  },
  {
    heading: 'بیانیه برت استوری',
    paragraph: '«به‌عنوان فیلم‌سازی که در طبقه کارگر بزرگ شدم و مادرم و بسیاری از همسایه‌هایم را درگیر تلاش برای حقوق و شرایط کاری مناسب دیدم، از همان ابتدا با اهمیت سازمان‌دهی کارگری آشنا بودم. می‌دانم که جنبش اتحادیه‌ها دیگر در نیمه دوم قرن گذشته نیست.»',
    link: 'بیشتر بخوانید',
    image: '/union/still-2.webp',
  },
  {
    heading: 'بیانیه استیون مینگ',
    paragraph: '«ماهیت پنهان سرمایه‌داری همیشه به‌دنبال تضعیف تلاش‌های اتحادیه‌ای است، اما کارگران استیتن آیلند ثابت کردند که سازمان‌دهی ممکن است آشفته باشد، اما پیشرفت نتیجه باور هر فرد به قدرت صدا و زنده‌بودن اوست.»',
    link: 'بیشتر بخوانید',
    image: '/union/still-3.webp',
  },
  {
    heading: 'بیانیه تهیه‌کنندگان',
    paragraph: '«آمازون نمونه‌ای روشن از شرکت‌های بزرگ است که به‌بهای فوری سیاه‌پوستان و رنگین‌پوستان آمریکا رشد می‌کنند و در بلندمدت به زیان همه ما تمام می‌شود.»',
    link: 'بیشتر بخوانید',
    image: '/union/still-4.webp',
  },
];

// --- Press quotes — 8 Persian translations of the original critic reviews. ---
export const press: PressQuote[] = [
  { outlet: 'گاردین', author: 'بنجامین لی', text: '«رشد بی‌پایان امپراتوری آمازون به گسترشی فراتر از تصور و طبیعتاً به مشکلاتی فراتر از کنترل منجر شده است. مستند «اتحاد» داستان‌های مبارزانی را کنار هم قرار می‌دهد که با بی‌عدالتی‌ها مقابله می‌کنند.»', link: '#' },
  { outlet: 'فیلم استیج', author: 'ادوارد فرامکین', text: '«افزوده‌ای مهم به کانون سینمای کارگری؛ رویکردی صمیمی و شدید در موقعیت‌های شکننده برای مشاهده اینکه چگونه یک نهاد نه‌تنها مقامات رسمی، بلکه شهروندان را نیز تحت تأثیر قرار می‌دهد.»', link: '#' },
  { outlet: 'هالیوود ریپورتر', author: 'دنیل فینبرگ', text: '«با تکنیک‌های سینمای مستقیم، این مستند ما را به درون اتحادیه‌ای نوپا می‌برد و شکست و شادی تلاش برای کار درست در لحظه‌ای تاریخیِ ناممکن را به تصویر می‌کشد.»', link: '#' },
  { outlet: 'پلی‌لیست', author: 'وارن کنترل', text: '«بررسی‌ای خام از سازمان‌دهی کارگری در قدرتمندترین، خالص‌ترین و شکننده‌ترین حالت خود؛ مستند «اتحاد» بدون سانسور و بدون حفاظ، باید به‌عنوان الگویی آموزشی دیده شود.»', link: '#' },
  { outlet: 'ایندی‌وایر', author: 'دیوید ارلیش', text: '«سخت و گیرا؛ بااینکه فیلم ما را به خط مقدم می‌اندازد و به چشم‌انداز میدانی وفادار می‌ماند، داستان دیوود در برابر جالوت به‌طور طبیعی از دل تماشای رقابت ALU برای واقعی‌شدن بیرون می‌آید.»', link: '#' },
  { outlet: 'مووبل فست', author: 'استیون سایتو', text: '«نگاهی سنجیده به بازی‌های درونی و بحث‌هایی که در یک جنبش در برابر رقیبی نفوذناپذیر شکل می‌گیرد؛ تصاویری که مینگ و استوری ثبت می‌کنند، در کنار هم قدرتی عظیم دارند.»', link: '#' },
  { outlet: 'فیلم‌ساز مجله', author: 'ناتالیا کیوگان', text: '«هیجان‌انگیز؛ وقتی مینگ و استوری پشت لنز و در خط مقدم هستند، اعتبار خیابانی کافی برای جلب اعتماد شخصیت‌های محتاط به‌دست می‌آورند و به دنیای درونی آن‌ها دست می‌یابند.»', link: '#' },
  { outlet: 'ورایتی', author: 'گای لاج', text: '«فیلمی با نگاهی غنی از استوری و مینگ که کارگران خسته انبار آمازون در استیتن آیلند را دنبال می‌کند؛ روایتی از مقاومت، همراه با مخالفت همکاران و قدرتمندان.»', link: '#' },
];

// --- Merch — 3 cards like the original. ---
export const merch: MerchItem[] = [
  { title: 'صفحه وینیل', image: '/union/still-1.webp' },
  { title: 'پوستر فیلم', image: '/union/still-2.webp' },
  { title: 'پین‌های فیلم', image: '/union/still-3.webp' },
];

// --- Partners — 11 logos in dashed-border boxes, marquee rows. ---
export const partners = [
  'LEVEL GROUND',
  '+impact partners',
  'FIELD OF VISION',
  'SUNDANCE INSTITUTE',
  'FORD FOUNDATION',
  'JUST FILMS',
  'PERSPECTIVE FUND',
  'ANONYMOUS CONTENT',
  'ENTERPRISE DOC FUND',
  'LEVEL GROUND',
  '+impact partners',
];

// --- Footer ---
export const footerSocials = ['INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'TIK TOK', 'X'];
export const footerNav = ['TRAILER', 'ABOUT', 'TEAM', 'PARTNERS', 'PRESS', 'WATCH', 'MERCH', 'CONTACT'];
export const footerEmail = 'union@cineticmedia.org';

export const unionRepository = {
  async listScreenings(): Promise<Screening[]> { return screenings; },
  async findScreening(id: string): Promise<Screening | undefined> { return screenings.find(item => item.id === id); },
};