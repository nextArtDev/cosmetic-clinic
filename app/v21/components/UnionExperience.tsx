'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowUpLeft, ArrowDown, ArrowLeft, ArrowUp, Play, Pause, Plus, X, Check, Volume2, VolumeX, MoveUpRight, ArrowRight, Download, ChevronLeft, ChevronRight, Grid3x3,
} from 'lucide-react';
import {
  awards, film, team, additionalCrew, statements, press, merch, partners, footerSocials, footerNav, footerEmail,
  unionRepository, type Screening,
} from '../data';
import styles from './union.module.css';
import './union.tailwind.css';

const ease = [0.22, 1, 0.36, 1] as const;

/* ────────────────────────────────────────────────────────────────
   ANIMATION PRIMITIVES — match the Webflow custom-code behaviors.
   ──────────────────────────────────────────────────────────────── */

/** IntersectionObserver hook that fires `onEnter` once when the target
 *  scrolls into view. Mirrors the Webflow base scroll trigger. */
function useInView<T extends Element>(options: IntersectionObserverInit = { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, options);
    obs.observe(node);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, inView } as const;
}

/** `useReducedMotion()` from framer-motion reads the media query on the
 *  first client render and can return a different value than the server
 *  output (server has no `matchMedia`), causing React hydration mismatches.
 *  Gate behind a mount flag so so both renders return the same default. */
function useReducedMotionSafe(): boolean | null {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? reduced : false;
}

/** Word-by-word blur-in. Splits a string into spans and toggles a
 *  `data-blur-active` attribute on the wrapper when in view, so each word
 *  transitions from blur+opacity to clear. NOTE: the word spans must use
 *  `styles.blurWord`, not the literal string — CSS Modules hash every class
 *  in a selector, so a bare "blurWord" never matches. */
function BlurText({ children, className = '', as: Tag = 'span', delay = 0 }: { children: string; className?: string; as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div'; delay?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const words = children.split(' ');
  const Wrapper: any = Tag;
  return <Wrapper ref={ref} className={className} data-blur-active={inView || undefined} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
    {words.map((w, i) => <span key={i} className={styles.blurWord}>{w}{i < words.length - 1 ? ' ' : ''}</span>)}
  </Wrapper>;
}

/** Text scramble (matches `data-scrambler-text`). When in view, jitters each
 *  character for ~24 frames then settles to the real text. The scramble
 *  re-fires each time the element re-enters the viewport. */
function Scramble({ text, className = '', speed = 28 }: { text: string; className?: string; speed?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const [display, setDisplay] = useState(text);
  const [active, setActive] = useState(false);
  const frameRef = useRef(0);
  const charPool = '!<>-_\\/[]{}—=+*^?#________';
  useEffect(() => {
    if (!inView) return;
    setActive(true);
    let i = 0;
    const total = Math.min(text.length * 4, 24);
    const id = setInterval(() => {
      i += 1;
      const progress = i / total;
      const settled = Math.floor(text.length * progress);
      const next = text.split('').map((c, idx) => {
        if (idx < settled) return c;
        if (c === ' ' || c === '\n') return c;
        return charPool[Math.floor(Math.random() * charPool.length)];
      }).join('');
      setDisplay(next);
      if (i >= total) { setDisplay(text); clearInterval(id); setActive(false); }
    }, speed);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, text]);
  return <span ref={ref} className={`${className} ${styles.scramble} ${active ? styles.isScrambling : ''}`}>{display}</span>;
}

/** Generic reveal that swaps an `inView` class on enter, used for fade-up +
 *  image-scale + section-label reveals. Mirrors the role="fade-up" /
 *  role="image-scale" elements. */
function Reveal({ children, className = '', delay = 0, role = 'fade-up' }: { children: ReactNode; className?: string; delay?: number; role?: 'fade-up' | 'fade' | 'image-scale' }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: role === 'image-scale' ? 0.05 : 0.18 });
  const cls = role === 'image-scale' ? styles.imageScale : role === 'fade' ? styles.fadeIn : styles.fadeUp;
  return <div ref={ref} className={`${cls} ${className}`} data-in-view={inView || undefined} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</div>;
}

/* ────────────────────────────────────────────────────────────────
   STATIC DECORATIONS — laurels, arrow scribble, etc.
   ──────────────────────────────────────────────────────────────── */

function Laurel({ children, sub }: { children: ReactNode; sub: string }) {
  const year = '۲۰۲۴';
  return <div className={styles.laurel}>
    <svg viewBox="0 0 34 76" fill="none" aria-hidden="true"><path d="M29 71C4 56 4 28 24 5" stroke="currentColor" strokeWidth="1.4" />{[0,1,2,3,4,5].map(i => <g key={i} transform={`translate(${i < 3 ? 13 - i * 3 : 7 + (i - 3) * 2},${9 + i * 9}) rotate(${i * -12})`}><ellipse cx="-4" cy="3" rx="2.7" ry="7" fill="currentColor" transform="rotate(-30)"/><ellipse cx="4" cy="0" rx="2.7" ry="6" fill="currentColor" transform="rotate(35)"/></g>)}</svg>
    <div><small>{sub}</small><strong>{children}</strong><span>{year}</span></div>
    <svg viewBox="0 0 34 76" fill="none" aria-hidden="true"><path d="M29 71C4 56 4 28 24 5" stroke="currentColor" strokeWidth="1.4" />{[0,1,2,3,4,5].map(i => <g key={i} transform={`translate(${i < 3 ? 13 - i * 3 : 7 + (i - 3) * 2},${9 + i * 9}) rotate(${i * -12})`}><ellipse cx="-4" cy="3" rx="2.7" ry="7" fill="currentColor" transform="rotate(-30)"/><ellipse cx="4" cy="0" rx="2.7" ry="6" fill="currentColor" transform="rotate(35)"/></g>)}</svg>
  </div>;
}

/** Big green arrow behind the wordmark (mirrors `.section-hero__heading-vector`). */
function HeroArrow() {
  return <svg className={styles.heroArrow} viewBox="0 0 600 280" fill="none" aria-hidden="true">
    <motion.path d="M540 26 L80 110 L520 152 L70 252" stroke="currentColor" strokeWidth="80" strokeLinejoin="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.6, ease, delay: 0.35 }} />
  </svg>;
}

/** Decorative arrow SVG behind headings like "Creative team" / "Film funders". */
function HeadingArrow() {
  return <svg viewBox="0 0 600 280" fill="none" aria-hidden="true" preserveAspectRatio="none">
    <path d="M540 26 L80 110 L520 152 L70 252" stroke="currentColor" strokeWidth="60" strokeLinejoin="round" />
  </svg>;
}

/* ────────────────────────────────────────────────────────────────
   MARQUEE — CSS-only infinite scroll row with paused-on-hover.
   ──────────────────────────────────────────────────────────────── */

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const loop = useMemo(() => [...items, ...items, ...items], [items]);
  return <div className={`${styles.partnersRow} ${reverse ? styles.reverse : ''}`} aria-hidden="true">
    {loop.map((label, i) => <div key={i} className={styles.partnerBox}><span>{label}</span><small>{reverse ? 'partner' : 'partner'}</small></div>)}
  </div>;
}

/* ────────────────────────────────────────────────────────────────
   DIALOGS
   ──────────────────────────────────────────────────────────────── */

function Dialog({ children, onClose, title, wide = false }: { children: ReactNode; onClose: () => void; title: string; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); };
  }, []);
  return <dialog ref={ref} className={`${styles.dialog} ${wide ? styles.wideDialog : ''}`} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-label={title} dir="rtl">
    <motion.div className={styles.dialogContent} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className={styles.dialogHead}><span>{title}</span><button className={styles.iconButton} onClick={onClose} aria-label="بستن پنجره"><X size={23} /></button></div>{children}
    </motion.div>
  </dialog>;
}

function Reservation({ screening, onClose }: { screening: Screening; onClose: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/union/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'reservation', screeningId: screening.id, name: form.get('name'), email: form.get('email'), quantity: Number(form.get('quantity')) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data.reference);
      try { const previous = JSON.parse(localStorage.getItem('union-demo-reservations') || '[]'); localStorage.setItem('union-demo-reservations', JSON.stringify([...(Array.isArray(previous) ? previous : []), { reference: data.reference, screeningId: screening.id }])); } catch { /* Storage is optional. */ }
    } catch (err) { setError(err instanceof Error ? err.message : 'ارتباط برقرار نشد. دوباره تلاش کنید.'); }
    finally { setPending(false); }
  }
  return <Dialog title="رزرو اکران — نسخه آزمایشی" onClose={onClose}>
    {result ? <div className={styles.success} role="status"><span className={styles.successIcon}><Check size={35}/></span><h2>یک صندلی برای هم‌صدایی.</h2><p>رزرو آزمایشی شما برای اکران {screening.city} ثبت شد.</p><code dir="ltr">{result}</code><p className={styles.demoNote}>این رسید یک نمونه نمایشی است؛ بلیت واقعی صادر نشده و ایمیلی ارسال نمی‌شود.</p><button className={styles.solidButton} onClick={onClose}>بسیار خوب <ArrowLeft size={18}/></button></div> : <>
      <h2 className={styles.formTitle}>{screening.city}، {screening.venue}</h2><p className={styles.formSubtitle}>{screening.date} · ساعت {screening.time}</p>
      <form onSubmit={submit} className={styles.form}>
        <label>نام و نام خانوادگی<input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="نام شما" /></label>
        <label>ایمیل<input name="email" type="email" required maxLength={254} autoComplete="email" dir="ltr" placeholder="you@example.com" /></label>
        <label>تعداد صندلی<select name="quantity" defaultValue="1"><option value="1">۱ صندلی</option><option value="2">۲ صندلی</option><option value="3">۳ صندلی</option><option value="4">۴ صندلی</option></select></label>
        <p className={styles.demoNote}>اطلاعات اکران‌ها نمونه است. این فرم هیچ پرداخت یا رزرو واقعی انجام نمی‌دهد.</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <button className={styles.solidButton} disabled={pending} type="submit">{pending ? 'در حال ثبت…' : 'ثبت رزرو آزمایشی'}<ArrowLeft size={18}/></button>
      </form>
    </>}
  </Dialog>;
}

/* ────────────────────────────────────────────────────────────────
   FILM TRAILER PARALLAX SECTION
   ──────────────────────────────────────────────────────────────── */

function FilmSection({ onPlay }: { onPlay: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const clipPath = useTransform(scrollYProgress, [0,1], ['inset(8% 12% round 180px)', 'inset(0% 0% round 0px)']);
  const y = useTransform(scrollYProgress, [0,1], [-50,0]);
  return <section ref={ref} id="trailer" className={styles.filmSection} aria-label="تماشای تریلر"><motion.div className={styles.filmImage} style={reduced ? undefined : { clipPath }}>
    <motion.img src="/union/still-2.webp" alt="گردهمایی کارگران در کنار یکدیگر، نمایی از مستند اتحاد" style={reduced ? undefined : { y }} loading="lazy"/>
    <div className={styles.filmShade}/><button onClick={onPlay} className={styles.bigPlay}><Play size={28} fill="currentColor"/><span>تماشای تریلر</span><small dir="ltr">OFFICIAL TRAILER</small></button>
    <div className={styles.filmCaption}><span>یک قدم کوچک. یک تغییر بزرگ.</span><span dir="ltr">UNION — A FILM BY BRETT STORY & STEPHEN MAING</span></div>
  </motion.div></section>;
}

/* ────────────────────────────────────────────────────────────────
   GALLERY — 9-item asymmetric masonry, image-scale on enter.
   ──────────────────────────────────────────────────────────────── */

const masonryItems = [
  { key: 'g1', cls: 'masonryItem1', src: '/union/still-1.webp', caption: 'پیش از شروع یک روز دیگر', n: '۰۱' },
  { key: 'g2', cls: 'masonryItem2', src: '/union/still-2.webp', caption: 'صدایی که شنیده می‌شود', n: '۰۲' },
  { key: 'g3', cls: 'masonryItem3', src: '/union/still-3.webp', caption: 'با هم، حتی در تاریکی', n: '۰۳' },
  { key: 'g4', cls: 'masonryItem4', src: '/union/still-4.webp', caption: 'لبخندی در میانۀ اعتراض', n: '۰۴' },
  { key: 'g5', cls: 'masonryItem5', src: '/union/still-1.webp', caption: 'وقتی کنار هم ایستادیم', n: '۰۵' },
  { key: 'g6', cls: 'masonryItem6', src: '/union/still-2.webp', caption: 'پلاکاردی به‌دست', n: '۰۶' },
  { key: 'g7', cls: 'masonryItem7', src: '/union/still-3.webp', caption: 'روزهای پرکار', n: '۰۷' },
  { key: 'g8', cls: 'masonryItem8', src: '/union/still-4.webp', caption: 'لحظه‌ای از همبستگی', n: '۰۸' },
  { key: 'g9', cls: 'masonryItem9', src: '/union/still-1.webp', caption: 'پایان یک روز، آغاز روزی دیگر', n: '۰۹' },
];

function Gallery({ onOpen }: { onOpen: (i: number) => void }) {
  return <section className={styles.gallerySection} aria-label="قاب‌هایی از فیلم">
    <Reveal className={styles.sectionLabel}><span>از دلِ زندگی، روی پرده</span><span dir="ltr">STILLS FROM THE FILM</span></Reveal>
    <div className={styles.masonry}>
      {masonryItems.map((item, i) => <GalleryCell key={item.key} item={item} i={i} onOpen={onOpen} />)}
    </div>
  </section>;
}

function GalleryCell({ item, i, onOpen }: { item: typeof masonryItems[number]; i: number; onOpen: (i: number) => void }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.05 });
  return <div ref={ref} className={`${styles.imageScale} ${styles[item.cls]}`} data-in-view={inView || undefined} style={{ transitionDelay: `${i * 70}ms` }}>
    <button onClick={() => onOpen(i)} aria-label={`بزرگ‌نمایی: ${item.caption}`} style={{ all: 'unset', display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}>
      <img src={item.src} alt={item.caption} loading="lazy" />
    </button>
    <div style={{ position: 'absolute', left: 12, bottom: 12, background: 'var(--paper)', padding: '4px 10px', fontSize: 10, fontWeight: 600, color: 'var(--green)' }}>{item.n}</div>
  </div>;
}

/* ────────────────────────────────────────────────────────────────
   TEAM — slider with horizontal drag + pagination + popup modal.
   Mirrors the original Embla `team__slider` + `team-popup` widgets.
   ──────────────────────────────────────────────────────────────── */

function TeamSlider({ onSelect }: { onSelect: (i: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(team.length / 4));
  const updatePage = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(`.${styles.teamCard}`) as HTMLElement | null;
    if (!card) return;
    const w = card.getBoundingClientRect().width + 26;
    setPage(Math.round(track.scrollLeft / w));
  }, []);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', updatePage, { passive: true });
    return () => track.removeEventListener('scroll', updatePage);
  }, [updatePage]);
  const scrollBy = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(`.${styles.teamCard}`) as HTMLElement | null;
    const w = card ? card.getBoundingClientRect().width + 26 : 320;
    track.scrollBy({ left: dir * w * 4, behavior: 'smooth' });
  };
  return <>
    <div className={styles.teamSlider}><div ref={trackRef} className={styles.teamTrack}>
      {team.map((person, i) => <div key={person.name} className={styles.teamCard}>
        <button onClick={() => onSelect(i)} className={styles.teamCardInner}>
          <div className={styles.teamImage}><img src={person.image} alt={person.name} loading="lazy" /></div>
          <span className={styles.teamRole}>{person.role}</span>
          <h3 className={styles.teamName}>{person.name}</h3>
          <span className={styles.teamNameRot}>{person.name}</span>
          <span className={styles.teamPlus} aria-hidden="true"><Plus size={18} /></span>
        </button>
      </div>)}
    </div></div>
    <div className={styles.teamPagination}>
      <button onClick={() => scrollBy(-1)} aria-label="قبلی"><ArrowRight size={16} /></button>
      <div className={styles.teamDots}>{Array.from({ length: totalPages }).map((_, i) => <button key={i} aria-current={page === i} aria-label={`صفحه ${i + 1}`} onClick={() => {
        const track = trackRef.current; if (!track) return;
        const card = track.querySelector(`.${styles.teamCard}`) as HTMLElement | null;
        const w = card ? card.getBoundingClientRect().width + 26 : 320;
        track.scrollTo({ left: w * 4 * i, behavior: 'smooth' });
      }} />)}</div>
      <button onClick={() => scrollBy(1)} aria-label="بعدی"><ArrowLeft size={16} /></button>
    </div>
  </>;
}

function TeamPopup({ index, onClose }: { index: number; onClose: () => void }) {
  const person = team[index];
  return <>
    <motion.div className={styles.teamPopupBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
    <motion.aside className={styles.teamPopup} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.45, ease }}>
      <button className={styles.teamPopupClose} onClick={onClose} aria-label="بستن"><X size={20} /></button>
      <div className={styles.teamPopupImage}><img src={person.image} alt={person.name} /></div>
      <div className={styles.teamPopupInfo}><h3>{person.name}</h3><span>{person.role}</span></div>
      <p className={styles.teamPopupBio}>{person.bio}</p>
      <p className={styles.demoNote}>این معرفی، بازنویسی فارسی برای نسخه نمایشی است.</p>
    </motion.aside>
  </>;
}

/* ────────────────────────────────────────────────────────────────
   MAIN
   ──────────────────────────────────────────────────────────────── */

const navigation = [
  ['trailer', 'TRAILER'],
  ['about', 'ABOUT'],
  ['team', 'TEAM'],
  ['partners', 'PARTNERS'],
  ['press', 'PRESS'],
  ['watch', 'WATCH'],
  ['merch', 'MERCH'],
  ['contact', 'CONTACT'],
];

export default function UnionExperience({ initialScreenings }: { initialScreenings: Screening[] }) {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotionSafe();

  const [menu, setMenu] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const [paused, setPaused] = useState(false);
  const [playRequested, setPlayRequested] = useState(false);
  const previewPaused = paused || (!!reduced && !playRequested);
  const [muted, setMuted] = useState(true);
  const [activeNav, setActiveNav] = useState('');
  const [activeTeam, setActiveTeam] = useState<number | null>(null);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [booking, setBooking] = useState<Screening | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [newsletter, setNewsletter] = useState<'idle' | 'pending' | 'success'>('idle');
  const [newsletterError, setNewsletterError] = useState('');
  const [statement, setStatement] = useState(false);
  const [showFight, setShowFight] = useState(false);
  const [showMoreWatch, setShowMoreWatch] = useState(false);
  const [guide, setGuide] = useState(false);

  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const titleX = useTransform(scrollYProgress, [0,1], [0,-100]);
  const titleRightX = useTransform(scrollYProgress, [0,1], [0,100]);
  const ovalScale = useTransform(scrollYProgress, [0,0.8], [1,1.15]);
  const titleOpacity = useTransform(scrollYProgress, [0,0.8], [1,0.35]);

  /* active section for sticky right-nav + header theme */
  useEffect(() => {
    const sections = root.current?.querySelectorAll<HTMLElement>('section[id], footer[id]');
    if (!sections) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => (b.intersectionRatio - a.intersectionRatio));
      if (visible[0]) {
        const id = visible[0].target.id;
        setActiveNav(id);
      }
    }, { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.1, 0.3, 0.6] });
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    if (previewPaused || trailer) node.pause();
    else node.play().catch(() => {});
  }, [previewPaused, trailer]);
  useEffect(() => {
    const node = video.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) node.pause();
      else if (!previewPaused && !trailer) node.play().catch(() => {});
    }, { threshold: 0.1 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [previewPaused, trailer]);

  const goTo = useCallback((id: string) => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  }, [reduced]);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNewsletter('pending'); setNewsletterError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/union/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'newsletter', email: form.get('email') }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setNewsletter('success');
    } catch (err) { setNewsletter('idle'); setNewsletterError(err instanceof Error ? err.message : 'ارتباط برقرار نشد. دوباره تلاش کنید.'); }
  }

  /* dark sections flip the header & right-nav palette to lime */
  const onDark = activeNav === 'team' || activeNav === 'press' || activeNav === 'watch' || activeNav === 'contact' || activeNav === 'merch';

  const watchList = useMemo(() => {
    const items = initialScreenings.filter(item => item.status === tab);
    return showMoreWatch ? items : items.slice(0, tab === 'upcoming' ? 5 : 4);
  }, [initialScreenings, tab, showMoreWatch]);

  return <MotionConfig reducedMotion="user"><div className={styles.experience} dir="rtl" lang="fa" ref={root}>
    <a href="#about" className={styles.skipLink}>رفتن به محتوای اصلی</a>

    {guide && <div className={styles.guideOverlay} aria-hidden="true">{Array.from({ length: 12 }).map((_, i) => <span key={i} />)}</div>}
    <button className={styles.guideToggle} onClick={() => setGuide(!guide)} aria-pressed={guide} aria-label="نمایش راهنمای گرید"><Grid3x3 size={14} /></button>

    <nav className={styles.rightNav} aria-label="ناوبری اصلی">
      {navigation.map(([id, label]) => <a key={id} href={`#${id}`} data-active={activeNav === id} onClick={e => { e.preventDefault(); goTo(id); }}>{label}</a>)}
    </nav>

    <header className={`${styles.header} ${onDark ? styles.headerOnDark : ''}`}>
      <a href="#union-top" className={styles.brand} aria-label="اتحاد — ابتدای صفحه" onClick={e => { e.preventDefault(); goTo('union-top'); }}>
        <span className={styles.brandMark} aria-hidden="true"><i/><i/><i/><b/><em/></span>
        <span>اتحاد</span>
      </a>
      <nav className={styles.desktopNav} aria-label="ناوبری دسکتاپ">{navigation.slice(0, 6).map(([id, label]) => <a key={id} href={`#${id}`} data-active={activeNav === id} onClick={e => { e.preventDefault(); goTo(id); }}>{label}</a>)}</nav>
      <button className={styles.watchButton} onClick={() => goTo('watch')}>تماشای فیلم <ArrowUpLeft size={17}/></button>
      <button className={`${styles.burgerBtn} ${menu ? styles.burgerBtnOpen : ''}`} onClick={() => setMenu(!menu)} aria-label={menu ? 'بستن فهرست' : 'باز کردن فهرست'} aria-expanded={menu}><span className={styles.burgerBtnLine}/><span className={styles.burgerBtnLine}/></button>
    </header>

    <main>
      {/* HERO */}
      <section className={styles.hero} ref={hero} id="union-top">
        <HeroArrow />
        <motion.div className={styles.awards} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          {awards.map(a => <Laurel key={a.label} sub={a.sub}>{a.label}</Laurel>)}
        </motion.div>
        <motion.div className={styles.heroEyebrow} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
          <span>اتحاد؛ روایتی از قدرتِ با هم بودن</span><span className={styles.tinyDot}/><span>یک فیلم مستند</span>
        </motion.div>
        <h1 className="union:sr-only">اتحاد — UNION؛ صدای ما، قدرت ما</h1>
        <div className={styles.wordmark} dir="ltr" aria-hidden="true">
          <motion.span className={styles.wordLeft} initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.2, ease, delay: 0.05 }} style={reduced ? undefined : { x: titleX, opacity: titleOpacity }}>UNI</motion.span>
          <motion.div className={styles.ovalWrap} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease, delay: 0.35 }}>
            <motion.div className={styles.oval} style={reduced ? undefined : { scale: ovalScale }}>
              <video ref={video} src={film.trailer} poster={film.poster} muted={muted} loop playsInline preload="metadata" className={styles.heroVideo} tabIndex={-1}/>
              <div className={styles.videoShade}/>
              <button tabIndex={-1} className={styles.heroPlay} onClick={() => setTrailer(true)}><span className={styles.playCircle}><Play size={18} fill="currentColor"/></span><span>تماشای تریلر</span><small>۲ دقیقه از یک داستان واقعی</small></button>
              <span className={styles.ovalLabel}>A STORY OF TOGETHERNESS</span>
            </motion.div>
          </motion.div>
          <motion.span className={styles.wordRight} initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.2, ease, delay: 0.17 }} style={reduced ? undefined : { x: titleRightX, opacity: titleOpacity }}>N</motion.span>
        </div>
        <button className={styles.accessibleTrailer} onClick={() => setTrailer(true)}>تماشای تریلر فیلم اتحاد <Play size={14}/></button>
        <motion.div className={styles.credits} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}>
          <div><span>کارگردانان</span><strong>برت استوری و استیون مینگ</strong></div>
          <div><span>تهیه‌کنندگان</span><strong>سامانتا کرلی و مارس ورون</strong></div>
          <div><span>فیلم‌بردار</span><strong>مارتین دی‌چیکو</strong></div>
          <div><span>تدوین</span><strong>بلر مک‌کلندون</strong></div>
          <div><span>موسیقی متن</span><strong>رابرت آیکی آبری لو</strong></div>
        </motion.div>
        <div className={styles.heroBottom}>
          <span>آدم‌های معمولی. یک حرکتِ غیرمعمولی.</span>
          <button onClick={() => goTo('about')} className={styles.scrollPrompt}>برای کشف داستان، اسکرول کنید <ArrowDown size={16}/></button>
          <div className={styles.videoControls}>
            <span dir="ltr">۲۰۲۴ / ۱۰۲ دقیقه</span>
            <button onClick={() => { setPlayRequested(true); setPaused(!previewPaused); }} className={styles.iconButton} aria-label={previewPaused ? 'پخش پیش‌نمایش' : 'توقف پیش‌نمایش'} aria-pressed={previewPaused}>{previewPaused ? <Play size={14}/> : <Pause size={14}/>}</button>
            <button onClick={() => setMuted(!muted)} className={styles.iconButton} aria-label={muted ? 'فعال کردن صدای پیش‌نمایش' : 'قطع صدای پیش‌نمایش'} aria-pressed={!muted}>{muted ? <VolumeX size={15}/> : <Volume2 size={15}/>}</button>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className={styles.intro} id="about">
        <Reveal className={styles.sectionLabel}><span>۰۱ — درباره فیلم</span><span>داستانی که باید شنید</span></Reveal>
        <Reveal className={styles.quote}>
          <span className={styles.quoteSource}>« نیویورک تایمز »</span>
          <h2><BlurText>شگفت‌انگیز،</BlurText><br/><span className={styles.underlined}><BlurText>جسور و درخشان.</BlurText></span></h2>
          <svg viewBox="0 0 600 220" className={styles.scribble} aria-hidden="true"><motion.path d="M 555 28 L 59 100 L 510 126 L 94 195" stroke="currentColor" strokeWidth="37" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.3, delay: 0.3 }}/></svg>
        </Reveal>
        <div className={styles.storyGrid}>
          <Reveal><h3><BlurText>وقتی یک نفر می‌گوید «ما»،</BlurText><br/><BlurText>همه‌چیز تغییر می‌کند.</BlurText></h3><p className={styles.storyMeta}><Scramble text="اتحاد / مستند بلند / ۲۰۲۴" /></p></Reveal>
          <Reveal delay={0.12}>
            <p>گروهی از کارگران معمولی، در برابر یکی از قدرتمندترین شرکت‌های جهان می‌ایستند. نه با قدرت و سرمایه، بلکه با چیزی ساده‌تر: <strong>باور به یکدیگر.</strong></p>
            <p>«اتحاد» روایت نزدیک و بی‌واسطه آدم‌هایی است که تصمیم گرفتند صدایشان را یکی کنند. داستانی از دوستی، تردید، شجاعت و امید؛ از نیویورک تا هر جایی که آدم‌ها برای فردایی بهتر کنار هم می‌ایستند.</p>
            <button className={styles.textLink} onClick={() => setStatement(true)}>یادداشت کارگردانان <ArrowUpLeft size={20}/></button>
          </Reveal>
        </div>
      </section>

      <FilmSection onPlay={() => setTrailer(true)} />

      <Gallery onOpen={(i) => setLightbox(i)} />

      {/* TEAM — slider + additional crew */}
      <section className={styles.teamSection} id="team">
        <Reveal className={styles.sectionLabel}><span>۰۲ — سازندگان</span><span>پشت هر روایت، یک جمع</span></Reveal>
        <BlurText as="h2" className={styles.sectionTitle}>پشتِ این هم‌صدایی.</BlurText>
        <TeamSlider onSelect={(i) => setActiveTeam(i)} />
        <Reveal className={styles.crewSection} delay={0.05}>
          {additionalCrew.map(group => <dl key={group.id} className={styles.crewBlock}>
            <dt><Scramble text={group.heading} /></dt>
            <dd>{group.items.map((name, i) => <span key={i}>{name}</span>)}</dd>
          </dl>)}
        </Reveal>
      </section>

      {/* STATEMENT LIST — dark, 4 alternating */}
      <section className={`${styles.statementSection} ${styles.darkSection}`} id="statement">
        <div className={styles.statementList}>
          {statements.map((s, i) => <StatementItem key={i} index={i} item={s} />)}
        </div>
      </section>

      {/* PARTNERS — marquee */}
      <section className={styles.partnersSection} id="partners">
        <Reveal><p>داستان‌های بزرگ، با همراهی ساخته می‌شوند.</p></Reveal>
        <Reveal><h2 className={styles.partnersHeadline}>
          <span className={styles.headingArrow}><HeadingArrow /></span>
          حامیان و شرکای فیلم
        </h2></Reveal>
        <div className={styles.partnersRows}>
          <MarqueeRow items={partners.slice(0, 6)} />
          <MarqueeRow items={partners.slice(5, 11)} reverse />
        </div>
      </section>

      {/* PRESS — slider */}
      <section className={styles.pressSection} id="press">
        <Reveal className={styles.sectionLabel}><span>۰۴ — مطبوعات</span><span>صدای منتقدان</span></Reveal>
        <Reveal><h2 className={styles.sectionTitle}>
          <span className={styles.headingArrow}><HeadingArrow /></span>
          بازتاب از مطبوعات
        </h2></Reveal>
        <PressSlider />
      </section>

      {/* WATCH FILM — toggle + list */}
      <section className={`${styles.watchSection} ${styles.darkSection}`} id="watch">
        <h2 className={styles.watchHeadline}>تماشای فیلم</h2>
        <div className={styles.watchToggle} role="tablist" aria-label="زمان اکران">
          <span className={tab === 'upcoming' ? styles.active : styles.muted} role="tab" aria-selected={tab === 'upcoming'}>UPCOMING SCREENINGS</span>
          <button className={styles.toggleSwitch} data-on={tab === 'past'} onClick={() => setTab(tab === 'upcoming' ? 'past' : 'upcoming')} role="tab" aria-selected={tab === 'past'} aria-label="تغییر نمایش"><span className={styles.toggleKnob} /></button>
          <span className={tab === 'past' ? styles.active : styles.muted} role="tab" aria-selected={tab === 'past'}>PAST SCREENINGS</span>
        </div>
        <div className={styles.watchList} role="tabpanel">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {watchList.length === 0 ? <div className={styles.watchEmpty}>اکرانی برای نمایش یافت نشد.</div> : watchList.map(item => <div key={item.id} className={styles.watchRow}>
                <div className={styles.watchVenue}>{item.venue}<div className={styles.watchDate}>{item.city} <small>{item.date}</small></div></div>
                <div className={styles.watchDate}>{item.time}<small>{item.detail}</small></div>
                <div className={styles.watchDate}>{tab === 'upcoming' ? 'محدود' : 'برگزار شد'}<small>{tab === 'upcoming' ? 'پیش از پایان بلیت' : 'گزارش تصویری'}</small></div>
                {tab === 'upcoming' ? <button className={styles.watchTickets} onClick={() => setBooking(item)}>خرید بلیت <ArrowUpLeft size={16} /></button> : <a href="#" className={styles.watchTickets}>گزارش <ArrowUpLeft size={16} /></a>}
              </div>)}
            </motion.div>
          </AnimatePresence>
        </div>
        {watchList.length < initialScreenings.filter(s => s.status === tab).length && <div className={styles.watchMore}><button onClick={() => setShowMoreWatch(true)}>نمایش بیشتر</button></div>}
      </section>

      {/* FIGHT — truncate/expand */}
      <section className={styles.fightSection} id="fight" aria-hidden={activeNav !== 'fight' && false}>
        <Reveal className={styles.sectionLabel}><span>۰۵ — چرا این فیلم</span><span>نبرد برای کار شایسته</span></Reveal>
        <Reveal><h2 className={styles.sectionTitle}><span className={styles.headingArrow}><HeadingArrow /></span>نبرد برای کار شایسته</h2></Reveal>
        <div className={styles.fightLayout}>
          <Reveal><p className={styles.storyMeta}><Scramble text="اتحاد / درباره‌ی فیلم / بخش دوم" /></p></Reveal>
          <div className={`${styles.fightText} ${!showFight ? styles.truncated : ''}`}>
            <p>با ۱/۵ میلیون کارمند در سراسر جهان، آمازون فعالانه در حال تعیین استاندارد آینده‌ی کار است؛ آینده‌ای که با اتوماسیون، نظارت، نبود ایمنی و نرخ ترک کار تا ۱۵۰٪ تعریف می‌شود. در آمریکا، با وجود افزایش اعتصابات و تحصن‌های کارگری در سال گذشته، نرخ اتحادیه‌ای‌شدن به پایین‌ترین حد تاریخ رسیده است.</p>
            <p>اداره آمار کار آمریکا گزارش کرده که فقط ۱۰٪ کارگران ساعتی و حقوق‌بگیر عضو اتحادیه هستند. به‌تازگی، آمازون به همراه اسپیس‌ایکس ایلان ماسک و تریدر جو، در نبرد حقوقی برای اعلام غیرقانونی بودن هیئت ملی روابط کار پیوسته است.</p>
            {showFight && <>
              <p>ما باور داریم که فیلم‌ها می‌توانند الهام‌بخش یادگیری، سازمان‌دهی و عمل باشند. «اتحاد» به‌عنوان یک پرتره سینمایی از یک جنبش، به‌طور ویژه می‌تواند الهام‌بخش کارگران باشد تا درباره شرایط محل کارشان با هم گفت‌وگو کنند.</p>
              <p>ما پس از هر اکران بازخوردهایی مستقیم از سازمان‌دهندگان دریافت کرده‌ایم که نشان می‌دهد این فیلم ابزاری ضروری برای کار آن‌هاست. این اصل پرورش ارتباط میان کارگران، بنیان تأثیر «اتحاد» است.</p>
            </>}
            <button className={styles.fightRead} onClick={() => setShowFight(!showFight)}>{showFight ? 'نمایش کمتر' : 'ادامه مطلب'} <ArrowUpLeft size={16} /></button>
          </div>
        </div>
      </section>

      {/* MERCH */}
      <section className={styles.merchSection} id="merch">
        <Reveal><h2 className={styles.merchHeadline}><span className={styles.headingArrow}><HeadingArrow /></span>محصولات ویژه‌ی فیلم</h2></Reveal>
        <MerchSlider />
      </section>
    </main>

    {/* FOOTER — dark, mirrors original */}
    <footer className={`${styles.footer} ${styles.darkSection}`} id="contact">
      <div className={styles.footerBg} aria-hidden="true" />
      <div className={styles.footerTop}>
        <div>
          <a className={styles.footerDownload} href="#" onClick={e => e.preventDefault()}>
            <Download size={18} />
            <span>دانلود عکس و پوسترها</span>
          </a>
          <div className={styles.footerLists}>
            <ul className={styles.footerList}>
              {footerSocials.map(s => <li key={s}><a href="#" onClick={e => e.preventDefault()}>{s}</a></li>)}
            </ul>
            <ul className={styles.footerList}>
              {footerNav.map(s => <li key={s}><a href={`#${s.toLowerCase()}`} onClick={e => { e.preventDefault(); goTo(s.toLowerCase()); }}>{s}</a></li>)}
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.footerEmailBlock}>
        <BlurText as="h2" className={styles.footerEmailHeading}>{footerEmail}</BlurText>
        <Reveal className={styles.footerNewsletter}>
          {newsletter === 'success' ? <div className={styles.footerNewsletterSuccess} role="status"><Check size={20} /><span>عضویت آزمایشی ثبت شد. در این نسخه ایمیلی ارسال نمی‌شود.</span></div> : <form onSubmit={subscribe}>
            <label htmlFor="union-newsletter">عضو خبرنامه شوید</label>
            <div className={styles.emailInput}>
              <input id="union-newsletter" type="email" name="email" dir="ltr" placeholder="Your email address" required maxLength={254} autoComplete="email" />
              <button type="submit" disabled={newsletter === 'pending'} aria-label="عضویت">{newsletter === 'pending' ? '…' : '→'}</button>
            </div>
            <small>فقط خبرهای خوب. بدون پیام‌های اضافه. <span>(نسخه آزمایشی)</span></small>
            {newsletterError && <p className={styles.error} role="alert">{newsletterError}</p>}
          </form>}
        </Reveal>
      </div>
      <div className={styles.footerCopyright}>
        <span>© {new Date().getFullYear()} UNION Film. تمامی حقوق محفوظ است.</span>
        <span>ساخته شده با عشق برای روایت‌های جمعی <a href="#union-top" onClick={e => { e.preventDefault(); goTo('union-top'); }}>اتحاد</a></span>
      </div>
    </footer>

    {/* dialogs */}
    {menu && <Dialog title="اتحاد / فهرست" onClose={() => setMenu(false)}><nav className={styles.mobileNav} aria-label="ناوبری موبایل">{navigation.map(([id, label], i) => <a href={`#${id}`} key={id} onClick={e => { e.preventDefault(); goTo(id); }}><small>۰{i+1}</small>{label}<ArrowUpLeft/></a>)}</nav><p className={styles.demoNote}>صدای ما، قدرت ما. مستند اتحاد.</p></Dialog>}
    {trailer && <Dialog title="اتحاد — تریلر رسمی" onClose={() => setTrailer(false)} wide><video className={styles.trailerPlayer} src={film.trailer} poster={film.poster} controls autoPlay playsInline/><div className={styles.trailerMeta}><span>اتحاد، ساخته برت استوری و استیون مینگ</span><small>تریلر اصلی · زبان انگلیسی</small></div></Dialog>}
    {booking && <Reservation screening={booking} onClose={() => setBooking(null)}/>}
    {lightbox !== null && <Dialog title={masonryItems[lightbox]?.caption ?? ''} onClose={() => setLightbox(null)} wide><img className={styles.lightboxImage} src={masonryItems[lightbox]?.src} alt={masonryItems[lightbox]?.caption} /><div className={styles.lightboxControls}><button className={styles.textLink} onClick={() => setLightbox(((lightbox ?? 0) + masonryItems.length - 1) % masonryItems.length)}>تصویر قبلی</button><span>{(lightbox ?? 0) + 1} / {masonryItems.length}</span><button className={styles.textLink} onClick={() => setLightbox(((lightbox ?? 0) + 1) % masonryItems.length)}>تصویر بعدی <ArrowLeft size={18}/></button></div></Dialog>}
    {statement && <Dialog title="یادداشت کارگردانان" onClose={() => setStatement(false)}><article className={styles.fullStatement}><span>برت استوری و استیون مینگ</span><h2>دوربین، در کنار آدم‌ها.</h2><p>برای ما، ساختن «اتحاد» فرصتی بود برای نزدیک شدن به زندگی آدم‌هایی که هر روز، با وجود خستگی و تردید، تصمیم می‌گیرند ادامه دهند. ما می‌خواستیم دوربین نه از بالا، که در کنار آن‌ها باشد.</p><p>این داستان فقط درباره یک شرکت یا یک شهر نیست. درباره پرسشی است که همه ما به شکلی با آن روبه‌رو شده‌ایم: وقتی تنها توان تغییر چیزی را نداریم، کنار هم چه می‌توانیم بکنیم؟</p><p>ما به قدرت سینما برای آغاز گفت‌وگو باور داریم. امیدواریم این فیلم، بهانه‌ای باشد برای شنیدن یکدیگر؛ برای دیدن آدم‌های پشت هر کار، و برای تصور آینده‌ای که سهم همه ما در آن بیشتر است.</p><small>بازنویسی فارسی برای نسخه نمایشی؛ نقل‌قول مستقیم از سازندگان نیست.</small><button className={styles.solidButton} onClick={() => { setStatement(false); goTo('watch'); }}>به تماشای اتحاد بیایید <MoveUpRight size={18}/></button></article></Dialog>}
    <AnimatePresence>{activeTeam !== null && <TeamPopup key="popup" index={activeTeam} onClose={() => setActiveTeam(null)} />}</AnimatePresence>
  </div></MotionConfig>;
}

/* ────────────────────────────────────────────────────────────────
   STATEMENT ITEM (with scramble + image-scale on view)
   ──────────────────────────────────────────────────────────────── */

function StatementItem({ item, index }: { item: typeof statements[number]; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const isRevers = index % 2 === 1;
  return <article ref={ref} className={`${styles.statementItem} ${isRevers ? styles.revers : ''}`}>
    <div className={styles.statementText}>
      <h3><Scramble text={item.heading} /></h3>
      <p><Scramble text={item.paragraph} speed={20} /></p>
      {item.link && <a href="#" onClick={e => e.preventDefault()} className={styles.readMore}>{item.link} <ArrowLeft size={14} /></a>}
    </div>
    <div className={`${styles.statementImage}`} data-in-view={inView || undefined}><img src={item.image} alt={item.heading} loading="lazy" /></div>
  </article>;
}

/* ────────────────────────────────────────────────────────────────
   PRESS SLIDER
   ──────────────────────────────────────────────────────────────── */

function PressSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const updatePage = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(`.${styles.pressCard}`) as HTMLElement | null;
    if (!card) return;
    const w = card.getBoundingClientRect().width + 24;
    setPage(Math.round(track.scrollLeft / w));
  }, []);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', updatePage, { passive: true });
    return () => track.removeEventListener('scroll', updatePage);
  }, [updatePage]);
  useEffect(() => {
    const calc = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      setPerPage(w < 800 ? 1 : w < 1100 ? 2 : 3);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  const totalPages = Math.max(1, Math.ceil(press.length / perPage));
  const scrollBy = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(`.${styles.pressCard}`) as HTMLElement | null;
    const w = card ? card.getBoundingClientRect().width + 24 : 320;
    track.scrollBy({ left: dir * w * perPage, behavior: 'smooth' });
  };
  return <>
    <div className={styles.pressTrack} ref={trackRef}>
      {press.map((p, i) => <div key={i} className={styles.pressCard}>
        <div><div className={styles.pressOutlet}>{p.outlet}</div><div className={styles.pressAuthor}>({p.author})</div></div>
        <p className={styles.pressQuote}>{p.text}</p>
        <a href={p.link} className={styles.pressRead} onClick={e => e.preventDefault()}>بیشتر بخوانید <ArrowUpLeft size={14} /></a>
      </div>)}
    </div>
    <div className={styles.pressControls}>
      <button onClick={() => scrollBy(-1)} aria-label="قبلی"><ChevronRight size={16} /></button>
      <div className={styles.pressDots}>{Array.from({ length: totalPages }).map((_, i) => <button key={i} aria-current={page === i} aria-label={`صفحه ${i + 1}`} onClick={() => {
        const track = trackRef.current; if (!track) return;
        const card = track.querySelector(`.${styles.pressCard}`) as HTMLElement | null;
        const w = card ? card.getBoundingClientRect().width + 24 : 320;
        track.scrollTo({ left: w * perPage * i, behavior: 'smooth' });
      }} />)}</div>
      <button onClick={() => scrollBy(1)} aria-label="بعدی"><ChevronLeft size={16} /></button>
    </div>
  </>;
}

/* ────────────────────────────────────────────────────────────────
   MERCH SLIDER
   ──────────────────────────────────────────────────────────────── */

function MerchSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(`.${styles.merchCard}`) as HTMLElement | null;
    const w = card ? card.getBoundingClientRect().width + 14 : 320;
    track.scrollBy({ left: dir * w, behavior: 'smooth' });
  };
  return <>
    <div className={styles.merchTrack} ref={trackRef}>
      {merch.map((m, i) => <div key={i} className={styles.merchCard}>
        <div className={styles.merchImage}><img src={m.image} alt={m.title} loading="lazy" /></div>
        <div className={styles.merchTitle}>{m.title}</div>
      </div>)}
    </div>
    <div className={styles.merchControls}>
      <button onClick={() => scrollBy(-1)} aria-label="قبلی"><ArrowRight size={16} /></button>
      <button onClick={() => scrollBy(1)} aria-label="بعدی"><ArrowLeft size={16} /></button>
    </div>
  </>;
}