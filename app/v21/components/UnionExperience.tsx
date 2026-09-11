'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpLeft, ArrowDown, ArrowLeft, ArrowUp, Play, Pause, Plus, Minus, X, Menu, Check, Volume2, VolumeX, MoveUpRight } from 'lucide-react';
import { film, team, type Screening } from '../data';
import styles from './union.module.css';
import './union.tailwind.css';

const navigation = [ ['trailer', 'تریلر'], ['about', 'درباره فیلم'], ['team', 'عوامل فیلم'], ['watch', 'اکران‌ها'], ['contact', 'در ارتباط باشیم'] ];
const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: 0, y: reduced ? 0 : 32, filter: reduced ? 'none' : 'blur(5px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: reduced ? 0 : 0.85, ease, delay }}>{children}</motion.div>;
}

function Laurel({ children, sub }: { children: ReactNode; sub: string }) {
  return <div className={styles.laurel}><svg viewBox="0 0 34 76" fill="none" aria-hidden="true"><path d="M29 71C4 56 4 28 24 5" stroke="currentColor" strokeWidth="1.4" />{[0,1,2,3,4,5].map(i => <g key={i} transform={`translate(${i < 3 ? 13 - i * 3 : 7 + (i - 3) * 2},${9 + i * 9}) rotate(${i * -12})`}><ellipse cx="-4" cy="3" rx="2.7" ry="7" fill="currentColor" transform="rotate(-30)"/><ellipse cx="4" cy="0" rx="2.7" ry="6" fill="currentColor" transform="rotate(35)"/></g>)}</svg><div><small>{sub}</small><strong>{children}</strong><span>۲۰۲۴</span></div><svg viewBox="0 0 34 76" fill="none" aria-hidden="true"><path d="M29 71C4 56 4 28 24 5" stroke="currentColor" strokeWidth="1.4" />{[0,1,2,3,4,5].map(i => <g key={i} transform={`translate(${i < 3 ? 13 - i * 3 : 7 + (i - 3) * 2},${9 + i * 9}) rotate(${i * -12})`}><ellipse cx="-4" cy="3" rx="2.7" ry="7" fill="currentColor" transform="rotate(-30)"/><ellipse cx="4" cy="0" rx="2.7" ry="6" fill="currentColor" transform="rotate(35)"/></g>)}</svg></div>;
}

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

function FilmSection({ onPlay }: { onPlay: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const clipPath = useTransform(scrollYProgress, [0,1], ['inset(8% 12% round 180px)', 'inset(0% 0% round 0px)']);
  const y = useTransform(scrollYProgress, [0,1], [-50,0]);
  return <section ref={ref} id="trailer" className={styles.filmSection} aria-label="تماشای تریلر"><motion.div className={styles.filmImage} style={reduced ? undefined : { clipPath }}>
    <motion.img src="/union/still-2.webp" alt="گردهمایی کارگران در کنار یکدیگر، نمایی از مستند اتحاد" style={reduced ? undefined : { y }} loading="lazy"/>
    <div className={styles.filmShade}/><button onClick={onPlay} className={styles.bigPlay}><Play size={28} fill="currentColor"/><span>تماشای تریلر</span><small dir="ltr">OFFICIAL TRAILER</small></button>
    <div className={styles.filmCaption}><span>یک قدم کوچک. یک تغییر بزرگ.</span><span dir="ltr">UNION — A FILM BY BRETT STORY & STEPHEN MAING</span></div>
  </motion.div></section>;
}

export default function UnionExperience({ initialScreenings }: { initialScreenings: Screening[] }) {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
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
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const titleX = useTransform(scrollYProgress, [0,1], [0,-100]);
  const titleRightX = useTransform(scrollYProgress, [0,1], [0,100]);
  const ovalScale = useTransform(scrollYProgress, [0,0.8], [1,1.15]);
  const titleOpacity = useTransform(scrollYProgress, [0,0.8], [1,0.35]);
  const galleryImages = ['/union/still-1.webp', '/union/still-3.webp', '/union/still-4.webp'];
  const galleryCaptions = ['پیش از شروع یک روز دیگر', 'صدایی که شنیده می‌شود', 'با هم، حتی در تاریکی'];

  useEffect(() => {
    const sections = root.current?.querySelectorAll('section[id], footer[id]');
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) setActiveNav(entry.target.id); }); }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
    sections?.forEach(section => observer.observe(section));
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

  function goTo(id: string) {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  }
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

  return <MotionConfig reducedMotion="user"><div className={styles.experience} dir="rtl" lang="fa" ref={root}>
    <a href="#about" className={styles.skipLink}>رفتن به محتوای اصلی</a>
    <header className={styles.header}>
      <a href="#union-top" className={styles.brand} aria-label="اتحاد — ابتدای صفحه" onClick={e => { e.preventDefault(); goTo('union-top'); }}><span className={styles.brandMark} aria-hidden="true"><i/><i/><i/><b/><em/></span><span>اتحاد</span></a>
      <nav className={styles.desktopNav} aria-label="ناوبری اصلی">{navigation.map(([id,label]) => <a key={id} href={`#${id}`} data-active={activeNav === id} onClick={e => { e.preventDefault(); goTo(id); }}>{label}</a>)}</nav>
      <button className={styles.watchButton} onClick={() => goTo('watch')}>تماشای فیلم <ArrowUpLeft size={17}/></button>
      <button className={`${styles.iconButton} ${styles.menuButton}`} onClick={() => setMenu(true)} aria-label="باز کردن فهرست" aria-expanded={menu}><Menu/></button>
    </header>

    <main>
      <section className={styles.hero} ref={hero} id="union-top">
        <motion.div className={styles.awards} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <Laurel sub="برنده جایزه ویژه هیئت داوران">ساندنس</Laurel><Laurel sub="نمایش پیشنهادی · نسخه نمونه">سینما حقیقت</Laurel><Laurel sub="انتخاب رسمی جشنواره">هات داکس</Laurel><Laurel sub="انتخاب رسمی جشنواره">شفیلد داک‌فست</Laurel><Laurel sub="انتخاب رسمی جشنواره">ویژنز دو رئل</Laurel>
        </motion.div>
        <motion.div className={styles.heroEyebrow} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}><span>اتحاد؛ روایتی از قدرتِ با هم بودن</span><span className={styles.tinyDot}/><span>یک فیلم مستند</span></motion.div>
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
          <div><span>کارگردانان</span><strong>برت استوری و استیون مینگ</strong></div><div><span>تهیه‌کنندگان</span><strong>سامانتا کرلی و مارس ورون</strong></div><div><span>فیلم‌بردار</span><strong>مارتین دی‌چیکو</strong></div><div><span>تدوین</span><strong>بلر مک‌کلندون</strong></div><div><span>موسیقی متن</span><strong>رابرت آیکی آبری لو</strong></div>
        </motion.div>
        <div className={styles.heroBottom}><span>آدم‌های معمولی. یک حرکتِ غیرمعمولی.</span><button onClick={() => goTo('about')} className={styles.scrollPrompt}>برای کشف داستان، اسکرول کنید <ArrowDown size={16}/></button><div className={styles.videoControls}><span dir="ltr">۲۰۲۴ / ۱۰۲ دقیقه</span><button onClick={() => { setPlayRequested(true); setPaused(!previewPaused); }} className={styles.iconButton} aria-label={previewPaused ? 'پخش پیش‌نمایش' : 'توقف پیش‌نمایش'} aria-pressed={previewPaused}>{previewPaused ? <Play size={14}/> : <Pause size={14}/>}</button><button onClick={() => setMuted(!muted)} className={styles.iconButton} aria-label={muted ? 'فعال کردن صدای پیش‌نمایش' : 'قطع صدای پیش‌نمایش'} aria-pressed={!muted}>{muted ? <VolumeX size={15}/> : <Volume2 size={15}/>}</button></div></div>
      </section>

      <section className={styles.intro} id="about">
        <Reveal className={styles.sectionLabel}><span>۰۱ — درباره فیلم</span><span>داستانی که باید شنید</span></Reveal>
        <Reveal className={styles.quote}><span className={styles.quoteSource}>« نیویورک تایمز »</span><h2>شگفت‌انگیز،<br/><span className={styles.underlined}>جسور و درخشان.</span></h2><svg viewBox="0 0 600 220" className={styles.scribble} aria-hidden="true"><motion.path d="M 555 28 L 59 100 L 510 126 L 94 195" stroke="currentColor" strokeWidth="37" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.3, delay: 0.3 }}/></svg></Reveal>
        <div className={styles.storyGrid}><Reveal><h3>وقتی یک نفر می‌گوید «ما»،<br/>همه‌چیز تغییر می‌کند.</h3><p className={styles.storyMeta}>اتحاد / مستند بلند / ۲۰۲۴<br/>زبان اصلی با زیرنویس فارسی</p></Reveal><Reveal delay={0.12}><p>گروهی از کارگران معمولی، در برابر یکی از قدرتمندترین شرکت‌های جهان می‌ایستند. نه با قدرت و سرمایه، بلکه با چیزی ساده‌تر: <strong>باور به یکدیگر.</strong></p><p>«اتحاد» روایت نزدیک و بی‌واسطه آدم‌هایی است که تصمیم گرفتند صدایشان را یکی کنند. داستانی از دوستی، تردید، شجاعت و امید؛ از نیویورک تا هر جایی که آدم‌ها برای فردایی بهتر کنار هم می‌ایستند.</p><button className={styles.textLink} onClick={() => setStatement(true)}>یادداشت کارگردانان <ArrowUpLeft size={20}/></button></Reveal></div>
      </section>

      <FilmSection onPlay={() => setTrailer(true)}/>

      <section className={styles.gallerySection} aria-label="قاب‌هایی از فیلم"><Reveal className={styles.sectionLabel}><span>از دلِ زندگی، روی پرده</span><span dir="ltr">STILLS FROM THE FILM</span></Reveal><div className={styles.gallery}>{galleryImages.map((src,i) => <Reveal key={src} delay={i*0.1} className={styles.galleryItem}><button onClick={() => setLightbox(i)} aria-label={`بزرگ‌نمایی تصویر: ${galleryCaptions[i]}`}><img src={src} alt={galleryCaptions[i]} loading="lazy"/><span className={styles.imageExpand}><Plus size={23}/></span></button><div><span>{galleryCaptions[i]}</span><span>۰{i+1}</span></div></Reveal>)}</div></section>

      <section className={styles.teamSection} id="team"><Reveal className={styles.sectionLabel}><span>۰۲ — سازندگان</span><span>پشت هر روایت، یک جمع</span></Reveal><Reveal><h2 className={styles.sectionTitle}>پشتِ این <span>هم‌صدایی.</span></h2></Reveal><div className={styles.teamGrid}>{team.map((person,i) => <Reveal key={person.name} delay={i*0.08}><button className={styles.teamCard} onClick={() => setActiveTeam(activeTeam === i ? null : i)} aria-expanded={activeTeam === i} aria-controls={`union-person-${i}`}><div className={styles.teamImage}><img src={person.image} alt={person.name} loading="lazy"/><span className={styles.teamPlus}>{activeTeam === i ? <Minus size={22}/> : <Plus size={22}/>}</span></div><span className={styles.teamRole}>{person.role}</span><h3>{person.name}</h3></button><AnimatePresence>{activeTeam === i && <motion.div id={`union-person-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={styles.teamBio}><p>{person.bio}</p></motion.div>}</AnimatePresence></Reveal>)}</div><Reveal className={styles.additionalCredits}><span>و با همراهی</span><p>مارتین دی‌چیکو <small>فیلم‌بردار</small></p><p>بلر مک‌کلندون <small>تدوینگر</small></p><p>رابرت آیکی آبری لو <small>آهنگساز</small></p></Reveal></section>

      <section className={styles.statementSection}><div className={styles.statementImage}><img src="/union/still-4.webp" alt="همراهی و گفت‌وگوی کارگران زیر نور چراغ‌ها در شب" loading="lazy"/></div><Reveal className={styles.statementText}><span className={styles.sectionLabel}>یادداشت سازندگان</span><h2>قدرت، از جایی شروع می‌شود که <em>تنها نیستیم.</em></h2><p>این فیلم درباره یک پیروزی نیست؛ درباره راهی است که با هم می‌رویم. درباره شنیدن، اعتماد کردن و دوباره شروع کردن، حتی وقتی همه می‌گویند نمی‌شود.</p><button className={styles.textLink} onClick={() => setStatement(true)}>بیشتر بخوانید <ArrowUpLeft size={20}/></button></Reveal></section>

      <section className={styles.screeningsSection} id="watch"><Reveal className={styles.sectionLabel}><span>۰۳ — اکران‌های فیلم</span><span>روی پرده، کنار هم</span></Reveal><div className={styles.screeningHeading}><Reveal><h2 className={styles.sectionTitle}>با هم <span>ببینیم.</span></h2></Reveal><Reveal><p>داستان روی پرده تمام نمی‌شود.<br/>به جمع تماشاگران اتحاد بپیوندید.</p></Reveal></div><div className={styles.tabs} role="tablist" aria-label="زمان اکران">{(['upcoming','past'] as const).map(t => <button key={t} role="tab" id={`union-tab-${t}`} aria-selected={tab === t} aria-controls="union-screenings-panel" tabIndex={tab === t ? 0 : -1} onKeyDown={e => { if (['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 'upcoming' : e.key === 'End' ? 'past' : t === 'upcoming' ? 'past' : 'upcoming'; setTab(next); document.getElementById(`union-tab-${next}`)?.focus(); } }} onClick={() => setTab(t)} className={tab === t ? styles.activeTab : ''}>{t === 'upcoming' ? 'اکران‌های پیش رو' : 'اکران‌های گذشته'}<span>{t === 'upcoming' ? '۰۳' : '۰۲'}</span></button>)}</div><div id="union-screenings-panel" role="tabpanel" aria-labelledby={`union-tab-${tab}`} tabIndex={0}><AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{initialScreenings.filter(item => item.status === tab).map(item => <div className={styles.screeningRow} key={item.id}><div className={styles.screeningCity}><span>{item.city}</span><small>{item.detail}</small></div><span className={styles.venue}>{item.venue}</span><div className={styles.screeningDate}>{item.date}<small>ساعت {item.time}</small></div>{tab === 'upcoming' ? <button className={styles.bookingButton} onClick={() => setBooking(item)}>رزرو صندلی <ArrowUpLeft size={20}/></button> : <span className={styles.ended}>برگزار شد <Check size={16}/></span>}</div>)}</motion.div></AnimatePresence></div><p className={styles.screeningDisclaimer}><span className={styles.tinyDot}/> برنامه اکران‌ها و رزروها در این نسخه، نمایشی و آزمایشی هستند.</p></section>

      <section className={styles.partnersSection}><Reveal><p>داستان‌های بزرگ، با همراهی ساخته می‌شوند.</p><div className={styles.partners} dir="ltr"><strong>LEVEL<br/><span>GROUND</span></strong><strong className={styles.partnerThin}>+impact<span>partners</span></strong><strong>FIELD OF VISION</strong><strong className={styles.partnerCircle}>sundance<small>institute</small></strong><strong>ANONYMOUS<small>CONTENT</small></strong></div></Reveal></section>
    </main>

    <footer className={styles.footer} id="contact"><div className={styles.footerTop}><Reveal><span className={styles.sectionLabel}>پایان فیلم، آغاز گفت‌وگو</span><h2>در ارتباط <span>بمانیم.</span></h2><p>از اکران‌های تازه و خبرهای اتحاد باخبر شوید.</p></Reveal><Reveal className={styles.newsletter}>{newsletter === 'success' ? <div className={styles.newsletterSuccess} role="status"><Check size={26}/><h3>به جمع ما خوش آمدید.</h3><p>عضویت آزمایشی ثبت شد؛ در این نسخه ایمیلی ارسال نمی‌شود.</p><button className={styles.textLink} onClick={() => setNewsletter('idle')}>ثبت ایمیل دیگر <ArrowLeft size={18}/></button></div> : <form onSubmit={subscribe}><label htmlFor="union-newsletter">ایمیل شما</label><div className={styles.emailInput}><input id="union-newsletter" type="email" name="email" dir="ltr" placeholder="Your email address" required maxLength={254} autoComplete="email"/><button type="submit" disabled={newsletter === 'pending'} aria-label="عضویت در خبرنامه">{newsletter === 'pending' ? '…' : <ArrowUpLeft size={30}/>}</button></div><small>فقط خبرهای خوب. بدون پیام‌های اضافه. <span>(نسخه آزمایشی)</span></small>{newsletterError && <p className={styles.error} role="alert">{newsletterError}</p>}</form>}</Reveal></div><div className={styles.footerWordmark} dir="ltr" aria-hidden="true">UNION<span>با هم، صدای بلندتری هستیم.</span></div><div className={styles.footerBottom}><span>© ۱۴۰۵ اتحاد — نسخه فارسی و نمایشی</span><span>یک فیلم. یک جمع. یک صدا.</span><button onClick={() => goTo('union-top')}>بازگشت به بالا <ArrowUp size={17}/></button></div></footer>

    {menu && <Dialog title="اتحاد / فهرست" onClose={() => setMenu(false)}><nav className={styles.mobileNav} aria-label="ناوبری موبایل">{navigation.map(([id,label],i) => <a href={`#${id}`} key={id} onClick={e => { e.preventDefault(); goTo(id); }}><small>۰{i+1}</small>{label}<ArrowUpLeft/></a>)}</nav><p className={styles.demoNote}>صدای ما، قدرت ما. مستند اتحاد.</p></Dialog>}
    {trailer && <Dialog title="اتحاد — تریلر رسمی" onClose={() => setTrailer(false)} wide><video className={styles.trailerPlayer} src={film.trailer} poster={film.poster} controls autoPlay playsInline/><div className={styles.trailerMeta}><span>اتحاد، ساخته برت استوری و استیون مینگ</span><small>تریلر اصلی · زبان انگلیسی</small></div></Dialog>}
    {booking && <Reservation screening={booking} onClose={() => setBooking(null)}/>}
    {lightbox !== null && <Dialog title={galleryCaptions[lightbox]} onClose={() => setLightbox(null)} wide><img className={styles.lightboxImage} src={galleryImages[lightbox]} alt={galleryCaptions[lightbox]}/><div className={styles.lightboxControls}><button className={styles.textLink} onClick={() => setLightbox((lightbox+2)%3)}>تصویر قبلی</button><span>{lightbox+1} / 3</span><button className={styles.textLink} onClick={() => setLightbox((lightbox+1)%3)}>تصویر بعدی <ArrowLeft size={18}/></button></div></Dialog>}
    {statement && <Dialog title="یادداشت کارگردانان" onClose={() => setStatement(false)}><article className={styles.fullStatement}><span>برت استوری و استیون مینگ</span><h2>دوربین، در کنار آدم‌ها.</h2><p>برای ما، ساختن «اتحاد» فرصتی بود برای نزدیک شدن به زندگی آدم‌هایی که هر روز، با وجود خستگی و تردید، تصمیم می‌گیرند ادامه دهند. ما می‌خواستیم دوربین نه از بالا، که در کنار آن‌ها باشد.</p><p>این داستان فقط درباره یک شرکت یا یک شهر نیست. درباره پرسشی است که همه ما به شکلی با آن روبه‌رو شده‌ایم: وقتی تنها توان تغییر چیزی را نداریم، کنار هم چه می‌توانیم بکنیم؟</p><p>ما به قدرت سینما برای آغاز گفت‌وگو باور داریم. امیدواریم این فیلم، بهانه‌ای باشد برای شنیدن یکدیگر؛ برای دیدن آدم‌های پشت هر کار، و برای تصور آینده‌ای که سهم همه ما در آن بیشتر است.</p><small>بازنویسی فارسی برای نسخه نمایشی؛ نقل‌قول مستقیم از سازندگان نیست.</small><button className={styles.solidButton} onClick={() => { setStatement(false); goTo('watch'); }}>به تماشای اتحاد بیایید <MoveUpRight size={18}/></button></article></Dialog>}
  </div></MotionConfig>;
}
