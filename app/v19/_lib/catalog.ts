export type Category = 'all' | 'home' | 'office' | 'gift' | 'event';
export type Product = { id: string; name: string; subtitle: string; price: number; image: string; category: Category; stems: string; description: string };
export const categories: { id: Category; label: string; english: string; image: string }[] = [
  { id: 'home', label: 'برای خانه', english: 'For your home', image: '/flowers/home.webp' },
  { id: 'office', label: 'برای محل کار', english: 'For your space', image: '/flowers/office.webp' },
  { id: 'gift', label: 'برای یک عزیز', english: 'For someone special', image: '/flowers/gift.webp' },
  { id: 'event', label: 'برای لحظه‌های خاص', english: 'For your moments', image: '/flowers/event.webp' },
];
export const products: Product[] = [
 { id: 'calla', name: 'آرامِ سفید', subtitle: 'شیپوری سفید', price: 1850000, image: '/flowers/calla.webp', category: 'home', stems: '۷ شاخه شیپوری', description: 'فرمی ساده، حضوری عمیق. شیپوری‌های سفید با چیدمانی آزاد، برای گوشه‌ای از خانه که به کمی آرامش نیاز دارد.' },
 { id: 'tulip', name: 'صبحِ بهاری', subtitle: 'لاله سفید', price: 1450000, image: '/flowers/tulip.webp', category: 'gift', stems: '۱۵ شاخه لاله', description: 'لاله‌های تازه و لطیف، یادآور صبح‌های بهاری تهران. یک هدیه صمیمی، بی‌نیاز از مناسبت.' },
 { id: 'iris', name: 'بنفشِ خیال', subtitle: 'زنبق بنفش', price: 1250000, image: '/flowers/iris.webp', category: 'office', stems: '۱۰ شاخه زنبق', description: 'رنگی عمیق و شخصیتی مستقل. زنبق‌های بنفش برای جان بخشیدن به فضای کار و لحظه‌ای مکث در روز.' },
 { id: 'daisy', name: 'یک روزِ روشن', subtitle: 'بابونه باغی', price: 980000, image: '/flowers/daisy.webp', category: 'event', stems: '۲۰ شاخه بابونه', description: 'سادگی دوست‌داشتنی بابونه، برای دورهمی‌های کوچک و روزهایی که می‌خواهیم کمی زیباتر باشند.' },
];
export const money = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount);
export const persian = (value: number) => new Intl.NumberFormat('fa-IR').format(value);
// Replace this adapter with your own Prisma query; the UI contract stays unchanged.
export async function getCatalog(): Promise<Product[]> { return products; }
