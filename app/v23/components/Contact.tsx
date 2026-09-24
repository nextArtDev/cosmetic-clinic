'use client';

import type { Address, Settings } from '../types';
import { Icon } from './Bits';

/**
 * The address / contact blocks the reference renders twice — once inside the
 * fullscreen nav and once in the footer. Both are plain markup: the styling all
 * comes from the ported `c-raw-address` and `c-particulars-table` rules.
 *
 * Phone and fax are wrapped in `jc-ltr` so the Latin digits and separators keep
 * their natural order inside the RTL flow.
 */

export function AddressBlock({ address }: { address: Address }) {
  return (
    <div className="c-raw-address c-address-main">
      <p className="c-text-variant t-p1 c-raw-address__label">{address.label}</p>
      <address className="c-text-variant t-c1">
        <span className="c-raw-address__line-1">
          <span className="c-raw-address__street-number">{address.streetNumber}</span>{' '}
          <span className="c-raw-address__street-name">{address.streetName}</span>
        </span>
        <span className="c-raw-address__line-2">
          <span className="c-raw-address__city">{address.city}</span>{' '}
          <span className="c-raw-address__province-state">{address.provinceState}</span>{' '}
          <span className="c-raw-address__postal-code">{address.postalCode}</span>
        </span>
        <span className="c-raw-address__line-3 c-raw-address__country">{address.country}</span>
      </address>
    </div>
  );
}

function UnderlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="queso-clickable c-raw-button is-hoverable c-button-base -show-underline" href={href}>
      <span className="c-text-variant t-c1 c-raw-button__label">{children}</span>
    </a>
  );
}

export function ParticularsTable({
  particulars,
  className = '',
}: {
  particulars: Settings['particulars'];
  className?: string;
}) {
  // Latin contact details must not be re-ordered by the RTL flow.
  const tel = particulars.phone.replace(/[^\d+]/g, '');
  const fax = particulars.fax.replace(/[^\d+]/g, '');

  return (
    <div className={`c-particulars-table ${className}`.trim()}>
      <p className="c-text-variant t-p1 c-particulars-table__label">تماس</p>
      <div className="c-particulars-table__links">
        <UnderlineLink href={`mailto:${particulars.email}`}>
          <span className="jc-ltr">{particulars.email}</span>
        </UnderlineLink>
        <table className="c-particulars-table__links__table">
          <tbody>
            <tr>
              <td>
                <p className="c-text-variant t-c1">تلفن</p>
              </td>
              <td>
                <UnderlineLink href={`tel:${tel}`}>
                  <span className="jc-ltr">{particulars.phone}</span>
                </UnderlineLink>
              </td>
            </tr>
            <tr>
              <td>
                <p className="c-text-variant t-c1">دورنگار</p>
              </td>
              <td>
                <UnderlineLink href={`fax:${fax}`}>
                  <span className="jc-ltr">{particulars.fax}</span>
                </UnderlineLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Socials({ socials }: { socials: Settings['socials'] }) {
  return (
    <div className="c-social-media">
      <ul className="c-social-media__list">
        {socials.map((s) => (
          <li className={`c-social-media-item -${s.icon}`} key={s.label}>
            <a href={s.href} target="_blank" rel="noopener noreferrer">
              <Icon name={s.icon} width="1.8rem" />
              <p className="c-text-variant t-c1">{s.label}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
