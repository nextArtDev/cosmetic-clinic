/**
 * /v10 content — the NERVANA storefront structure re-authored as a Persian
 * landing for an Obstetrician & Gynecologist (متخصص زنان و زایمان).
 * Slugs/ids stay latin (URLs, storage keys); every user-facing string is
 * Persian. Prices are Toman; money renders with Persian digits.
 */

const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
export const toFa = (input: string | number) =>
  String(input).replace(/\d/g, (d) => faDigits[Number(d)])

export const clinic = {
  name: 'دکتر مریم شریفی',
  short: 'دکتر شریفی',
  role: 'متخصص زنان، زایمان و نازایی',
  tagline: 'مراقبتی دلسوزانه برای هر مرحله از زندگی شما',
  wordmark: 'دکتر شریفی',
  phone: '۰۲۱-۲۶۷۴۵۸۹۰',
  phoneHref: 'tel:+982126745890',
  whatsapp: 'https://wa.me/989123456789',
  address: 'تهران، خیابان ولیعصر، بالاتر از پارک ساعی، برج پزشکان مهر، طبقه سوم',
}

export type Product = {
  id: string
  name: string
  variant: string
  price: number
  image: string
  color: string
}

/** سه بستهٔ خدمات — جای سه چسب درشت اصلی طرح. */
export const products: Product[] = [
  { id: 'visit-pack', name: 'ویزیت و مشاوره', variant: 'حضوری · تهران', price: 850000, image: '/v10/assets/productOne.8a92fdf2.webp', color: '#2f5978' },
  { id: 'pregnancy-pack', name: 'پیش از زایمان', variant: 'بسته‌ای · ۸ جلسه', price: 4600000, image: '/v10/assets/productTwo.f3c9b653.webp', color: '#c88a32' },
  { id: 'online-pack', name: 'مشاوره آنلاین', variant: 'تصویری · ۲۰ دقیقه', price: 490000, image: '/v10/assets/productThree.c6ba3955.webp', color: '#747c64' },
]

export type CartItem = { productId: string; quantity: number; subscription: boolean }
export type OrderItem = CartItem & { name: string; variant: string; price: number }

export const CART_COOKIE = 'v10_cart'
export const findProduct = (id: string) => products.find((product) => product.id === id)

/** پول همیشه به تومان و با ارقام فارسی نمایش داده می‌شود. */
export const formatMoney = (toman: number) => `${toFa(toman.toLocaleString('en-US'))} تومان`

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + (findProduct(item.productId)?.price ?? 0) * item.quantity, 0)

export const emailIsValid = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254

export function validateCart(value: unknown): CartItem[] | null {
  if (!Array.isArray(value) || value.length > 6) return null
  const items: CartItem[] = []
  const seen = new Set<string>()
  for (const item of value) {
    if (!item || typeof item !== 'object' || !findProduct(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20 || typeof item.subscription !== 'boolean') return null
    const key = `${item.productId}-${item.subscription}`
    if (seen.has(key)) return null
    seen.add(key)
    items.push({ productId: item.productId, quantity: item.quantity, subscription: item.subscription })
  }
  return items
}

/** سه قدم «چطور کار می‌کند» — به روایت ویزیت و بارداری. */
export const steps = [
  {
    title: 'گفت‌وگو، پیش از هر چیز',
    text: 'اولین قرار، فقط شنیدن است. تاریخچهٔ سلامت، نگرانی‌ها و انتظارات شما با دقت و بدون عجله مرور می‌شود تا مسیر مراقبت دقیقاً برای شرایط شما طراحی شود.',
    image: '/v10/assets/illustration-1.43f3fe6b.png',
  },
  {
    title: 'تشخیص دقیق با تجهیزات روز',
    text: 'سونوگرافی، آزمایش و غربالگری در همان مطب و با دستگاه‌های به‌روز؛ بدون معطلی و بدون ارجاع‌های تکراری. نتیجه همان جلسه با شما مرور می‌شود.',
    image: '/v10/assets/illustration-2.55fda3ef.png',
  },
  {
    title: 'همراهی تا پایان مسیر',
    text: 'از اولین سونوگرافی تا پس از زایمان، یک تیم ثابت کنار شماست. برنامهٔ زایمان، پاسخ به شبه‌ها و پیگیری دورهٔ نقاهت، همگی بخشی از همان قرارداد اول است.',
    image: '/v10/assets/illustration-3.0f9f4277.png',
  },
]

/** سه عکس پنل «موارد استفاده» — تصاویر اصلی طرح حفظ می‌شوند. */
export const useCases = [
  { name: 'مراقبت دوران بارداری', text: 'ویزیت‌های منظم، غربالگری و سونوگرافی طبق تقویم بارداری شما.' },
  { name: 'زایمان طبیعی', text: 'آمادگی بدن و ذهن برای زایمان طبیعی؛ تمرین تنفس و برنامهٔ زایمان.' },
  { name: 'پیشگیری از بارداری', text: 'مشاورهٔ کامل برای انتخاب روش پیشگیری متناسب با سبک زندگی شما.' },
  { name: 'سلامت زنان', text: 'معاینهٔ سالانه، پاپ‌اسمیر و بررسی هر تغییر غیرعادی، پیش از جدی شدن.' },
  { name: 'نازایی', text: 'ارجاع به تیم نازایی پس از ارزیابی اولیه و آزمایش‌های پایه.' },
  { name: 'یائسگی', text: 'مدیریت علائم یائسگی با برنامهٔ درمانی شخصی و کم‌دارو تا حد امکان.' },
  { name: 'زایمان بی‌درد', text: 'برنامهٔ تسکین درد حین زایمان، از اپی‌دورال تا روش‌های تنفسی.' },
  { name: 'پریناتال', text: 'ویتامین، تغذیه و سبک زندگی در ماه‌های پیش از بارداری.' },
  { name: 'پردرد زنان', text: 'کمردرد قاعدگی، درد لگن و سایر دردهای خاص زنان، جدی گرفته می‌شود.' },
]

export const usePhotos = [
  { image: 'panelOne.fe79dd24.webp', alt: 'دستانی مهربان روی شانه؛ آغاز گفت‌وگوی اولین ویزیت' },
  { image: 'panelTwo.ec8e3c0e.webp', alt: 'سونوگرافی و پیگیری بارداری در مطب' },
  { image: 'panelThree.b5135805.webp', alt: 'آرامش و مراقبت روزمره؛ همراهی تا پس از زایمان' },
]

export const reviews = [
  { name: 'نگار ک.', image: 'Carol.3e4a7a99.png', quote: 'دکتر شریفی در بارداری اولم تمام مسیر را قدم‌به‌قدم توضیح داد؛ هیچ سوالی بی‌جواب نماند. در روز زایمان هم آرامش او به من منتقل شد.' },
  { name: 'شیرین ا.', image: 'Sharon.371566bc.png', quote: 'بعد از سال‌ها کمردرد قاعدگی که همه می‌گفتند «عادیه»، علت دقیق پیدا شد و درمان شد. کاش زودتر رفته بودم.' },
  { name: 'ر. ج.', image: 'RJ.a7f07bac.png', quote: 'همه‌جا می‌گفتند نازایی من بی‌پاسخ است. اینجا با آرامش و صبر، مسیر را از نو ساختیم.' },
  { name: 'الهام پ.', image: 'Louis.c148d282.png', quote: 'دورهٔ یائسگی برای من سخت بود؛ اینجا فقط نسخه نمی‌دهند. گوش می‌دهند، برنامه می‌دهند و پیگیری می‌کنند.' },
]

export const faqs = [
  { question: 'اولین ویزیت چطور شروع می‌شود؟', answer: 'اولین جلسه فقط گفت‌وگو است؛ تاریخچهٔ سلامت شما و اگر باردار هستید، هفتهٔ فعلی بارداری مرور می‌شود. معاینه فقط با رضایت و در صورت نیاز انجام می‌شود.' },
  { question: 'برای ویزیت بارداری هر چند وقت یک‌بار باید بیایم؟', answer: 'تا هفتهٔ ۲۸ هر چهار هفته، تا هفتهٔ ۳۶ هر دو هفته و بعد از آن هفتگی. در بارداری‌های پرخطر این فاصله‌ها کوتاه‌تر می‌شود.' },
  { question: 'زایمان طبیعی یا سزارین؟ کدام برای من مناسب‌تر است؟', answer: 'هدف ما زایمان ایمن است، نه زایمان با یک روش خاص. بر اساس وضعیت شما و جنین، تازه‌ترین پروتکل‌ها را با شما مرور می‌کنیم و تصمیم مشترک می‌گیریم.' },
  { question: 'زایمان بدون درد در این مرکز امکان‌پذیر است؟', answer: 'بله؛ از اپی‌دورال تا روش‌های تنفسی و بی‌دردی‌های موضعی. برنامهٔ بی‌دردی شما پیش از موعد زایمان نوشته و در پرونده ثبت می‌شود.' },
  { question: 'برای مشاورهٔ آنلاین چه کارهایی از قبل لازم است؟', answer: 'فقط یک تلفن با دوربین و یک اینترنت معمولی. نتایج آزمایش یا سونوگرافی قبلی را از قبل بارگذاری می‌کنید تا جلسه کوتاه‌تر و دقیق‌تر باشد.' },
  { question: 'ویزیت آنلاین برای همهٔ موارد کافی است؟', answer: 'نه. برای معاینه، سونوگرافی و هر موضوعی که نیاز به دیدن دارد، ویزیت حضوری لازم است. در همان جلسهٔ آنلاین صادقانه می‌گوییم کجا حضوری بهتر است.' },
  { question: 'آیا ویزیت و مشاورهٔ نازایی هم انجام می‌شود؟', answer: 'بله؛ ارزیابی اولیهٔ زوج، آزمایش‌های پایه و تشخیص مسیر در همین مرکز انجام و در صورت نیاز به IVF، به تیم همکار ارجاع دقیق می‌دهید.' },
  { question: 'آزمایش‌ها و سونوگرافی را کجا باید انجام دهم؟', answer: 'سونوگرافی در همان مطب انجام می‌شود. برای آزمایش، از آزمایشگاه‌های معتبر اطراف قرار می‌گیرد و نتیجه‌ها پیش از جلسهٔ بعد در پرونده بررسی می‌شود.' },
  { question: 'هزینهٔ ویزیت چقدر است و بیمه پاسخ می‌شود؟', answer: 'تعرفهٔ هر نوع ویزیت در همین صفحه فهرست شده است. بیمه‌های پایه و تکمیلی اغلب بخشی از هزینه را پوشش می‌دهند؛ کارت بیمه را همراه بیاورید.' },
  { question: 'برای پاپ‌اسمیر و معاینهٔ سالانه چه زمانی مراجعه کنم؟', answer: 'بهترین زمان، یک هفته پس از پایان قاعدگی است. اگر یائسه هستید، هر زمانی که راحت‌ترید؛ همان جلسه وقت داده می‌شود.' },
  { question: 'اگر خونریزی یا درد شدید بیرون ساعات مطب شروع شود چه کنم؟', answer: 'در موارد اورژانسی (خونریزی شدید، درد شدید ناگهانی، تب در بارداری) مستقیم به اورژانس بروید. برای موارد فوری غیراورژانسی، شمارهٔ واتس‌اپ مطب پاسخ می‌دهد.' },
  { question: 'پرونده و نتیجهٔ آزمایش‌های من محرمانه می‌ماند؟', answer: 'کاملاً. پرونده فقط برای خودتان و در صورت ارجاع، برای پزشک موردنظر شما باز می‌شود. هیچ نتیجه‌ای بدون اجازهٔ شما به کسی داده نمی‌شود.' },
]

export const pressNames = [
  { file: 'Today.61ddd371.svg', name: 'Today', width: 70 },
  { file: 'BuzzFeed.079b1ba9.svg', name: 'BuzzFeed', width: 140 },
  { file: 'TNW.92b1e4bc.svg', name: 'The Next Web', width: 88 },
  { file: 'HuffPost.a1d83c24.svg', name: 'HuffPost', width: 142 },
]

/** اطلاعات حساس؛ صرفاً برای دموی فرانت‌اند. */
export const demoNote = 'نسخهٔ نمایشی · هیچ پرداختی دریافت نمی‌شود'
