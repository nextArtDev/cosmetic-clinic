export type Residence = {
  id: string; title: string; english: string; location: string; category: string;
  image: string; gallery: string[]; area: string; bedrooms: string; description: string; features: string[];
};

export const residences: Residence[] = [
  { id: 'elahieh', title: 'رزیدنس الهیه', english: 'ELAHIEH RESIDENCES', location: 'تهران، الهیه', category: 'پنت‌هاوس‌های آسمانی', image: '/privy/images/penthouse.webp', gallery: ['/privy/images/penthouse.webp', '/privy/images/interior.webp'], area: '۶۸۰', bedrooms: '۴', description: 'بر فراز شهر، جایی که چشم‌انداز البرز با آرامش خانه پیوند می‌خورد. پنت‌هاوس‌هایی با تراس‌های گسترده، نور بی‌پایان و جزئیاتی که برای شما ساخته شده‌اند.', features: ['آسانسور و ورودی اختصاصی', 'تراس با چشم‌انداز البرز', 'خدمات کانسیرج شبانه‌روزی', 'استخر و سالن تندرستی'] },
  { id: 'lavasan', title: 'ویلاهای لواسان', english: 'LAVASAN PRIVATE VILLAS', location: 'لواسان، دامنه‌های البرز', category: 'خلوتی در دل طبیعت', image: '/privy/images/villa.jpg', gallery: ['/privy/images/villa.jpg', '/privy/images/interior.webp'], area: '۱٬۲۰۰', bedrooms: '۵', description: 'خانه‌ای در آغوش کوهستان؛ با باغی خصوصی و معماری‌ای که مرز میان فضای درون و طبیعت را محو می‌کند. فرصتی برای آرام‌تر زیستن، تنها چند قدم دورتر از هیاهو.', features: ['باغ و استخر اختصاصی', 'محوطهٔ سبز یکپارچه', 'سینمای خصوصی', 'سوئیت مستقل مهمان'] },
  { id: 'caspian', title: 'ساحل‌نشین خزر', english: 'CASPIAN SIGNATURE HOMES', location: 'مازندران، نوشهر', category: 'زندگی در امتداد دریا', image: '/privy/images/caspian.webp', gallery: ['/privy/images/caspian.webp', '/privy/images/interior.webp'], area: '۸۵۰', bedrooms: '۴', description: 'صبح با صدای موج آغاز می‌شود و عصر با رنگ‌های بی‌انتهای افق. مجموعه‌ای محدود از خانه‌های ساحلی، برای تجربهٔ آرامشی که فقط در کنار دریا پیدا می‌شود.', features: ['دسترسی اختصاصی به ساحل', 'تراس رو به دریا', 'کلاب اختصاصی ساکنان', 'خدمات نگهداری اقامتگاه'] },
];

export const tenets = [
  { title: 'نشانی‌های ماندگار', english: 'ICONIC ADDRESSES', text: 'از اصیل‌ترین محله‌های تهران تا آرام‌ترین چشم‌اندازهای شمال؛ هر نشانی با وسواس انتخاب شده است. جایگاهی که فقط یک موقعیت جغرافیایی نیست، بلکه بخشی از هویت شماست.' },
  { title: 'ظرافت، بدون مصالحه', english: 'UNCOMPROMISING FINESSE', text: 'سنگ‌های دست‌چین، چوب طبیعی و تناسباتی بی‌نقص. ما زیبایی را در جزئیاتی می‌بینیم که شاید به چشم نیایند، اما هر روز احساس می‌شوند.' },
  { title: 'امکاناتی فراتر از انتظار', english: 'EXCLUSIVE AMENITIES', text: 'از خدمات اختصاصی مهمان تا فضاهای تندرستی و استخر خصوصی؛ هر امکان، امتدادی از سبک زندگی منحصربه‌فرد شماست.' },
  { title: 'حریم شخصی، به معنای واقعی', english: 'EXTRAORDINARY PRIVACY', text: 'ورودی‌های مستقل، طبقات اختصاصی و مجموعه‌هایی با تعداد محدود اقامتگاه. دنیای شما، تنها متعلق به شما می‌ماند.' },
];

export const navigation = [
  { id: 'about', title: 'داستان پریوی', en: 'OUR STORY' },
  { id: 'collection', title: 'مجموعهٔ منتخب', en: 'THE COLLECTION' },
  { id: 'tenets', title: 'اصول بی‌همتایی', en: 'OUR TENETS' },
  { id: 'locations', title: 'نشانی‌ها', en: 'THE ADDRESSES' },
  { id: 'contact', title: 'آغاز یک آشنایی', en: 'GET IN TOUCH' },
];
