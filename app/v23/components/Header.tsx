'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { NavNode, Settings } from '../types';
import { ButtonLink, Icon, IconLink, LogoDescriptor, LogoMark, NavList } from './Bits';
import { AddressBlock, ParticularsTable } from './Contact';

/**
 * The reference's `l-header`.
 *
 * It is `position: fixed`, measures its own two inner boxes with a resize
 * observer and publishes `--header-height`, `--header-inner-height` and
 * `--header-with-logo-height` (logo height + 80) as CSS variables — the hero's
 * negative top margin and its `padding-top` are both derived from them.
 *
 * Upstream those land on `document.body`. Here they land on the /v23 wrapper
 * element instead, which every consumer inherits from just the same. That is
 * the whole difference, and it is what keeps the home page's own header
 * measurements untouched.
 */

type Measurements = {
  header: number;
  inner: number;
  withLogo: number;
};

export default function Header({
  navigation,
  settings,
  onMeasure,
  onMenuToggle,
}: {
  navigation: NavNode[];
  settings: Settings;
  onMeasure: (m: Measurements) => void;
  onMenuToggle: (open: boolean) => void;
}) {
  const headerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  // Measure the three boxes the reference measures.
  useLayoutEffect(() => {
    const measure = () => {
      const header = headerRef.current?.getBoundingClientRect().height ?? 0;
      const inner = innerRef.current?.getBoundingClientRect().height ?? 0;
      const logo = logoRef.current?.getBoundingClientRect().height ?? 0;
      onMeasure({ header, inner, withLogo: logo + 80 });
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (headerRef.current) ro.observe(headerRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [onMeasure]);

  // The reference reveals the header once the page has settled, not on mount.
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 300);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    onMenuToggle(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    // Move focus into the panel, as the reference does.
    const t = window.setTimeout(() => closeRef.current?.focus(), 400);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open, onMenuToggle]);

  return (
    <header
      className={[
        'l-header',
        visible ? '-is-visible' : '',
        open ? '-is-navigation-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="l-header__main" ref={headerRef}>
        <div className="l-header__main__inner" ref={innerRef}>
          <a className="c-logo -tone-light" href="#top" aria-label={settings.siteName}>
            <LogoMark />
          </a>

          <div className="l-header__navigation-button-group">
            <button
              type="button"
              className="queso-clickable c-raw-button is-hoverable c-button-primary -theme-light c-header-nav-button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? 'بستن فهرست' : 'باز کردن فهرست'}
            >
              <span className="c-text-variant t-c1 c-raw-button__label">
                {open ? 'بستن' : 'فهرست'}
              </span>
            </button>
            <IconLink
              href={settings.appointment.value}
              label={settings.appointment.label}
              icon="calendar"
            />
          </div>

          <div className={`l-header__nav ${open ? '' : '-is-closed'}`}>
            <NavList
              nodes={navigation}
              className="l-header-main-nav l-header__nav__navigations"
            />
            <div className="l-header__nav__particulars">
              <AddressBlock address={settings.particulars.addresses[0]} />
              <ParticularsTable particulars={settings.particulars} />
              <div className="l-header__nav__appointment">
                <p className="c-text-variant t-p1 l-header__nav__appointment__label">نوبت‌دهی</p>
                <ButtonLink
                  link={settings.appointment}
                  theme="outline"
                  icon="calendar"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            ref={closeRef}
            className={[
              'queso-clickable',
              'c-raw-button',
              'is-hoverable',
              'c-button-icon',
              '-theme-base',
              'c-header-nav-button-close',
              // The panel's own close button: `position: fixed` at the panel's
              // corner, translated off-screen by
              // `--header-nav-button-translate-x` while `-is-closed`.
              'l-header__nav__navigation-button',
              open ? '' : '-is-closed',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setOpen(false)}
          >
            <Icon name="cross" className="c-button-icon__icon" />
            <span className="c-text-variant t-p1 c-raw-button__label">بستن</span>
          </button>
        </div>
      </div>

      <div className="l-header__logo-descriptor l-grid">
        <div className="c-logo -tone-light start-4-lg start-6-xl" ref={logoRef}>
          <LogoDescriptor lines={settings.logoLines} />
        </div>
      </div>
    </header>
  );
}
