/**
 * /v24 types.
 *
 * Two unrelated groups live here on purpose:
 *
 *  - the motion spec shapes, which mirror the builder's own config so
 *    `data/animations.json` (extracted from the reference) can be consumed
 *    without a translation layer;
 *  - the content repository, which is the single seam the route's copy passes
 *    through. Everything the pages render comes from `V24Repository`, so
 *    swapping the mock for Prisma is one file.
 */

/* ----------------------------------------------------------------- motion --- */

export interface EffectOptions {
  ease: string;
  /** position of the from/to keyframe on a normalised 0-100 timeline */
  startKeyframe: number;
  endKeyframe: number;
  delay?: number;
  duration?: number;
}

export interface Effect {
  name: string;
  /** [from, to] — property bags handed to GSAP unchanged */
  keyframes: Array<Record<string, unknown>>;
  options: EffectOptions;
}

export interface MediaParams {
  disabled?: boolean;
  effects: Effect[];
  preset?: string;
  /** the element whose position drives the trigger, e.g. `#igoxothd7_0` */
  triggerElement?: string;
  startPosition?: string;
  endPosition?: string;
  startOffset?: string;
  endOffset?: string;
  scrollerStartOffset?: string;
  scrollerEndOffset?: string;
  /** ScrollTrigger's `scrub` */
  smoothing?: number;
  markers?: boolean;
  iterations?: number;
  stageOfAppear?: string;
  loop?: unknown;
}

export interface Animation {
  id: string;
  /** SCROLL_TRANSFORM | APPEAR_ON_SCREEN | HOVER | CLICK */
  trigger: string;
  /** keyed by media query, plus `screen` for the base case */
  media: Record<string, MediaParams>;
}

/** element id (without the `_0` suffix) -> the animations bound to it */
export type AnimationSpec = Record<string, Animation[]>;

/* ---------------------------------------------------------------- content --- */

export interface Service {
  slug: string;
  name: string;
  /** shown on the category listing */
  summary: string;
  /** the detail page's opening paragraph */
  intro: string;
  duration: string;
  price: string;
  image: string;
  /** bullet list on the detail page */
  includes: string[];
}

export interface Doctor {
  name: string;
  role: string;
  focus: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface Stat {
  value: string;
  unit: string;
  title: string;
  description: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface ClinicSettings {
  name: string;
  tagline: string;
  phone: string;
  address: string;
  hours: string;
  instagram: string;
}

export interface HomeContent {
  heroTitle: string;
  heroLead: string;
  stats: Stat[];
  services: Service[];
  doctors: Doctor[];
  testimonials: Testimonial[];
}

/**
 * The route's only data entry point. Pages call it on the server and pass plain
 * values down; no component imports Prisma, and no component fetches.
 */
export interface V24Repository {
  getHome(): Promise<HomeContent>;
  listServices(): Promise<Service[]>;
  getService(slug: string): Promise<Service | null>;
  listDoctors(): Promise<Doctor[]>;
  getNavigation(): Promise<NavItem[]>;
  getSettings(): Promise<ClinicSettings>;
}
