'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type {
  BlockImageBanner,
  BlockPushGuides,
  BlockServiceList,
  BlockTextImage,
  ServiceEntry,
} from '../types';
import { WORDS } from '../data';
import { ButtonLink, Picture, Surtitle, WordsList } from './Bits';
import { clamp, useBreakpoint } from '../lib/engine';

/**
 * /v23 content blocks — the four Neo block types the reference's home page uses.
 *
 * The two animated blocks carry their scroll maths verbatim from the reference's
 * BlocksBuilder chunk; the other two are static markup.
 */

/* ── BlockTextImage ──────────────────────────────────────────────────────── */

export function TextImageBlock({ block }: { block: BlockTextImage }) {
  // The reference drops the heading one step between md and xl. Both queries
  // are subscribed unconditionally; only the combination is conditional.
  const isMd = useBreakpoint('min', 'md');
  const isXl = useBreakpoint('min', 'xl');
  const headingVariant = isMd && !isXl ? 'h3' : 'h2';

  return (
    <div className="b-text-image l-container l-grid" id="about">
      <div className="b-text-image__image col-2-md col-4-lg col-7-xl start-6-xl">
        <Picture asset={block.image} />
      </div>
      <div className="b-text-image__copy col-2-md col-4-lg col-5-xl">
        <div className="b-text-image__copy__header">
          <Surtitle>{block.surtitle}</Surtitle>
          <h2 className={`c-text-variant t-${headingVariant}`}>{block.heading}</h2>
        </div>
        <div className="b-text-image__copy__footer">
          <p className="c-text-variant t-p1 b-text-image__copy__footer__description">
            {block.description}
          </p>
          <ButtonLink link={block.buttonLink} icon="arrow" />
        </div>
      </div>
    </div>
  );
}

/* ── BlockImageBanner ────────────────────────────────────────────────────── */

/**
 * The reference's most scroll-driven block. Four values move together, all
 * derived from the banner's own position:
 *
 *   z      = 1 - (rect.top + 400) / (innerHeight / 2)
 *   overlay = clamp(0, 1, 1 - rect.top / (innerHeight / 2))
 *   image2  translateX = -clamp(0, 20, z * 20)              (always leftward)
 *   image3  translateX =  clamp(0, maxX, z * maxX)
 *           translateY =  clamp(0, maxY, z * maxY)
 *   scale   =  clamp(1, 1.1, 1 + z * 0.1)
 *
 * `maxX` / `maxY` are breakpoint-dependent, which is what makes the drift feel
 * tighter on phones than on a wide desktop.
 */
export function ImageBannerBlock({ block }: { block: BlockImageBanner }) {
  const bannerRef = useRef<HTMLDivElement>(null);

  const isXl = useBreakpoint('min', 'xl');
  const isLg = useBreakpoint('min', 'lg');
  const isMd = useBreakpoint('min', 'md');

  const [image2X, setImage2X] = useState(0);
  const [image3X, setImage3X] = useState(0);
  const [image3Y, setImage3Y] = useState(0);
  const [overlay, setOverlay] = useState(0);
  const [scale, setScale] = useState(1);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;

    const maxX = isXl ? 60 : isLg ? 50 : 40;
    const maxY = isXl ? -10 : isMd ? -30 : -40;
    const to = (max: number, v: number) => Math.max(0, Math.min(max, v * max));

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const half = window.innerHeight / 2;
      const z = 1 - (rect.top + 400) / half;

      setOverlay(clamp(0, 1, 1 - rect.top / half));
      setImage2X(-to(20, z));
      setImage3X(to(maxX, z));
      setImage3Y(to(maxY, z));
      setScale(clamp(1, 1.1, 1 + z * 0.1));
      setZoomed(rect.top <= half);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isXl, isLg, isMd]);

  return (
    <div
      className="b-image-banner"
      ref={bannerRef}
      style={{ '--51328851': scale } as CSSProperties}
    >
      <WordsList words={WORDS} className="b-image-banner__words-list" long animated={zoomed} />

      <div
        className="b-image-banner__image-2"
        style={{ transform: `translateX(${image2X}%)` }}
      >
        <Picture asset={block.image2} fixedRatio ratio="portrait" />
      </div>

      <div
        className="b-image-banner__image-3"
        style={{ transform: `translateX(${image3X}%) translateY(${image3Y}%)` }}
      >
        <Picture asset={block.image3} fixedRatio ratio="portrait" />
      </div>

      <Picture asset={block.backgroundImage} className="b-image-banner__image" />

      <div className="b-image-banner__overlay" style={{ opacity: overlay }} />
    </div>
  );
}

/* ── BlockServiceList ────────────────────────────────────────────────────── */

/**
 * The reference's `c-heading-description` splits its copy across two grid
 * columns and re-flows it at five breakpoints. The full class list is
 * transcribed rather than guessed — truncating it silently drops the 2xl/5xl
 * placements.
 */
const HEADING_COLS = 'col-4-lg col-6-xl col-4-2xl';
const COPY_COLS =
  'col-3-lg start-6-lg col-5-xl start-8-xl col-4-2xl start-7-2xl col-3-5xl start-7-5xl';

export function ServiceListBlock({
  block,
  services,
}: {
  block: BlockServiceList;
  services: ServiceEntry[];
}) {
  return (
    <div className="c-section-service-list l-container b-service-list" id="services">
      <div className="c-heading-description l-grid">
        <div className={`c-heading-description__heading ${HEADING_COLS}`}>
          <Surtitle>{block.surtitle}</Surtitle>
          <p className="c-text-variant t-h2">{block.heading}</p>
        </div>
        <div className={`c-heading-description__description ${COPY_COLS}`}>
          <p className="c-text-variant t-p1">{block.description}</p>
        </div>
        <div className={`c-heading-description__button ${COPY_COLS}`}>
          <ButtonLink link={block.buttonLink} />
        </div>
      </div>

      <div className="c-section-service-list__list">
        {services.map((service) => (
          <div
            className="c-box-base -h-align-right -v-align-top c-raw-card c-card-service"
            key={service.id}
            id={`services-${service.slug}`}
            style={{ '--54cd3d5c': 'flex-end', '--25058bf8': 'flex-start' } as CSSProperties}
          >
            <div className="c-box-base__main">
              <Picture asset={service.image} className="c-card-service__image" fixedRatio ratio="portrait" />
              <div className="c-card-service__title">
                <h2 className="c-text-variant t-h1-display c-card-service__title__copy">
                  {service.cardTitle}
                </h2>
              </div>
              <div className="c-card-service__background" />
              <div className="c-raw-card__link">
                <div className="c-raw-card__link__button">
                  <button
                    type="button"
                    className="queso-clickable c-raw-button is-hoverable c-button-primary -theme-light"
                    aria-hidden="true"
                    tabIndex={-1}
                    style={{ '--6f25b207': 2 } as CSSProperties}
                  >
                    <span className="c-text-variant t-c1 c-raw-button__label">بیشتر بدانید</span>
                  </button>
                </div>
                <a className="c-raw-card__link__router" href={`#services-${service.slug}`}>
                  <span className="visually-hidden">بیشتر بدانید — {service.title}</span>
                </a>
              </div>
            </div>
            <div className="c-box-base__background" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── BlockPushGuides ─────────────────────────────────────────────────────── */

export function PushGuidesBlock({ block }: { block: BlockPushGuides }) {
  return (
    <div className="c-section-push-content b-push-guides" id="guides">
      <div className="c-heading-description l-grid l-container c-section-push-content__heading">
        <div className={`c-heading-description__heading ${HEADING_COLS}`}>
          <Surtitle>{block.surtitle}</Surtitle>
          <h3 className="c-text-variant t-h2">{block.heading}</h3>
        </div>
        <div className={`c-heading-description__button ${COPY_COLS}`}>
          <ButtonLink link={block.buttonLink} icon="arrow" />
        </div>
      </div>

      <div className="-grid c-cards-grid c-section-push-content__grid">
        {block.guides.map((guide) => (
          <div
            className="c-box-base -h-align-left -v-align-space-between c-raw-card c-card-guide"
            key={guide.id}
            style={{ '--54cd3d5c': 'flex-start', '--25058bf8': 'space-between' } as CSSProperties}
          >
            <div className="c-box-base__main">
              <div className="c-card-guide__header">
                <h2 className="c-text-variant t-h2 c-card-guide__header__title">{guide.title}</h2>
              </div>
              <div className="c-card-guide__footer">
                <Picture
                  asset={guide.image}
                  className="c-card-guide__footer__image"
                  fixedRatio
                  ratio="portrait"
                />
              </div>
              <a className="c-raw-card__link__router" href={`#guides-${guide.slug}`}>
                <span className="visually-hidden">{guide.title}</span>
              </a>
            </div>
            <div className="c-box-base__background" />
          </div>
        ))}
      </div>
    </div>
  );
}
