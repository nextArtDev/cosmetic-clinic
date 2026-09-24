import type {
  GuideSummary,
  HomeEntry,
  ImageAsset,
  NavNode,
  ServiceEntry,
  Settings,
  SiteRepository,
} from './types';

/**
 * /v23 mock content — the Iranian re-authoring of jacques-cie.com.
 *
 * The reference is a French-Canadian dental clinic in Sainte-Foy, Québec. This
 * port keeps its information architecture exactly (hero + about + transition
 * banner + service list + guides, with the same nav tree and footer columns)
 * and rewrites every string as original Persian copy for a fictional Tehran
 * clinic. Nothing here is translated from the reference — the layout is the
 * thing being cloned, not the prose.
 *
 * Image assets are the reference's own photography, downloaded into
 * public/v23/img/ so the route is self-contained. `ratio` and `objectPosition`
 * are the real values the reference computes from each Craft asset's focal
 * point, which is why they look oddly precise — they are load-bearing.
 */

const IMG = '/v23/img';

const img = (
  src: string,
  width: number,
  height: number,
  alt: string,
  objectPosition = '50% 50%',
): ImageAsset => ({ src: `${IMG}/${src}`, width, height, alt, objectPosition });

/* ── photography ─────────────────────────────────────────────────────────── */

const P = {
  hero: img('Homepage-header.jpg', 2160, 1967, 'بیماران در حال لبخند در کلینیک دندانپزشکی دکتر پارسا', '28.63% 0.47%'),
  approche: img('Approche.jpg', 1200, 1950, 'فضای پذیرش کلینیک با نور طبیعی', '50% 50%'),
  transition: img('Transition.jpg', 2160, 1967, 'راهروی کلینیک', '73.55% 11.2%'),
  bureauSourire: img('Bureau-sourire.jpg', 1200, 1950, 'اتاق درمان و تجهیزات', '50% 50%'),
  bureauDivan: img('Bureau-divan.jpg', 1200, 1950, 'سالن انتظار کلینیک', '50% 50%'),
  bureauDuo: img('Bureau-duo.jpg', 480, 780, 'بیماران در سالن انتظار', '50% 50%'),
  paro: img('Services-paro.jpg', 1200, 1950, 'درمان لثه', '50% 50%'),
  chirurgie: img('Services-chirurgie.jpg', 1200, 1950, 'جراحی دهان', '23.28% 50.27%'),
  esthetique: img('Services-dts.jpg', 1200, 1950, 'دندانپزشکی زیبایی', '50% 50%'),
  implant: img('Guides-header.jpg', 1200, 1950, 'کاشت ایمپلنت', '39.29% 51.35%'),
  generale: img('Services-header.jpg', 1200, 1950, 'دندانپزشکی عمومی', '39.74% 35.92%'),
  guideBlanchiment: img('Services-general.jpg', 1200, 1950, 'سفید کردن دندان', '66.35% 13.05%'),
  guideGreffe: img(
    'LIBRE_Community_Agustin_Farias_Photos_ID6374.jpg',
    1200,
    1950,
    'گفتوگوی تیم درمان با بیمار',
    '50% 50%',
  ),
} satisfies Record<string, ImageAsset>;

/* ── links ───────────────────────────────────────────────────────────────── */

const APPOINTMENT = '#reserve';

const link = (value: string, label: string, internal = false) =>
  ({ type: internal ? 'entry' : 'url', value, label, internal }) as const;

/* ── services ────────────────────────────────────────────────────────────── */

const SERVICES: ServiceEntry[] = [
  { id: 's1', title: 'درمان لثه', slug: 'darman-lase', cardTitle: 'درمان لثه', image: P.paro },
  { id: 's2', title: 'جراحی دهان', slug: 'jarahi-dahan', cardTitle: 'جراحی دهان', image: P.chirurgie },
  {
    id: 's3',
    title: 'دندانپزشکی زیبایی',
    slug: 'zibayi',
    cardTitle: 'دندانپزشکی زیبایی',
    image: P.esthetique,
  },
  { id: 's4', title: 'ایمپلنت', slug: 'implant', cardTitle: 'ایمپلنت', image: P.implant },
  { id: 's5', title: 'دندانپزشکی عمومی', slug: 'omumi', cardTitle: 'دندانپزشکی عمومی', image: P.generale },
];

const GUIDES: GuideSummary[] = [
  {
    id: 'g1',
    title: 'سفید کردن دندان در خانه',
    slug: 'sepid-kardan-dandan',
    image: P.guideBlanchiment,
    relatedService: 'دندانپزشکی زیبایی',
  },
  {
    id: 'g2',
    title: 'پیوند لثه',
    slug: 'peyvand-lase',
    image: P.guideGreffe,
    relatedService: 'درمان لثه',
  },
];

/* ── navigation ──────────────────────────────────────────────────────────── */

const NAV: NavNode[] = [
  {
    id: 'n1',
    label: 'خدمات',
    href: '#services',
    children: SERVICES.map((s) => ({
      id: `n1-${s.id}`,
      label: s.title,
      href: `#services-${s.slug}`,
      children: [],
    })),
  },
  { id: 'n2', label: 'راهنمای بیمار', href: '#guides', children: [] },
  { id: 'n3', label: 'پزشکان ما', href: '#team', children: [] },
  { id: 'n4', label: 'درباره ما', href: '#about', children: [] },
  { id: 'n5', label: 'تیم ما', href: '#team', children: [] },
  { id: 'n6', label: 'فرصتهای شغلی', href: '#careers', children: [] },
  { id: 'n7', label: 'تماس با ما', href: '#contact', children: [] },
];

/* ── settings ────────────────────────────────────────────────────────────── */

const SETTINGS: Settings = {
  siteName: 'کلینیک دندانپزشکی و ایمپلنت دکتر پارسا و همکاران',
  logoLines: ['دکتر پارسا و همکاران', 'کلینیک دندانپزشکی', '+ ایمپلنت'],
  particulars: {
    addresses: [
      {
        label: 'کلینیک',
        streetNumber: 'پلاک ۲۷۳۹، طبقه ۲',
        streetName: 'خیابان ولیعصر، بالاتر از پارک ساعی',
        city: 'تهران',
        provinceState: '(تهران)',
        country: 'ایران',
        postalCode: '۱۹۶۷۸-۵۳۴۱۱',
      },
    ],
    email: 'info@parsa-dental.ir',
    phone: '۰۲۱ ۸۸۷۷ ۶۶۵۵',
    fax: '۰۲۱ ۸۸۷۷ ۱۴۳۷',
  },
  socials: [
    { label: 'اینستاگرام', href: 'https://instagram.com/', icon: 'instagram' },
    { label: 'فیسبوک', href: 'https://facebook.com/', icon: 'facebook' },
  ],
  appointment: link(APPOINTMENT, 'رزرو نوبت'),
  newsletter: { label: 'خبرنامه', href: '#newsletter', buttonLabel: 'عضویت' },
  footerImage: P.bureauDuo,
  legal: [{ id: 'l1', label: 'سیاست حفظ حریم خصوصی', href: '#privacy', children: [] }],
};

/* ── home ────────────────────────────────────────────────────────────────── */

const HOME: HomeEntry = {
  heading: 'درمان دندانپزشکی، برای همه',
  a11yHeading: 'کلینیک دندانپزشکی دکتر پارسا و همکاران: درمان دندانپزشکی برای همه',
  description:
    'درمان‌های شخصی‌سازی‌شده‌ی دندانپزشکی، با تکیه بر فناوری پیشرفته. هر مراجعه، خدمتی دقیق و توأم با توجه است؛ برای بهبود سلامت و زیبایی لبخند شما.',
  buttonLink: link(APPOINTMENT, 'رزرو نوبت'),
  heroImage: P.hero,
  sections: [
    {
      id: 'sec1',
      typeHandle: 'BlockSection',
      blocks: [
        {
          typeHandle: 'BlockTextImage',
          id: 'b1',
          surtitle: 'درباره ما',
          heading:
            'رویکردی شخصی‌سازی‌شده که در آن دقت فنی با آسایش و سلامت دندان هر بیمار گره می‌خورد',
          description:
            'هر مراجعه، تلفیقی از تخصص پزشکی و توجهی صمیمانه است تا سلامت و زیبایی لبخند شما بهتر از پیش شود.',
          buttonLink: link('#about', 'بیشتر بدانید', true),
          image: P.approche,
        },
        {
          typeHandle: 'BlockImageBanner',
          id: 'b2',
          backgroundImage: P.transition,
          image2: P.bureauSourire,
          image3: P.bureauDivan,
        },
        {
          typeHandle: 'BlockServiceList',
          id: 'b3',
          surtitle: 'خدمات',
          heading: 'درمانی استثنایی برای هر لبخند',
          description:
            'ما مجموعه‌ای کامل از خدمات پیشرفته‌ی دندانپزشکی ارائه می‌دهیم؛ جایی که تخصص پزشکی و فناوری‌های نوین، در خدمت سلامت دهان و دندان شما قرار می‌گیرد.',
          buttonLink: link('#services', 'مشاهده همه', true),
        },
        {
          typeHandle: 'BlockPushGuides',
          id: 'b4',
          surtitle: 'راهنمای بیمار',
          heading: 'توصیه‌های کاربردی ما',
          buttonLink: link('#guides', 'مشاهده همه', true),
          guides: GUIDES,
        },
      ],
    },
  ],
};

/** The three drifting labels the hero and the transition banner share. */
export const WORDS = ['درمان', 'دقت', 'لبخند'] as const;

/* ── the repository ──────────────────────────────────────────────────────── */

/**
 * Static mock implementation. Swap this for a Prisma-backed object and the
 * route needs no other change — every component reads through this interface.
 *
 * (The reference fetches all of this from a Craft CMS GraphQL endpoint; the
 * shape of the values above is deliberately the shape that endpoint returns.)
 */
export const mockRepository: SiteRepository = {
  async getHome() {
    return HOME;
  },
  async getSettings() {
    return SETTINGS;
  },
  async getNavigation() {
    return NAV;
  },
  async listServices() {
    return SERVICES;
  },
  async listGuides() {
    return GUIDES;
  },
};
