/**
 * /v23 content model.
 *
 * These types mirror the reference site's own Craft CMS GraphQL shape
 * (`EntryHomeQuery`, `GlobalNavigationsQuery`, `GlobalSettingsQuery`) so that
 * swapping the mock repository for a Prisma-backed one is a matter of
 * implementing the same interface — no component changes required.
 *
 * The reference's Neo field is a list of *blocks* inside *sections*; the home
 * page happens to use a single section holding four blocks. Only the block
 * types the port actually renders are modelled; the rest are dropped rather
 * than stubbed, so the union stays honest about what the UI supports.
 */

export type LinkData = {
  /** 'url' opens the href directly, 'entry' is an internal route. */
  type: 'url' | 'entry';
  value: string;
  label: string;
  /** Present when type === 'entry'. */
  internal?: boolean;
};

export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** CSS `object-position`; the reference exposes this as a Craft focal point. */
  objectPosition: string;
};

/* ── blocks ──────────────────────────────────────────────────────────────── */

export type BlockTextImage = {
  typeHandle: 'BlockTextImage';
  id: string;
  surtitle: string;
  heading: string;
  description: string;
  buttonLink: LinkData;
  image: ImageAsset;
};

export type BlockImageBanner = {
  typeHandle: 'BlockImageBanner';
  id: string;
  backgroundImage: ImageAsset;
  image2: ImageAsset;
  image3: ImageAsset;
};

export type BlockServiceList = {
  typeHandle: 'BlockServiceList';
  id: string;
  surtitle: string;
  heading: string;
  description: string;
  buttonLink: LinkData;
};

export type BlockPushGuides = {
  typeHandle: 'BlockPushGuides';
  id: string;
  surtitle: string;
  heading: string;
  buttonLink: LinkData;
  guides: GuideSummary[];
};

export type Block =
  | BlockTextImage
  | BlockImageBanner
  | BlockServiceList
  | BlockPushGuides;

export type BlockSection = {
  id: string;
  typeHandle: 'BlockSection';
  blocks: Block[];
};

/* ── entries ─────────────────────────────────────────────────────────────── */

export type HomeEntry = {
  heading: string;
  a11yHeading: string;
  description: string;
  buttonLink: LinkData;
  /** The home entry's own image field — the full-bleed hero photograph. */
  heroImage: ImageAsset;
  sections: BlockSection[];
};

export type ServiceEntry = {
  id: string;
  title: string;
  slug: string;
  /** Large display label used by the service-list card. */
  cardTitle: string;
  image: ImageAsset;
};

export type GuideSummary = {
  id: string;
  title: string;
  slug: string;
  /** The guide's own hero image, shown on the push-guides card. */
  image: ImageAsset;
  relatedService: string;
};

export type NavNode = {
  id: string;
  label: string;
  href: string;
  children: NavNode[];
};

export type Address = {
  label: string;
  streetNumber: string;
  streetName: string;
  city: string;
  provinceState: string;
  country: string;
  postalCode: string;
};

export type Settings = {
  siteName: string;
  /** Short three-line lockup used in the header and the footer descriptor. */
  logoLines: [string, string, string];
  particulars: {
    addresses: Address[];
    email: string;
    phone: string;
    fax: string;
  };
  socials: { label: string; href: string; icon: 'facebook' | 'instagram' }[];
  appointment: LinkData;
  newsletter: { label: string; href: string; buttonLabel: string };
  footerImage: ImageAsset;
  legal: NavNode[];
};

/* ── the repository seam ─────────────────────────────────────────────────── */

/**
 * The single boundary between the route and its data. Today it is backed by
 * `mockRepository` (static Persian content); pointing it at Prisma later means
 * writing one more object with these five methods.
 */
export type SiteRepository = {
  getHome(): Promise<HomeEntry>;
  getSettings(): Promise<Settings>;
  getNavigation(): Promise<NavNode[]>;
  listServices(): Promise<ServiceEntry[]>;
  listGuides(): Promise<GuideSummary[]>;
};
