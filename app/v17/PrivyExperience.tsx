'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, MotionConfig, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowUpLeft, Check, ChevronLeft, ChevronRight, MapPin, Play, Plus, X } from 'lucide-react';
import { navigation, residences, tenets, type Residence } from './data';
import s from './privy.module.css';

const ease = [0.22, 1, 0.36, 1] as const;
const digits = (value: number) => value.toLocaleString('fa-IR');

function Brand({ small = false }: { small?: boolean }) {
  return <span className={`${s.brand} ${small ? s.brandSmall : ''}`} dir="ltr">
    <svg width="43" height="23" viewBox="0 0 60 30" fill="none" aria-hidden="true"><path d="M29 9C20-2 4 1 4 14c0 13 15 17 26 3L38 8C48-4 60 8 55 20c-4 10-16 8-22 1M25 21c-6 8-18 6-20-3M35 9c6-8 18-6 20 3" stroke="currentColor" strokeWidth="1.5"/><path d="m17 23 23-17M19 26 44 7" stroke="currentColor" strokeWidth="1.3"/></svg>
    <span className={s.brandName}>PRIVY</span><span className={s.brandCaption}>THE PRIVATE COLLECTION</span>
  </span>;
}

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: 0, y: reduced ? 0 : 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 1, delay, ease }}>{children}</motion.div>;
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`${s.eyebrow} ${light ? s.eyebrowLight : ''}`}><span />{children}</p>;
}

function Dialog({ children, onClose, label, wide = false }: { children: ReactNode; onClose: () => void; label: string; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} className={`${s.dialog} ${wide ? s.dialogWide : ''}`} aria-label={label} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === ref.current) onClose(); }}>
    <motion.div className={s.dialogInner} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
      <button className={s.closeButton} onClick={onClose} aria-label="بستن پنجره"><X size={22} /></button>{children}
    </motion.div>
  </dialog>;
}

function InquiryForm({ selected = 'all' }: { selected?: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus('loading'); setMessage('');
    try {
      const response = await fetch('/api/privy/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), phone: form.get('phone'), residence: form.get('residence'), preferredTime: form.get('preferredTime'), consent: form.get('consent') === 'on', website: form.get('website') }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'خطایی رخ داد. لطفاً دوباره تلاش کنید.');
      setReference(data.id.slice(0, 8).toUpperCase()); setStatus('success');
    } catch (error) { setStatus('error'); setMessage(error instanceof Error ? error.message : 'ارتباط برقرار نشد. لطفاً دوباره تلاش کنید.'); }
  }
  if (status === 'success') return <motion.div className={s.success} role="status" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}><span className={s.successIcon}><Check size={28} /></span><h3>آغاز یک آشنایی ماندگار</h3><p>درخواست نمایشی شما با موفقیت ثبت شد.</p><p className={s.muted}>این نسخه آزمایشی است و تماس واقعی انجام نخواهد شد.</p><div className={s.reference}>کد پیگیری <span dir="ltr">{reference}</span></div><button className={s.textLink} onClick={() => setStatus('idle')}>ثبت درخواست دیگر <ArrowLeft size={17} /></button></motion.div>;
  return <form className={s.form} onSubmit={submit}>
    <div className={s.formRow}><label>نام و نام خانوادگی <span>*</span><input name="name" autoComplete="name" placeholder="نام کامل شما" required minLength={2} maxLength={100} /></label><label>شمارهٔ همراه <span>*</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰" required maxLength={16} pattern="[0-9۰-۹٠-٩ +\-]{11,16}" /></label></div>
    <div className={s.formRow}><label>اقامتگاه مورد علاقه<select name="residence" defaultValue={selected}><option value="all">تمام مجموعه</option>{residences.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}</select></label><label>زمان مناسب تماس<select name="preferredTime" defaultValue="afternoon"><option value="morning">صبح، ۹ تا ۱۲</option><option value="afternoon">بعدازظهر، ۱۲ تا ۱۷</option><option value="evening">عصر، ۱۷ تا ۲۰</option></select></label></div>
    <div className={s.honeypot} aria-hidden="true"><label>وب‌سایت<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className={s.consent}><input type="checkbox" name="consent" required /><span>با ثبت اطلاعات برای هماهنگی بازدید و دریافت مشاوره موافقم.</span></label>
    {status === 'error' && <p className={s.error} role="alert">{message}</p>}
    <button className={s.goldButton} type="submit" disabled={status === 'loading'}><span>{status === 'loading' ? 'در حال ثبت درخواست…' : 'درخواست بازدید اختصاصی'}</span><ArrowUpLeft size={20} /></button>
    <p className={s.formNote}>اطلاعات شما محرمانه است. این فرم صرفاً برای نسخهٔ نمایشی است.</p>
  </form>;
}

function ResidenceDetail({ residence, onInquire }: { residence: Residence; onInquire: () => void }) {
  const [image, setImage] = useState(0);
  return <div className={s.detail}>
    <div className={s.detailImage}><AnimatePresence mode="wait"><motion.img key={image} src={residence.gallery[image]} alt={`${residence.title}، تصویر ${digits(image + 1)}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} /></AnimatePresence><div className={s.galleryControls}><button aria-label="تصویر قبلی" onClick={() => setImage((image + residence.gallery.length - 1) % residence.gallery.length)}><ChevronRight size={19} /></button><span>{digits(image + 1)} / {digits(residence.gallery.length)}</span><button aria-label="تصویر بعدی" onClick={() => setImage((image + 1) % residence.gallery.length)}><ChevronLeft size={19} /></button></div></div>
    <div className={s.detailText}><Eyebrow>{residence.category}</Eyebrow><h2>{residence.title}</h2><p className={s.english} dir="ltr">{residence.english}</p><p className={s.locationLabel}><MapPin size={15} />{residence.location}</p><p>{residence.description}</p><div className={s.specifications}><div><strong>{residence.area}</strong><span>مترمربع زیربنا</span></div><div><strong>{residence.bedrooms}</strong><span>اتاق خواب</span></div><div><strong>خصوصی</strong><span>سبک زندگی</span></div></div><ul className={s.features}>{residence.features.map(f => <li key={f}><Plus size={13} />{f}</li>)}</ul><button className={s.goldButton} onClick={onInquire}>رزرو بازدید این اقامتگاه <ArrowUpLeft size={19} /></button><p className={s.formNote}>مشخصات، نام پروژه‌ها و تصاویر صرفاً نمایشی هستند.</p></div>
  </div>;
}

function CinemaSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
  return <section ref={ref} className={s.cinema} aria-label="تجربهٔ زندگی ممتاز"><motion.img src="/privy/images/sublime.webp" alt="معماری ممتاز در میان آب و طبیعت" style={{ y: reduced ? 0 : y }} loading="lazy" /><div className={s.cinemaShade} /><Reveal className={s.cinemaText}><Eyebrow light>فراتر از تعریف تجمل</Eyebrow><h2>بعضی خانه‌ها،<br />خودِ یک <em>اثر هنری‌اند.</em></h2><p dir="ltr">SOME CREATIONS STAND ABOVE THE EXTRAORDINARY.</p></Reveal><span className={s.imageCaption}>هنر، در تک‌تک جزئیات.</span></section>;
}

function Locations({ onSelect }: { onSelect: (r: Residence) => void }) {
  const [active, setActive] = useState(0);
  return <section className={s.locations} id="locations"><div className={s.sectionHeading}><Reveal><Eyebrow>نشانی‌های ما</Eyebrow><h2>جای شما، <em>اینجاست.</em></h2></Reveal><span className={s.english}>EXCEPTIONAL PLACES. EXTRAORDINARY LIVES.</span></div><div className={s.locationGrid}><div className={s.map} aria-label="نقشهٔ شماتیک موقعیت اقامتگاه‌ها"><svg viewBox="0 0 850 520" fill="none" aria-hidden="true"><defs><linearGradient id="privy-water" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#253b3c"/><stop offset="1" stopColor="#172322"/></linearGradient><radialGradient id="privy-map-glow"><stop stopColor="#a59875" stopOpacity=".11"/><stop offset="1" stopColor="#101412" stopOpacity="0"/></radialGradient></defs><rect width="850" height="520" fill="#141816"/><path d="M0 0h850v123C670 58 647 164 492 113S166 84 0 158Z" fill="url(#privy-water)"/><ellipse cx="460" cy="300" rx="440" ry="260" fill="url(#privy-map-glow)"/>{Array.from({ length: 21 }, (_, i) => <path key={i} d={`M-40 ${140 + i * 21} C110 ${80 + i * 22} 175 ${200 + i * 11} 310 ${142 + i * 15} S490 ${80 + i * 21} 590 ${168 + i * 12} S785 ${92 + i * 21} 910 ${175 + i * 14}`} stroke="#78806b" strokeOpacity={i % 3 === 0 ? '.2' : '.09'} strokeWidth="1" />)}<path d="m394 425 31-52 40-57-28-48 32-77-24-54M425 373l138-64 68-11M465 316l93-24 46-39" stroke="#a39a7f" strokeOpacity=".35" strokeDasharray="4 5"/><text x="335" y="65" fill="#92a9a6" fontSize="17" fontFamily="inherit">دریای خزر</text><text x="350" y="264" fill="#626c5e" fontSize="16" fontFamily="inherit" transform="rotate(-10 350 264)">رشته‌کوه البرز</text><text x="380" y="456" fill="#667060" fontSize="14" fontFamily="inherit">تهران</text></svg>{residences.map((r, index) => <button key={r.id} className={`${s.mapPin} ${active === index ? s.mapPinActive : ''}`} style={{ left: `${[48, 68, 52][index]}%`, top: `${[73, 57, 29][index]}%` }} aria-label={`نمایش ${r.title}`} aria-pressed={active === index} onClick={() => setActive(index)}><span className={s.pinDot} /><span>{r.title}</span></button>)}<span className={s.mapCompass}>N<i>↑</i></span><span className={s.mapDisclaimer}>نقشهٔ شماتیک · موقعیت‌ها تقریبی هستند</span></div><div className={s.locationList}>{residences.map((r, i) => <button key={r.id} className={`${s.locationItem} ${active === i ? s.locationActive : ''}`} onClick={() => setActive(i)} aria-pressed={active === i}><span className={s.itemNumber}>۰{digits(i + 1)}</span><span><strong>{r.title}</strong><small>{r.location}</small></span><ArrowUpLeft size={21} /></button>)}<AnimatePresence mode="wait"><motion.div className={s.locationPreview} key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><img src={residences[active].image} alt={residences[active].title} loading="lazy" /><button className={s.textLink} onClick={() => onSelect(residences[active])}>کشف این اقامتگاه <ArrowLeft size={18} /></button></motion.div></AnimatePresence></div></div></section>;
}

export default function PrivyExperience() {
  const [menu, setMenu] = useState(false);
  const [film, setFilm] = useState(false);
  const [booking, setBooking] = useState<string | null>(null);
  const [selected, setSelected] = useState<Residence | null>(null);
  const [paused, setPaused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const [tenet, setTenet] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(heroProgress, [0, 0.75], [1, 0]);
  useMotionValueEvent(scrollY, 'change', value => setScrolled(value > 70));
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused || reduced) video.pause(); else video.play().catch(() => {});
  }, [paused, reduced]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); }, { rootMargin: '-25% 0px -45% 0px', threshold: 0 });
    ['top', ...navigation.map(n => n.id)].forEach(id => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);
  function goTo(id: string) { setMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' }); }

  return <MotionConfig reducedMotion="user"><div className={s.experience}>
    <a className={s.skipLink} href="#about">رفتن به محتوای اصلی</a>
    <motion.div className={s.progress} style={{ scaleX: scrollYProgress }} />
    <header className={`${s.header} ${scrolled ? s.headerScrolled : ''}`}>
      <button className={s.menuButton} onClick={() => setMenu(true)} aria-label="باز کردن فهرست" aria-haspopup="dialog"><span className={s.menuIcon}><i /><i /></span><span>فهرست</span></button>
      <a href="#top" className={s.logoLink} aria-label="پریوی، بازگشت به ابتدا" onClick={e => { e.preventDefault(); goTo('top'); }}><Brand /></a>
      <div className={s.headerActions}><span className={s.language}>FA <span>⌄</span></span><span className={s.headerDivider} /><button className={s.headerBooking} onClick={() => setBooking('all')}>رزرو بازدید <ArrowUpLeft size={16} /></button></div>
    </header>
    <main>
      <section ref={heroRef} className={s.hero} id="top">
        <motion.div className={s.heroVisual} style={{ y: reduced ? 0 : heroY }}><img className={s.heroPoster} src="/privy/images/hero.jpg" alt="روبان‌های فلزی درخشان در فضایی تاریک" fetchPriority="high" /><video ref={videoRef} className={s.heroVideo} src={reduced ? undefined : '/privy/intro.mp4'} poster="/privy/images/hero.jpg" autoPlay={!reduced} loop muted playsInline preload="metadata" aria-hidden="true" /><div className={s.heroTint} /></motion.div>
        <motion.div className={s.heroContent} style={{ opacity: reduced ? 1 : heroOpacity }}>
          <motion.p className={s.heroEyebrow} dir="ltr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .25, duration: 1.2 }}>A COLLECTION BEYOND COMPARE</motion.p>
          <h1><motion.span className={s.heroFirstLine} initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3, duration: 1.4, ease }}>هنرِ</motion.span><motion.span className={s.heroSecondLine} initial={{ opacity: 0, y: 45 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5, duration: 1.5, ease }}>بی‌همتا زیستن</motion.span></h1>
          <motion.p className={s.heroSubtitle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1.3 }}>خانه‌هایی برای آنان که زندگی را متفاوت می‌بینند.</motion.p>
          <motion.span className={s.heroSignature} dir="ltr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1.2 }}>The art of the sublime</motion.span>
        </motion.div>
        <div className={s.heroSideLabel} dir="ltr">EXCLUSIVELY YOURS — PRIVY COLLECTION</div>
        <div className={s.heroBottom}>
          <div className={s.filmActions}><button className={s.filmButton} onClick={() => setFilm(true)}><span className={s.circle}><Play size={15} fill="currentColor" /></span><span>تماشای روایت پریوی<small dir="ltr">THE PRIVY EXPERIENCE</small></span></button><button className={s.pauseButton} onClick={() => setPaused(!paused)} aria-label={paused ? 'پخش انیمیشن پس‌زمینه' : 'توقف انیمیشن پس‌زمینه'} aria-pressed={paused}>{paused ? <Play size={13} /> : <span className={s.equalizer}><i /><i /><i /><i /></span>}</button></div>
          <a className={s.scrollCue} href="#about" onClick={e => { e.preventDefault(); goTo('about'); }}><span>برای کشف بیشتر</span><span className={s.scrollCircle}><ArrowDown size={19} /></span></a>
          <button className={s.mapTeaser} onClick={() => goTo('locations')}><img src="/privy/images/villa.jpg" alt="" /><span className={s.mapTeaserShade} /><span className={s.mapTeaserText}><small>نشانی یک زندگی متفاوت</small><strong>کشف اقامتگاه‌ها</strong></span><span className={s.mapTeaserPlus}><Plus size={19} /></span></button>
        </div>
        <div className={s.heroFootnote}><span>مجموعهٔ منتخب پریوی</span><span dir="ltr">EST. 2025 · IRAN</span></div>
      </section>
      <section className={s.about} id="about">
        <div className={s.aboutTop}><Eyebrow>کمیاب، به انتخاب ما</Eyebrow><span className={s.sectionIndex} dir="ltr">01 / THE PHILOSOPHY</span></div>
        <div className={s.aboutGrid}><Reveal><h2>مجموعه‌ای دست‌چین<br />از <em>خانه‌های بی‌همتا.</em></h2><p className={s.serifCaption} dir="ltr">Not for everyone.<br /><i>For the exceptional.</i></p></Reveal><Reveal className={s.aboutCopy} delay={.15}><span className={s.smallDiamond}>◇</span><p>بعضی خانه‌ها تنها یک نشانی نیستند؛<br />تجسمی از یک نگاه متفاوت به زندگی‌اند.</p><p className={s.muted}>پریوی، مجموعه‌ای محدود از ممتازترین اقامتگاه‌های ایران است. از شکوه آسمان تهران تا آرامش دامنه‌های البرز و آبیِ بی‌انتهای خزر؛ هر خانه با وسواس انتخاب شده، برای کسانی که به کمتر از بی‌همتا بودن رضایت نمی‌دهند.</p><button className={s.textLink} onClick={() => goTo('collection')}>آشنایی با مجموعه <ArrowLeft size={18} /></button></Reveal></div>
        <div className={s.aboutBottom}><span>سه جهان متفاوت. یک نگاه مشترک.</span><span className={s.aboutLine} /><span dir="ltr">THE RAREST OF THE RARE</span></div>
      </section>
      <CinemaSection />
      <section className={s.collection} id="collection">
        <div className={s.sectionHeading}><Reveal><Eyebrow>مجموعهٔ منتخب</Eyebrow><h2>سه جهان،<br /><em>یک انتخاب بی‌همتا.</em></h2></Reveal><Reveal className={s.collectionIntro}><p>در ارتفاع، در آغوش طبیعت، در امتداد دریا.<br />جهان خود را پیدا کنید.</p><span className={s.english}>THREE WORLDS. ONE EXTRAORDINARY COLLECTION.</span></Reveal></div>
        <div className={`${s.residenceGrid} pv:grid pv:grid-cols-1 pv:md:grid-cols-3`}>{residences.map((r, index) => <Reveal key={r.id} delay={index * .12}><button className={s.residenceCard} onClick={() => setSelected(r)}><span className={s.residenceImage}><img src={r.image} alt={r.title} loading="lazy" /><span className={s.cardShade} /><span className={s.cardNumber}>۰{digits(index + 1)}</span><span className={s.cardCategory}>{r.category}</span><span className={s.cardExplore}>کشف اقامتگاه <ArrowUpLeft size={20} /></span></span><span className={s.cardInfo}><span><small><MapPin size={12} />{r.location}</small><strong>{r.title}</strong></span><span className={s.cardArrow}><ArrowUpLeft size={24} strokeWidth={1} /></span></span><span className={s.cardEnglish} dir="ltr">{r.english}</span></button></Reveal>)}</div>
        <p className={s.collectionNote}><span />خانه‌هایی به تعداد انگشتان دست؛ تجربه‌هایی به وسعت یک زندگی.<span /></p>
      </section>
      <section className={s.tenets} id="tenets"><div className={s.tenetPicture}><img src="/privy/images/interior.webp" alt="طراحی داخلی با متریال طبیعی، نور و ظرافت" loading="lazy" /><div className={s.tenetImageShade} /><span className={s.tenetImageCaption} dir="ltr">Excellence is<br /><em>in the details.</em></span><span className={s.tenetImageFoot}>زیبایی، در جزئیات زندگی می‌کند.</span></div><div className={s.tenetContent}><Reveal><Eyebrow>اصول پریوی</Eyebrow><h2>معیار ما،<br /><em>فراتر از معمول.</em></h2><p className={s.muted}>چه چیزی یک خانه را به مجموعهٔ پریوی می‌رساند؟<br />چهار اصل، بدون هیچ مصالحه‌ای.</p></Reveal><div className={s.accordion}>{tenets.map((t, i) => <div className={`${s.tenetItem} ${tenet === i ? s.tenetActive : ''}`} key={t.title}><button onClick={() => setTenet(tenet === i ? -1 : i)} aria-expanded={tenet === i} aria-controls={`privy-tenet-${i}`}><span className={s.tenetNumber}>۰{digits(i + 1)}</span><span>{t.title}</span><Plus size={18} /></button><AnimatePresence initial={false}>{tenet === i && <motion.div id={`privy-tenet-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .4, ease }}><div className={s.tenetDescription}><p>{t.text}</p><span dir="ltr">{t.english}</span></div></motion.div>}</AnimatePresence></div>)}</div></div></section>
      <section className={s.manifesto}><span className={s.manifestoStar}>✧</span><Reveal><p>برای آنان که خانه را نه یک مکان،<br />که <em>انعکاسی از خود</em> می‌دانند.</p></Reveal><span className={s.english}>HANDPICKED. EXTRAORDINARY. YOURS.</span></section>
      <Locations onSelect={setSelected} />
      <section className={s.contact} id="contact"><div className={s.contactText}><Reveal><Eyebrow>دعوتی شخصی برای شما</Eyebrow><h2>فصل تازهٔ زندگی،<br />با یک <em>آشنایی.</em></h2><p>برای شناخت نزدیک‌تر مجموعه و هماهنگی یک بازدید<br />اختصاصی، همراه شما هستیم.</p><div className={s.contactSignature}><Brand small /><span>انتخابی برای یک عمر.</span></div></Reveal></div><Reveal className={s.contactForm}><InquiryForm /></Reveal></section>
    </main>
    <footer className={s.footer}><div className={s.footerMain}><a href="#top" aria-label="بازگشت به ابتدای پریوی" onClick={e => { e.preventDefault(); goTo('top'); }}><Brand small /></a><nav aria-label="پیوندهای پایین صفحه">{navigation.slice(0, 4).map(n => <a key={n.id} href={`#${n.id}`} onClick={e => { e.preventDefault(); goTo(n.id); }}>{n.title}</a>)}</nav><button className={s.backTop} onClick={() => goTo('top')}>بازگشت به بالا <ArrowDown size={17} /></button></div><div className={s.footerBottom}><span>© ۱۴۰۵ پریوی. تمامی حقوق محفوظ است.</span><span>نسخهٔ مفهومی و نمایشی · پروژه‌ها و اطلاعات واقعی نیستند.</span><span dir="ltr">CRAFTED FOR THE EXTRAORDINARY</span></div></footer>
    <nav className={s.sectionNav} aria-label="بخش‌های صفحه">{[{ id: 'top', title: 'آغاز' }, ...navigation].map(n => <button key={n.id} onClick={() => goTo(n.id)} className={activeSection === n.id ? s.sectionNavActive : ''} aria-label={n.title} aria-current={activeSection === n.id ? 'location' : undefined}><span>{n.title}</span><i /></button>)}</nav>
    {menu && <Dialog label="فهرست اصلی" onClose={() => setMenu(false)} wide><div className={s.menuPanel}><div className={s.menuNav}><Brand /><p className={s.eyebrow}>جهان پریوی را کشف کنید</p><nav>{navigation.map((n, i) => <motion.button key={n.id} initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .08, duration: .5 }} onClick={() => goTo(n.id)}><small>۰{digits(i + 1)}</small><span>{n.title}<em>{n.en}</em></span><ArrowUpLeft size={25} /></motion.button>)}</nav><p className={s.menuNote}>سه جهان متفاوت. یک نگاه مشترک.</p></div><div className={s.menuPicture}><img src="/privy/images/villa.jpg" alt="آرامش و شکوه اقامتگاه‌های پریوی" /><div><span dir="ltr">THE ART OF THE SUBLIME</span><p>بی‌همتا،<br />درست شبیه شما.</p><button className={s.textLink} onClick={() => { setMenu(false); setBooking('all'); }}>رزرو یک بازدید اختصاصی <ArrowLeft size={19} /></button></div></div></div></Dialog>}
    {selected && <Dialog label={`جزئیات ${selected.title}`} onClose={() => setSelected(null)} wide><ResidenceDetail residence={selected} onInquire={() => { setBooking(selected.id); setSelected(null); }} /></Dialog>}
    {booking && <Dialog label="درخواست بازدید اختصاصی" onClose={() => setBooking(null)}><div className={s.bookingPanel}><Eyebrow>یک دعوت اختصاصی</Eyebrow><h2>از نزدیک، <em>متفاوت است.</em></h2><p className={s.muted}>برای آغاز آشنایی، اطلاعات خود را با ما به اشتراک بگذارید.</p><InquiryForm selected={booking} /></div></Dialog>}
    {film && <Dialog label="روایت تصویری پریوی" onClose={() => setFilm(false)} wide><div className={s.filmPanel}><div className={s.filmTitle}><Eyebrow>روایت پریوی</Eyebrow><h2>هنرِ بی‌همتا زیستن</h2><p dir="ltr">THE ART OF THE SUBLIME</p></div><video src="/privy/intro.mp4" poster="/privy/images/hero.jpg" autoPlay={!reduced} controls playsInline loop aria-label="فیلم کوتاه روبان‌های مجموعهٔ پریوی" /><div className={s.filmFooter}><span>از جزئیات کوچک، تا احساسی بی‌انتها.</span><button className={s.textLink} onClick={() => { setFilm(false); goTo('collection'); }}>کشف مجموعه <ArrowLeft size={18} /></button></div></div></Dialog>}
  </div></MotionConfig>;
}
