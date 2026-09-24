'use client';

import type { NavNode, Settings } from '../types';
import { ButtonLink, LogoDescriptor, LogoMark, NavList, Picture } from './Bits';
import { AddressBlock, ParticularsTable, Socials } from './Contact';

/**
 * The reference's `l-footer`.
 *
 * The column order, the "particulars" split (address | contact | socials) and
 * the two outline buttons in the appointment column are all as upstream. The
 * credits link the reference hides with an inline `display: none` is simply
 * left out here.
 */
export default function Footer({
  navigation,
  settings,
  onMeasure,
}: {
  navigation: NavNode[];
  settings: Settings;
  onMeasure?: (height: number) => void;
}) {
  const footerRef = (el: HTMLElement | null) => {
    if (el && onMeasure) onMeasure(el.getBoundingClientRect().height);
  };

  return (
    <footer className="l-footer" ref={footerRef} id="contact">
      <div className="l-footer__grid l-container">
        <div className="l-footer__image">
          <Picture asset={settings.footerImage} fixedRatio />
        </div>

        <div className="c-the-footer-logos l-footer__logo">
          <div className="c-the-footer-logos__logo">
            <a className="c-logo" href="#top" aria-label={settings.siteName}>
              <LogoMark className="-tone-undefined" />
            </a>
          </div>
          <div className="c-the-footer-logos__descriptor">
            <a className="c-logo" href="#top">
              <LogoDescriptor lines={settings.logoLines} />
            </a>
          </div>
        </div>

        <div className="l-footer__nav-footer">
          <NavList nodes={navigation} className="l-footer-main-nav l-footer__nav-footer__main" />
        </div>

        <div className="c-the-footer-particulars l-footer__particulars">
          <div className="c-the-footer-particulars__address">
            <AddressBlock address={settings.particulars.addresses[0]} />
          </div>
          <ParticularsTable
            particulars={settings.particulars}
            className="c-the-footer-particulars__contact"
          />
          <div className="c-the-footer-particulars__socials">
            <Socials socials={settings.socials} />
          </div>
        </div>

        <div className="c-the-footer-appointment l-footer__appointment">
          <div className="c-the-footer-appointment__appointment">
            <p className="c-text-variant t-p1 c-the-footer-appointment__appointment__label">
              نوبت‌دهی
            </p>
            <ButtonLink link={settings.appointment} theme="outline" icon="calendar" />
          </div>
          <div className="c-the-footer-appointment__newsletter">
            <p className="c-text-variant t-p1 c-the-footer-appointment__newsletter__label">
              {settings.newsletter.label}
            </p>
            <ButtonLink
              link={{
                type: 'url',
                value: settings.newsletter.href,
                label: settings.newsletter.buttonLabel,
              }}
              theme="outline"
              icon="arrow"
            />          </div>
        </div>

        <div className="l-footer__copyright">
          <NavList nodes={settings.legal} className="l-footer-legal-nav" />
        </div>
      </div>
    </footer>
  );
}
