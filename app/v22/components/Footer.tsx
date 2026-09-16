'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { brand, footer, showrooms as showroomsData, socials, type Showroom } from '../data';
import { ANIM } from './bits';
import styles from './elitone.module.css';

/**
 * Upstream footer: a fixed-attachment cover, the newsletter block, three link
 * menus, socials, then the legal row.
 */
export default function Footer({ showrooms }: { showrooms: Showroom[] }) {
  return (
    <footer
      className={styles.esFooter}
      style={{ '--es-footer-cover': `url(${footer.cover})` } as CSSProperties}
    >
      <div className={styles.esFooterScrim} aria-hidden="true" />
      <div className={styles.esFooterInner}>
        <div className={`${styles.esWrap} ${styles.esNewsletter}`}>
          <div className={styles.esNewsletterInner}>
            <span className={styles.esNewsletterTag}>{footer.newsletter.title}</span>
            <span className={styles.esNewsletterTitle} {...ANIM.title}>
              {footer.news.title}
            </span>
            <p style={{ color: 'var(--es-dim)', fontSize: '1.5rem', lineHeight: 1.8 }}>
              {footer.news.body}
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className={`${styles.esWrap} ${styles.esFooterMain}`}>
          <div>
            <h6 className={styles.esFooterHeading}>{footer.columns.contact}</h6>
            <ul className={styles.esFooterList}>
              {showrooms.map((s) => (
                <li key={s.id}>
                  <address>
                    <strong>{s.name}</strong>
                    {s.address}
                    <br />
                    <a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a>
                    <br />
                    <a href={`mailto:${s.email}`}>{s.email}</a>
                  </address>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h6 className={styles.esFooterHeading}>{footer.columns.info}</h6>
            <ul className={styles.esFooterList}>
              {footer.infoLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h6 className={styles.esFooterHeading}>{footer.columns.support}</h6>
            <ul className={styles.esFooterList}>
              {footer.supportLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h6 className={styles.esFooterHeading}>{footer.columns.follow}</h6>
            <div className={styles.esFooterSocials}>
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
            <h6 className={styles.esFooterHeading} style={{ marginTop: '3rem' }}>
              {showroomsData.eyebrow}
            </h6>
            <ul className={styles.esFooterList}>
              <li>
                <a href="#contact">{brand.tagline}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className={`${styles.esWrap} ${styles.esFooterBottom}`}>
          <span>{footer.legal}</span>
          <span>{footer.vat}</span>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const [done, setDone] = useState(false);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  };

  if (done) {
    return (
      <p style={{ marginTop: '3rem', color: 'var(--es-gold)', fontWeight: 500 }}>
        عضویتِ شما ثبت شد — از همراهی‌تان سپاسگزاریم.
      </p>
    );
  }

  return (
    <form className={styles.esNewsletterForm} onSubmit={onSubmit} noValidate>
      <label className={styles.esField}>
        <span className={styles.esLabel}>{footer.newsletter.label}</span>
        <input
          className={styles.esInput}
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </label>
      <button className={styles.esBtn} type="submit" data-cursor="عضویت">
        {footer.newsletter.cta}
      </button>
    </form>
  );
}
