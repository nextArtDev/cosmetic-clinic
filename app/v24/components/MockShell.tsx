import Link from 'next/link';
import type { ReactNode } from 'react';
import { mockRepository } from '../data';

/**
 * The shell for /v24's mock sub-routes.
 *
 * The home page is a verbatim port and owns its own wrapper stack. These routes
 * are *not* part of the port — they are the mock "important routes" (a service
 * listing and a service detail) that a real backend will eventually feed, so
 * they need the clinic's own chrome rather than the reference's.
 *
 * They still render inside `#v24-root.v24-root > .mosaic-wrap > .root.root-main`
 * for two reasons:
 *   - the vendored stylesheet is keyed to those classes for its typography and
 *     page colour, and
 *   - it is the element the ID-prefixed selectors are anchored to, so nothing
 *     in the vendored sheet can reach past this subtree.
 *
 * Deliberately a server component, and deliberately reusing no ported section:
 * the vendored animation sheet declares the *initial* hidden state of every
 * animated element (`opacity: 0`), so a ported block rendered without the
 * motion runtime would stay invisible. The mock routes therefore use only the
 * vendored typography/utility classes plus the `.v24-*` furniture declared in
 * styles/numa.theme.css.
 *
 * `dir="rtl"` lives on the wrapper, not on <html>: the document keeps whatever
 * direction the shared root layout gave it.
 */
export async function MockShell({ children }: { children: ReactNode }) {
  const [settings, services] = await Promise.all([
    mockRepository.getSettings(),
    mockRepository.listServices(),
  ]);

  return (
    // `v24-root--rtl` opts these routes back into RTL: unlike the ported home
    // page (a physical LTR design), this shell is authored for Persian, so it
    // wants the wrapper's logical properties resolving right-to-left.
    <div id="v24-root" className="v24-root v24-root--rtl" dir="rtl" lang="fa">
      <div className="mosaic-wrap">
        <div className="root root-main">
          <nav className="v24-bar">
            <Link href="/v24" className="v24-bar__brand">
              <span aria-hidden="true">سپیدار</span>
              <span className="v24-muted">دندانپزشکی</span>
            </Link>
            <div className="v24-bar__nav">
              <Link href="/v24" className="v24-bar__link">
                صفحه‌ی اصلی
              </Link>
              {services.slice(0, 3).map((s) => (
                <Link key={s.slug} href={`/v24/services/${s.slug}`} className="v24-bar__link">
                  {s.name}
                </Link>
              ))}
              <Link href="/v24/services" className="v24-bar__link">
                همه‌ی خدمات
              </Link>
            </div>
          </nav>

          {children}

          <footer className="v24-foot">
            <div className="v24-wrap v24-foot__grid">
              <div className="v24-stack">
                <span className="h4">{settings.name}</span>
                <p className="v24-muted">{settings.tagline}</p>
              </div>
              <div className="v24-stack">
                <span className="h5">تماس</span>
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}>{settings.phone}</a>
                <span className="v24-muted">{settings.hours}</span>
              </div>
              <div className="v24-stack">
                <span className="h5">نشانی</span>
                <p className="v24-muted">{settings.address}</p>
                <a href={`https://instagram.com/${settings.instagram}`} rel="noreferrer noopener" target="_blank">
                  اینستاگرام: {settings.instagram}
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
