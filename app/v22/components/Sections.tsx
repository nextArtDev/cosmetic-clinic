'use client';

import { useState, type FormEvent } from 'react';
import {
  about,
  blog,
  contact,
  ctaShortcuts,
  products as productsData,
  showrooms as showroomsData,
  type BlogPost,
  type ProductCategory,
  type Showroom,
} from '../data';
import { ANIM, Marquee, cx } from './bits';
import styles from './elitone.module.css';

/* ════════════════════════════════════════════════════════════════
   About — portrait plate, gold separator rule, the company statement,
   two quarry stills that open the lightbox.
   ════════════════════════════════════════════════════════════════ */
export function About({ onOpenQuarry }: { onOpenQuarry: (i: number) => void }) {
  return (
    <section className={`${styles.esSection} ${styles.esWrap}`} id="about">
      <div className={styles.esAboutGrid}>
        <div data-es-reveal data-es-reveal-y="60">
          <figure className={styles.esPortrait}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={about.portrait}
              alt={`${about.founderName} — ${about.founderRole}`}
              draggable={false}
            />
            <figcaption className={styles.esPortraitTag}>
              <strong>{about.founderName}</strong>
              <span>{about.founderRole}</span>
            </figcaption>
          </figure>
        </div>

        <div>
          <span className={styles.esSeparator} {...ANIM.separator}>
            {about.eyebrow}
          </span>
          <p className={styles.esDescription} {...ANIM.excerpt}>
            {about.body}
          </p>

          <ul className={styles.esQuarry}>
            {about.quarryImages.map((q, i) => (
              <li key={q.image} data-es-reveal data-es-reveal-delay={i * 0.1}>
                <button
                  type="button"
                  className={styles.esQuarryItem}
                  onClick={() => onOpenQuarry(i)}
                  aria-label={`نمایشِ ${q.alt}`}
                  data-cursor="نمایش"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={q.image} alt={q.alt} draggable={false} />
                </button>
              </li>
            ))}
          </ul>

          <div data-es-reveal>
            <a className={styles.esBtn} href="#about" data-cursor="بیشتر">
              {about.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   Products — five tease tiles. On hover each square rotates 135° and
   drops to 0.75 scale with a long cast shadow: the reference's
   signature "slab" interaction.
   ════════════════════════════════════════════════════════════════ */
export function Products({ items }: { items: ProductCategory[] }) {
  return (
    <section className={`${styles.esSection} ${styles.esWrap}`} id="products">
      <div className={styles.esProductsHead}>
        <div>
          <span className={styles.esTagline} {...ANIM.title}>
            {productsData.eyebrow}
          </span>
          <h2
            className={`${styles.esTitle} ${styles.esTitleBig}`}
            {...ANIM.title}
            data-es-anim-delay="0.1"
          >
            {productsData.titleLines.join('\n')}
          </h2>
        </div>
        <div>
          <span className={styles.esSeparator} {...ANIM.separator}>
            {productsData.separator}
          </span>
        </div>
      </div>

      <div className={styles.esProductList} data-es-reveal data-es-reveal-children="a">
        {items.map((p) => (
          <a key={p.id} className={styles.esProduct} href={p.href} data-cursor="دیدن">
            <figure className={styles.esProductTile}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} draggable={false} />
            </figure>
            <div className={styles.esProductDatas}>
              <span className={styles.esProductName}>{p.name}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   Showrooms — a fixed-attachment cover with two plates floating over
   it, then the two branches.
   ════════════════════════════════════════════════════════════════ */
export function Showrooms({ items }: { items: Showroom[] }) {
  return (
    <section className={`${styles.esSection} ${styles.esWrap}`} id="showrooms">
      <div
        className={styles.esCovers}
        style={{ backgroundImage: `url(${showroomsData.covers.background})` }}
        data-es-reveal
        data-es-reveal-y="30"
      >
        <figure className={cx(styles.esCoverPlate, styles.esCoverPortrait)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={showroomsData.covers.portrait} alt="انبارِ اسلبِ آریاسنگ" draggable={false} />
        </figure>
        <figure className={cx(styles.esCoverPlate, styles.esCoverTile)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={showroomsData.covers.tile} alt="بافتِ مرمرِ طبیعی" draggable={false} />
        </figure>
      </div>

      <div className={styles.esShowroomGrid}>
        <div>
          <h2 className={`${styles.esTitle} ${styles.esTitleBig}`} {...ANIM.title}>
            {showroomsData.title}
          </h2>
          <p className={styles.esDescription} {...ANIM.excerpt}>
            {showroomsData.intro}
          </p>
          <div data-es-reveal>
            <a className={styles.esBtn} href="#contact" data-cursor="تماس">
              {showroomsData.eyebrow}
            </a>
          </div>
        </div>

        <ul className={styles.esShowroomList}>
          {items.map((s) => (
            <li key={s.id} data-es-reveal data-es-reveal-y="30">
              <div className={styles.esShowroom}>
                <span className={styles.esShowroomRole}>{s.role}</span>
                <span className={styles.esShowroomName}>{s.name}</span>
                <span className={styles.esShowroomMeta}>
                  {s.address}
                  <br />
                  <a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a>
                  <br />
                  <a href={`mailto:${s.email}`}>{s.email}</a>
                </span>
                {/* Upstream renders each branch as two sibling links — keeping
                    them siblings avoids nesting an <a> inside an <a>. */}
                <a
                  className={styles.esShowroomLink}
                  href={s.mapsHref}
                  data-cursor="نقشه"
                >
                  {s.mapsLabel}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   Journal — intro rule, then three tease posts. Hovering a cover
   shrinks the image to 0.6 and uncovers the "بیشتر بخوانید" marquee.
   ════════════════════════════════════════════════════════════════ */
export function Journal({ posts }: { posts: BlogPost[] }) {
  return (
    <>
      <section className={`${styles.esSection} ${styles.esWrap}`}>
        <div className={styles.esProductsHead}>
          <div>
            <h2 className={`${styles.esTitle} ${styles.esTitleSmall}`} {...ANIM.title}>
              {blog.title}
            </h2>
          </div>
          <div>
            <span className={styles.esSeparator} {...ANIM.separator}>
              {blog.eyebrow}
            </span>
          </div>
        </div>
      </section>

      <section className={`${styles.esSection} ${styles.esWrap}`} id="blog">
        <div className={styles.esPostList} data-es-reveal data-es-reveal-children="article">
          {posts.map((post) => (
            <article className={styles.esPost} key={post.id}>
              <a href={post.href}>
                <figure className={styles.esPostCover}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} alt={post.title} draggable={false} />
                  <Marquee />
                  <div className={styles.esPostInfo}>
                    <span className={styles.esPostDate}>{post.date}</span>
                    <div className={styles.esPostFoot2}>
                      <span className={styles.esPostName}>{post.title}</span>
                      <span className={styles.esPostCategory}>{post.category}</span>
                    </div>
                  </div>
                </figure>

                <div className={styles.esPostDatas}>
                  <p className={styles.esPostExcerpt}>{post.excerpt}</p>
                  <span className={cx(styles.esBtn, styles.esPostFoot)}>{blog.readMore}</span>
                </div>
              </a>
            </article>
          ))}
        </div>

        <div data-es-reveal style={{ marginTop: '2.5rem' }}>
          <a className={styles.esBtn} href="#blog" data-cursor="همه">
            {blog.cta}
          </a>
        </div>
      </section>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   Contacts — the dark section, with the appointment form.
   ════════════════════════════════════════════════════════════════ */
export function Contacts({ items }: { items: Showroom[] }) {
  return (
    <section className={styles.esContacts} id="contact" data-mode="dark">
      <div className={styles.esWrap}>
        <ul className={styles.esBreadcrumb}>
          {showroomsData.breadcrumb.map((crumb, i) => (
            <li key={crumb}>
              {i > 0 && <span style={{ opacity: 0.5 }}> / </span>}
              <a href="#top">{crumb}</a>
            </li>
          ))}
        </ul>

        <div className={styles.esContactsGrid}>
          <div>
            <h2 className={`${styles.esTitle} ${styles.esTitleBig}`} {...ANIM.title}>
              {contact.title}
            </h2>
            <span className={styles.esSeparator} {...ANIM.separator}>
              {contact.eyebrow}
            </span>

            {items.map((s) => (
              <address className={styles.esAddress} key={s.id}>
                <strong>{s.role}</strong>
                <span>{s.name}</span>
                <a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a>
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </address>
            ))}
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4500);
  };

  if (sent) {
    return (
      <div className={styles.esFormDone}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 12.5L9.5 18L20 6"
            stroke="var(--es-gold)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <h4>درخواستِ شما ارسال شد</h4>
        <p>به‌زودی کارشناسانِ ما با شما تماس می‌گیرند.</p>
      </div>
    );
  }

  return (
    <form className={styles.esForm} onSubmit={onSubmit} noValidate>
      <span className={styles.esTagline} style={{ color: 'var(--es-gold)' }}>
        {contact.formTitle}
      </span>

      <div className={styles.esFieldRow}>
        <label className={styles.esField}>
          <span className={styles.esLabel}>{contact.fields.firstname}</span>
          <input className={styles.esInput} name="firstname" type="text" required />
        </label>
        <label className={styles.esField}>
          <span className={styles.esLabel}>{contact.fields.lastname}</span>
          <input className={styles.esInput} name="lastname" type="text" required />
        </label>
      </div>

      <div className={styles.esFieldRow}>
        <label className={styles.esField}>
          <span className={styles.esLabel}>{contact.fields.email}</span>
          <input className={styles.esInput} name="email" type="email" required />
        </label>
        <label className={styles.esField}>
          <span className={styles.esLabel}>{contact.fields.phone}</span>
          <input className={styles.esInput} name="phone" type="tel" />
        </label>
      </div>

      <label className={styles.esField}>
        <span className={styles.esLabel}>{contact.fields.subject}</span>
        <select className={styles.esSelect} name="subject" defaultValue="">
          <option value="" disabled>
            انتخاب کنید…
          </option>
          {contact.subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.esField}>
        <span className={styles.esLabel}>{contact.fields.message}</span>
        <textarea className={styles.esTextarea} name="message" rows={4} />
      </label>

      <label className={styles.esConsent}>
        <input type="checkbox" required />
        <span>{contact.consent}</span>
      </label>

      <div className={styles.esFormFoot}>
        <button className={styles.esBtn} type="submit" data-cursor="ارسال">
          {contact.submit}
        </button>
        <span className={styles.esFormNote}>{about.eyebrow} — {contact.eyebrow}</span>
      </div>
    </form>
  );
}

/* ════════════════════════════════════════════════════════════════
   CTA shortcuts — upstream `section.cta-shortcuts`.
   ════════════════════════════════════════════════════════════════ */
export function CtaShortcuts() {
  return (
    <section className={styles.esWrap}>
      <div className={styles.esCtaRow}>
        {ctaShortcuts.map((c) => (
          <div className={styles.esCta} key={c.tagline} data-es-reveal data-es-reveal-y="30">
            <span className={styles.esCtaTag} {...ANIM.title}>
              {c.tagline}
            </span>
            <p className={styles.esCtaBody}>{c.body}</p>
            <a className={styles.esBtn} href={c.href} data-cursor="برو">
              {c.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
