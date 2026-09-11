export type Screening = {
  id: string;
  city: string;
  venue: string;
  date: string;
  time: string;
  status: 'upcoming' | 'past';
  detail: string;
};

export const screenings: Screening[] = [
  { id: 'tehran', city: 'تهران', venue: 'خانه هنرمندان ایران', date: '۲۴ آبان ۱۴۰۵', time: '۱۸:۳۰', status: 'upcoming', detail: 'نمایش فیلم و گفت‌وگو با عوامل' },
  { id: 'isfahan', city: 'اصفهان', venue: 'سینما سوره', date: '۲۸ آبان ۱۴۰۵', time: '۱۹:۰۰', status: 'upcoming', detail: 'نمایش ویژه با زیرنویس فارسی' },
  { id: 'shiraz', city: 'شیراز', venue: 'پردیس سینمایی هنر شهر آفتاب', date: '۵ آذر ۱۴۰۵', time: '۱۸:۰۰', status: 'upcoming', detail: 'اکران و نشست سینمای مستند' },
  { id: 'rasht', city: 'رشت', venue: 'تماشاخانه هامون', date: '۱۵ مهر ۱۴۰۵', time: '۱۸:۳۰', status: 'past', detail: 'نمایش و گفت‌وگو با مخاطبان' },
  { id: 'mashhad', city: 'مشهد', venue: 'سینما هویزه', date: '۹ مهر ۱۴۰۵', time: '۱۹:۰۰', status: 'past', detail: 'نمایش ویژه سینمای مستند' },
];

export const team = [
  { name: 'استیون مِینگ', role: 'کارگردان و فیلم‌بردار', image: '/union/team-1.webp', bio: 'استیون مینگ، مستندساز برنده جایزه امی، در آثارش به سراغ داستان‌های کمتر شنیده‌شده و تجربه‌های انسانی می‌رود. او در «اتحاد» مبارزه روزمره کارگران را از نزدیک و بی‌واسطه روایت می‌کند.' },
  { name: 'برت استوری', role: 'کارگردان و تهیه‌کننده', image: '/union/team-2.webp', bio: 'برت استوری فیلم‌ساز و نویسنده‌ای است که مرزهای سینمای مستند اجتماعی را گسترش می‌دهد. نگاه او به رابطه انسان، کار و جامعه، بخش مهمی از زبان تصویری این فیلم است.' },
  { name: 'مارس ورون', role: 'تهیه‌کننده', image: '/union/team-3.webp', bio: 'مارس ورون فیلم‌ساز، موسیقی‌دان و تهیه‌کننده است. او به روایت‌هایی باور دارد که تجربه جمعی انسان‌ها را به تصویر می‌کشند و فرصتی برای شنیدن صداهای تازه فراهم می‌کنند.' },
  { name: 'سامانتا کرلی', role: 'تهیه‌کننده', image: '/union/team-4.webp', bio: 'سامانتا کرلی تهیه‌کننده مستند و از بنیان‌گذاران مجموعه لول گراند است. او از هنرمندان مستقل و داستان‌هایی حمایت می‌کند که دریچه‌ای تازه به جهان پیرامون باز می‌کنند.' },
];

export const film = {
  title: 'اتحاد',
  originalTitle: 'UNION',
  trailer: 'https://s3.amazonaws.com/webflow-prod-assets/686b9f10d392b2f22095f17c/697b49b16cb7401e9f495fa3_union-of-trailer.mp4',
  poster: '/union/poster.webp',
  duration: '۱۰۲ دقیقه',
  year: '۲۰۲۴',
};

// Replace this adapter with your own Prisma queries. No production database is used.
export const unionRepository = {
  async listScreenings(): Promise<Screening[]> { return screenings; },
  async findScreening(id: string): Promise<Screening | undefined> { return screenings.find(item => item.id === id); },
};
