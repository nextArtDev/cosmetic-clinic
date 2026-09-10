const CDN = 'https://cdn.prod.website-files.com/6228683f9e6089f907efbb0a'

/**
 * Assets from the original thegrind.nl (Maciej Maćkowiak) Webflow CDN,
 * reused verbatim — this is a design recreation, so the photography stays
 * the original's until real assets exist. Swap these URLs (and the alt
 * texts in the components) when the route goes live with its own media.
 */
export const IMG = {
  heroBack: `${CDN}/6228683f9e608941adefbb8c_hero-photo.webp`,
  heroFront: `${CDN}/6248b10be64f482d5572fa16_hero-photo2.webp`,
  world: `${CDN}/6228683f9e60893c19efbb63_world.svg`,
  forest: `${CDN}/6228683f9e6089036cefbb89_photo_-5.jpg`,
  forestSet: `${CDN}/6228683f9e6089036cefbb89_photo_-5-p-500.webp 500w, ${CDN}/6228683f9e6089036cefbb89_photo_-5-p-800.webp 800w, ${CDN}/6228683f9e6089036cefbb89_photo_-5.jpg 2560w`,
  newsletter: `${CDN}/687145020f694f414de9c46f_home-mailing.webp`,
  faktura: `${CDN}/6228683f9e6089702defbb88_faktura.jpg`,
  fakturaSet: `${CDN}/6228683f9e6089702defbb88_faktura-p-500.webp 500w, ${CDN}/6228683f9e6089702defbb88_faktura-p-800.jpeg 800w, ${CDN}/6228683f9e6089702defbb88_faktura.jpg 845w`,
  headshot: `${CDN}/6228683f9e60898bd5efbb7c_maicej-mackowiak-headshot.jpg`,
  sciezka: `${CDN}/6228683f9e6089643eefbb74_sciezka-w-lesie.jpg`,
  bigLas: `${CDN}/6228683f9e6089f733efbb69_big-las.jpg`,
  bigLasSet: `${CDN}/6228683f9e6089f733efbb69_big-las-p-500.webp 500w, ${CDN}/6228683f9e6089f733efbb69_big-las.jpg 1832w`,
  wydma: `${CDN}/6228683f9e6089376aefbb47_wydma.jpg`,
  wchodzenie: `${CDN}/6228683f9e60896389efbb77_wchodzenie-na-wydme.jpg`,
  chapter3: `${CDN}/6228683f9e608927d1efbb79_hero-chapter-3.jpg`,
  chapter3Set: `${CDN}/6228683f9e608927d1efbb79_hero-chapter-3-p-500.webp 500w, ${CDN}/6228683f9e608927d1efbb79_hero-chapter-3-p-1080.webp 1080w, ${CDN}/6228683f9e608927d1efbb79_hero-chapter-3-p-1600.webp 1600w, ${CDN}/6228683f9e608927d1efbb79_hero-chapter-3-p-2000.webp 2000w, ${CDN}/6228683f9e608927d1efbb79_hero-chapter-3.jpg 2550w`,
  backshot: `${CDN}/6228683f9e60892030efbb8d_backshot.jpg`,
  backshotSet: `${CDN}/6228683f9e60892030efbb8d_backshot-p-500.webp 500w, ${CDN}/6228683f9e60892030efbb8d_backshot-p-800.webp 800w, ${CDN}/6228683f9e60892030efbb8d_backshot.jpg 1110w`,
  chapt3Headshot: `${CDN}/6228683f9e6089661cefbb86_chapt3-headshot.jpg`,
}

/**
 * Booking and social targets are mock placeholders for now — when this
 * route goes live, point `booking` at the clinic's real booking flow (e.g.
 * the production /booking route or a دکتردکتر/پذیرش۲۴ profile) and swap the
 * social handles.
 */
export const LINKS = {
  booking: '/v14/tamas',
  bookingPlain: '/v14/tamas',
  instagram: 'https://www.instagram.com/',
  telegram: 'https://t.me/',
  youtube: 'https://www.youtube.com/',
  linkedin: 'https://www.linkedin.com/',
  photographer: 'https://www.instagram.com/',
  studio: '',
}

export const NAV_ITEMS = [
  { label: 'درمان', href: '/v14/darman' },
  { label: 'درباره من', href: '/v14/darbare-man' },
  { label: 'تماس', href: '/v14/tamas' },
]

/** Desktop horizontal track length (vw) — mirrors `.track{height:1368vw}` */
export const TRACK_VW = 1368
