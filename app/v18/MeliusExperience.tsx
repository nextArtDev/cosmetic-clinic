'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode, type CSSProperties } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowUpLeft, ArrowUp, AudioLines, Check, ChevronDown, ChevronLeft, CircleHelp, Clapperboard, Earth as Globe2, ImageIcon, Layers as Layers3, LoaderCircle, Menu, MousePointer2, Pause, Play, Plus, Sparkles, WandSparkles, X } from 'lucide-react';
import { categories, faqs, plans } from './data';
import s from './Melius.module.css';

type ModalState = { type: 'signup' | 'login' | 'contact' | 'studio' | 'video' | 'image'; plan?: string; image?: number; prompt?: string } | null;
const imagePath = (name: string | number) => `/melius/images/${typeof name === 'number' ? `hero-${name}` : name}.webp`;
const words = ['تصویر', 'ویدیو', 'داستان', 'رویا'];
const gallery = [
  { image: 10, left: -7, top: -6, rotate: -15, width: 14, title: 'روایتی از هیرکانی' },
  { image: 7, left: 5, top: 40, rotate: -12, width: 15, title: 'آبیِ بی‌انتها' },
  { image: 3, left: 18, top: 80, rotate: -8, width: 15, title: 'فرم، نور، سادگی' },
  { image: 19, left: 31, top: 104, rotate: -5, width: 15, title: 'رنگ‌های خیال' },
  { image: 23, left: 44, top: 115, rotate: 2, width: 15, title: 'گلی از جنس هنر' },
  { image: 16, left: 57, top: 96, rotate: 7, width: 15, title: 'طعم آفتاب' },
  { image: 5, left: 70, top: 53, rotate: 11, width: 15, title: 'فراتر از ممکن' },
  { image: 2, left: 83, top: 1, rotate: 14, width: 15, title: 'بُعد تازهٔ خلاقیت' },
  { image: 24, left: 96, top: -40, rotate: 17, width: 14, title: 'موج‌های سبز' },
];

function Brand({ light = false }: { light?: boolean }) {
  return <a href="#melius-top" className={`${s.brand} ${light ? s.brandLight : ''}`} aria-label="ملیوس، ابتدای صفحه"><svg viewBox="0 0 42 32" fill="none" aria-hidden="true"><path d="M3 4C12 8 30 8 39 4V28C30 24 12 24 3 28V4Z" fill="currentColor"/><path d="M16 10V23M25 10V23" stroke={light ? '#202020' : '#faf9f6'} strokeWidth="2.5"/></svg><span>melius<span className={s.brandDot}>®</span></span></a>;
}

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .7, delay, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}

function FloatingGallery({ open, paused }: { open: (m: ModalState) => void; paused: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [24, -35]);
  return <motion.div ref={ref} className={s.gallery} style={{ y: reduced ? 0 : y }} aria-label="گالری آثار خلاقانه">
    <div className={`${s.galleryTrack} ${paused ? s.galleryPaused : ''}`}>
      {gallery.map((card, i) => <motion.button key={card.image} className={s.artCard} style={{ '--card-left': `${card.left}%`, '--card-top': `${card.top}px`, '--card-rotate': `${card.rotate}deg`, '--card-width': `${card.width}%`, '--float-delay': `${i * -.65}s` } as CSSProperties} initial={{ opacity: 0, y: 70, scale: .85 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: .18 + i * .065, duration: 1.1, ease: [.22, 1, .36, 1] }} onClick={() => open({ type: 'image', image: card.image, prompt: card.title })} aria-label={`نمایش ${card.title}`}>
        <div className={s.artInner}><img src={imagePath(card.image)} alt={card.title} fetchPriority={i === 4 ? 'high' : 'auto'} draggable={false}/><span className={s.artOverlay}><span>{card.title}</span><ArrowUpLeft size={17}/></span></div>
      </motion.button>)}
    </div>
  </motion.div>;
}

function ExperienceModal({ state, close, change }: { state: NonNullable<ModalState>; close: () => void; change: (state: ModalState) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ message: string; image: string; id: string } | null>(null);
  const [prompt, setPrompt] = useState(state.prompt || 'یک گل رز از جنس کاشی‌کاری آبی اصفهان، در نور استودیویی');
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => { dialog?.close(); }; }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError('');
    const data = new FormData(e.currentTarget);
    try {
      const response = await fetch('/api/melius/demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: state.type === 'studio' ? 'generate' : state.type === 'contact' ? 'contact' : 'signup', name: data.get('name'), email: data.get('email'), prompt, plan: state.plan || 'free' }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'خطایی رخ داد. دوباره تلاش کن.');
      setResult(json);
    } catch (err) { setError(err instanceof Error ? err.message : 'اتصال برقرار نشد. دوباره تلاش کن.'); }
    finally { setLoading(false); }
  }
  const isForm = ['signup', 'login', 'contact'].includes(state.type);
  return <dialog ref={ref} className={`${s.dialog} ${state.type === 'video' || state.type === 'image' ? s.mediaDialog : ''}`} onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }}>
    <motion.div className={s.dialogContent} initial={{ opacity: 0, y: 18, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .25 }}>
      <button className={s.closeButton} onClick={close} aria-label="بستن پنجره"><X size={21}/></button>
      {state.type === 'image' && <><img className={s.lightboxImage} src={imagePath(state.image || 23)} alt={state.prompt || 'اثر خلاقانه'}/><div className={s.lightboxCaption}><div><span className={s.eyebrow}>ساخته‌شده با تخیل</span><h2>{state.prompt}</h2></div><button className={s.orangeButton} onClick={() => change({ type: 'studio', prompt: state.prompt })}>با این ایده شروع کن <WandSparkles size={17}/></button></div></>}
      {state.type === 'video' && <><h2 className={s.dialogTitle}>از ایده تا یک دنیای تازه</h2><p className={s.muted}>نگاهی به نمونهٔ تصویری استودیوی خلاق ملیوس</p><video className={s.demoVideo} src="/melius/images/agencies.mp4" poster={imagePath(7)} controls autoPlay playsInline/><div className={s.demoLabel}>ویدیوی معرفی نمونه — نسخهٔ آزمایشی فارسی</div></>}
      {isForm && <>
        <div className={s.modalSymbol}><Sparkles size={28}/></div>
        <span className={s.eyebrow}>اینجا، شروع یک ایده است</span>
        <h2 className={s.dialogTitle}>{state.type === 'contact' ? 'برای ایده‌های بزرگ‌تر، صحبت کنیم.' : state.type === 'login' ? 'به فضای خلاق خودت برگرد.' : 'خلاقیتت را آزاد کن.'}</h2>
        <p className={s.muted}>{state.type === 'contact' ? 'اطلاعاتت را برای ثبت درخواست آزمایشی همکاری وارد کن.' : `شروع ${state.plan ? `با طرح ${plans.find(p => p.id === state.plan)?.name || 'سازمانی'}` : 'رایگان'}، بدون نیاز به کارت بانکی.`}</p>
        {result ? <div className={s.successBox} role="status"><span className={s.successIcon}><Check size={25}/></span><h3>ایده‌های خوب، از همین‌جا شروع می‌شوند.</h3><p>{result.message}</p><button className={s.orangeButton} onClick={() => change({ type: 'studio' })}>ورود به استودیوی آزمایشی <ArrowLeft size={18}/></button></div> : <form onSubmit={submit} className={s.modalForm}><label>نام و نام خانوادگی<input name="name" autoComplete="name" placeholder="مثلاً سارا محمدی" required minLength={2} maxLength={100}/></label><label>ایمیل<input name="email" autoComplete="email" type="email" dir="ltr" placeholder="you@example.com" required maxLength={254}/></label>{state.type === 'contact' && <label>دربارهٔ تیم و ایده‌ات بگو<textarea value={prompt === 'یک گل رز از جنس کاشی‌کاری آبی اصفهان، در نور استودیویی' ? '' : prompt} onChange={e => setPrompt(e.target.value)} placeholder="نام تیم، تعداد اعضا و چیزی که می‌خواهید بسازید..." maxLength={1500}/></label>}{error && <p className={s.error} role="alert">{error}</p>}<button disabled={loading} className={s.orangeButton} type="submit">{loading ? <LoaderCircle className={s.spinner} size={18}/> : <ArrowLeft size={18}/>} {loading ? 'در حال ثبت...' : state.type === 'contact' ? 'ثبت درخواست همکاری' : 'شروع ماجراجویی خلاق'}</button><p className={s.formNotice}>نسخهٔ نمایشی: اطلاعات فقط برای ثبت درخواست آزمایشی ذخیره می‌شوند؛ حساب واقعی، ایمیل خودکار یا پرداختی در کار نیست.</p></form>}
      </>}
      {state.type === 'studio' && <><span className={s.eyebrow}><WandSparkles size={16}/> بوم خلاق تو</span><h2 className={s.dialogTitle}>چه چیزی در ذهن داری؟</h2><p className={s.muted}>ایده‌ات را بنویس و یک پیش‌نمایش از گالری نمونه‌ها ببین.</p><form onSubmit={submit} className={s.modalForm}><label>پرامپت تو<textarea name="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} minLength={5} maxLength={1500} required rows={4}/></label><div className={s.studioMeta}><span><ImageIcon size={15}/> تصویر</span><span>مدل نمایشی · نسبت ۱:۱</span></div>{error && <p className={s.error} role="alert">{error}</p>}<button disabled={loading} className={s.orangeButton}>{loading ? <LoaderCircle className={s.spinner} size={17}/> : <WandSparkles size={17}/>} {loading ? 'در حال آماده‌سازی...' : result ? 'ساخت پیش‌نمایش تازه' : 'ایده‌ام را نشان بده'}</button></form>{result && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={s.studioResult} role="status"><img src={result.image} alt={prompt}/><p>{result.message}</p><a href={result.image} download="melius-demo.webp" className={s.outlineButton}>دانلود نمونه <ArrowLeft size={16}/></a></motion.div>}<p className={s.formNotice}>این دمو به مدل هوش مصنوعی متصل نیست. خروجی، یک تصویر آماده متناسب با موضوع پرامپت است.</p></>}
    </motion.div>
  </dialog>;
}

export default function MeliusExperience() {
  const [word, setWord] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [category, setCategory] = useState(0);
  const [yearly, setYearly] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const showcaseRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: showcaseRef, offset: ['start end', 'end start'] });
  const canvasY = useTransform(scrollYProgress, [0, 1], [45, -45]);
  useEffect(() => { if (reduced || paused) return; const interval = setInterval(() => setWord(w => (w + 1) % words.length), 3400); return () => clearInterval(interval); }, [reduced, paused]);
  useEffect(() => { const listener = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); }; window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener); }, []);
  const active = categories[category];
  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => { event.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' }); setMenuOpen(false); };
  return <MotionConfig reducedMotion="user"><main className={s.root} id="melius-top">
    <a className={s.skipLink} href="#melius-content">رفتن به محتوای اصلی</a>
    <header className={s.header}>
      <Brand/>
      <nav className={s.desktopNav} aria-label="منوی اصلی"><a href="#melius-canvas" onClick={e => goTo(e, 'melius-canvas')}>استودیوی خلاق <ChevronDown size={12}/></a><a href="#melius-personas" onClick={e => goTo(e, 'melius-personas')}>برای چه کسانی؟</a><a href="#melius-pricing" onClick={e => goTo(e, 'melius-pricing')}>تعرفه‌ها</a><a href="#melius-about" onClick={e => goTo(e, 'melius-about')}>دربارهٔ ملیوس</a></nav>
      <div className={s.headerActions}><button className={s.loginButton} onClick={() => setModal({ type: 'login' })}>ورود</button><button className={s.orangeButton} onClick={() => setModal({ type: 'signup' })}>رایگان شروع کن <ArrowUpLeft size={16}/></button><button className={s.menuButton} aria-expanded={menuOpen} aria-controls="melius-mobile-menu" aria-label={menuOpen ? 'بستن منو' : 'بازکردن منو'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button></div>
    </header>
    <AnimatePresence>{menuOpen && <motion.nav id="melius-mobile-menu" className={s.mobileNav} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} aria-label="منوی موبایل">{[['استودیوی خلاق','melius-canvas'],['برای چه کسانی؟','melius-personas'],['تعرفه‌ها','melius-pricing'],['دربارهٔ ملیوس','melius-about']].map(([label,id]) => <a key={id} href={`#${id}`} onClick={e => goTo(e,id)}>{label}<ArrowUpLeft size={16}/></a>)}<button onClick={() => { setMenuOpen(false); setModal({ type: 'login' }); }}>ورود به نسخهٔ آزمایشی</button></motion.nav>}</AnimatePresence>
    <section className={s.hero} id="melius-content" aria-label="هر آنچه تصور می‌کنی، خلق کن">
      <div className={s.heroHeading}>
        <motion.div className={s.heroBadge} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}><span className={s.statusDot}/><span>نسل تازهٔ خلاقیت، با هوش مصنوعی</span><Sparkles size={13}/></motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .8 }}>هر <span className={s.changingWord}><AnimatePresence mode="wait"><motion.span key={word} initial={{ y: 30, opacity: 0, filter: 'blur(5px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} exit={{ y: -25, opacity: 0, filter: 'blur(5px)' }} transition={{ duration: .4 }}>{words[word]}</motion.span></AnimatePresence><svg viewBox="0 0 230 12" preserveAspectRatio="none" aria-hidden="true"><path d="M3 8C62 1 172 1 226 5M26 11C94 6 166 5 207 9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg></span> که تصور می‌کنی،<br/>خلق کن<span className={s.orangePeriod}>.</span></motion.h1>
      </div>
      <FloatingGallery open={setModal} paused={paused}/>
      <div className={s.galleryLabel}><span className={s.labelLine}/><span>خیال تو. امکانات بی‌انتها.</span><span className={s.labelLine}/></div>
      <motion.div className={s.heroBottom} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .7, duration: .8 }}><p>تو ایده‌اش را بیاور، با هم واقعی‌اش می‌کنیم.<br/><span>دستیارهای هوش مصنوعی برای خلق تصویر، ویدیو و صدا؛ درست همان‌طور که تصورش می‌کنی.</span></p><div className={s.heroButtons}><button className={`${s.orangeButton} ${s.heroCta}`} onClick={() => setModal({ type: 'studio' })}>شروع خلق کردن <ArrowUpLeft size={19}/></button><button className={s.watchButton} onClick={() => setModal({ type: 'video' })}><span className={s.playCircle}><Play size={12} fill="currentColor"/></span>ملیوس را در عمل ببین</button></div><span className={s.freeNote}>رایگان امتحان کن <span>·</span> بدون نیاز به کارت بانکی</span></motion.div>
      <button className={s.animationControl} onClick={() => setPaused(!paused)} aria-label={paused ? 'پخش انیمیشن‌ها' : 'توقف انیمیشن‌ها'}>{paused ? <Play size={12}/> : <Pause size={12}/>}</button><a className={s.scrollHint} href="#melius-canvas" onClick={e => goTo(e,'melius-canvas')}><span>کمی پایین‌تر، دنیای توست</span><span className={s.scrollMouse}><span/></span></a><span className={s.heroIndex}>01 — INFINITE POSSIBILITIES</span>
    </section>
    <section className={s.models} aria-label="مدل‌های هوش مصنوعی"><p>بهترین مدل‌های دنیا، در یک فضای خلاق</p><div className={s.modelLogos} dir="ltr"><span className={s.google}>Google</span><span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 2 8 5v10l-8 5-8-5V7l8-5Zm0 0v9m8-4-8 4-8-4m8 4v11m-8-5 8-6 8 6" stroke="currentColor" strokeWidth="1.7"/></svg>OpenAI</span><span className={s.eleven}>Ⅱ ElevenLabs</span><span className={s.kling}>◈ KLING AI</span><span className={s.flux}>FLUX<span className={s.smallLogo}>.1</span></span><span className={s.runway}>runway</span><span className={s.moreModels}>+۱۲ مدل دیگر</span></div></section>
    <section className={s.canvasSection} id="melius-canvas" ref={showcaseRef}>
      <Reveal className={s.sectionHeading}><span className={s.eyebrow}><span className={s.statusDot}/> از اولین جرقه تا آخرین جزئیات</span><h2>یک بوم. بی‌نهایت امکان.</h2><p>همهٔ ابزارهای خلاقیتت، بالاخره کنار هم.</p></Reveal>
      <div className={s.categoryTabs} role="tablist" aria-label="کاربردهای استودیو">{categories.map((item, i) => <button key={item.id} id={`melius-tab-${i}`} role="tab" aria-selected={category === i} aria-controls="melius-canvas-panel" tabIndex={category === i ? 0 : -1} onClick={() => setCategory(i)} onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const next = (category + (e.key === 'ArrowLeft' ? 1 : -1) + categories.length) % categories.length; setCategory(next); document.getElementById(`melius-tab-${next}`)?.focus(); } }}>{category === i && <motion.span className={s.tabBackground} layoutId="melius-tab" transition={{ type: 'spring', bounce: .12, duration: .45 }}/>}<span>{item.label}</span></button>)}</div>
      <div className={s.canvasPanel} role="tabpanel" id="melius-canvas-panel" aria-labelledby={`melius-tab-${category}`}>
        <div className={s.canvasToolbar}><span><span className={s.statusDot}/> {active.tag}</span><span dir="ltr">MELIUS CANVAS <Layers3 size={14}/></span></div>
        <AnimatePresence mode="wait"><motion.div key={category} className={s.canvasContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
          <div className={s.canvasCopy}><span className={s.eyebrow}>خلاقیت، بدون وقفه</span><h3>{active.title}</h3><p>{active.description}</p><button className={s.lightButton} onClick={() => setModal({ type: 'studio', prompt: active.prompt })}>این ایده را امتحان کن <ArrowUpLeft size={17}/></button><div className={s.canvasTools}><span><ImageIcon size={15}/> تصویر</span><span><Clapperboard size={15}/> ویدیو</span><span><AudioLines size={15}/> صدا</span></div></div>
          <motion.div className={s.nodeScene} style={{ y: reduced ? 0 : canvasY }}>
            <svg className={s.nodeConnections} viewBox="0 0 640 430" fill="none" aria-hidden="true"><path d="M80 310C280 310 140 95 310 95S390 280 560 280" stroke="#f47952" strokeWidth="1.5" strokeDasharray="5 5"/><circle cx="80" cy="310" r="4" fill="#f47952"/><circle cx="560" cy="280" r="4" fill="#f47952"/></svg>
            <button className={`${s.canvasNode} ${s.mainNode}`} onClick={() => setModal({ type: 'studio', prompt: active.prompt })}><div><span><ImageIcon size={13}/> تصویر محصول</span><span>···</span></div><img src={imagePath(active.image)} alt={active.title} loading="lazy"/><footer><span>GPT Image</span><span><Check size={11}/> آماده</span></footer></button>
            <button className={`${s.canvasNode} ${s.secondaryNode}`} onClick={() => setModal({ type: 'image', image: Number(active.second.replace('hero-', '')), prompt: active.tag })}><div><span><Sparkles size={13}/> یک زاویهٔ تازه</span><span>···</span></div><img src={imagePath(active.second)} alt={`نمونه ${active.label}`} loading="lazy"/></button>
            <div className={s.promptNode}><span><Sparkles size={13}/> دستیار خلاق</span><p>{active.prompt}</p><div><span>ایدهٔ تو، نقطهٔ شروع ماست</span><button onClick={() => setModal({ type: 'studio', prompt: active.prompt })} aria-label="امتحان این پرامپت"><ArrowUp size={15}/></button></div></div><span className={s.collaborator}><MousePointer2 size={15} fill="currentColor"/> سارا</span>
          </motion.div>
        </motion.div></AnimatePresence>
        <div className={s.canvasBottom}><span><MousePointer2 size={13}/> ایده‌هایت را به هم وصل کن</span><span dir="ltr">− <span>100%</span> ＋</span></div>
      </div>
    </section>
    <section className={s.personasSection} id="melius-personas"><Reveal className={s.personasHeading}><div><span className={s.eyebrow}>برای ذهن‌هایی که متوقف نمی‌شوند</span><h2>هر نقشی داری،<br/>خالق باش.</h2></div><p>فردی کار می‌کنی یا در یک تیم بزرگ؟<br/>ملیوس با جریان خلاقیت تو همراه می‌شود.</p></Reveal><div className={s.personaGrid}>{[{ title: 'آژانس‌های خلاق', en: 'CREATIVE AGENCIES', desc: 'از ایده‌ای که ارائه را می‌برد، تا کمپینی که دیده می‌شود.', image: 19, prompt: categories[0].prompt }, { title: 'فیلم‌سازها و هنرمندها', en: 'FILMMAKERS & ARTISTS', desc: 'آن تصویری که فقط تو می‌بینی، حالا همه می‌بینند.', image: 5, prompt: categories[2].prompt }, { title: 'برندها و کسب‌وکارها', en: 'BRANDS & BUSINESSES', desc: 'داستان برندت را با تصویرهایی متفاوت روایت کن.', image: 23, prompt: categories[4].prompt }].map((persona,i) => <Reveal key={persona.title} delay={i * .1}><button className={s.personaCard} onClick={() => setModal({ type: 'studio', prompt: persona.prompt })}><div className={s.personaImage}><img src={imagePath(persona.image)} alt={persona.title} loading="lazy"/><span className={s.personaArrow}><ArrowUpLeft size={22}/></span><span className={s.personaNumber}>0{i+1}</span></div><div className={s.personaText}><span>{persona.en}</span><h3>{persona.title}</h3><p>{persona.desc}</p></div></button></Reveal>)}</div></section>
    <section className={s.aboutSection} id="melius-about"><Reveal><span className={s.eyebrow}><Sparkles size={16}/> تکنولوژی جهانی، تخیل بی‌مرز</span><h2>ابزارها تغییر می‌کنند.<br/><span>خلاقیت، هنوز از تو شروع می‌شود.</span></h2><p>ما به آینده‌ای باور داریم که در آن، فاصلهٔ بین «چه می‌شد اگر» و «ساختمش»<br className="mel:hidden mel:md:block"/> فقط یک ایده است. ملیوس، فضای این اتفاق است.</p><button className={s.textButton} onClick={() => setModal({ type: 'studio' })}>ایدهٔ بعدی‌ات را بساز <ArrowLeft size={20}/></button></Reveal><div className={s.aboutDecoration} aria-hidden="true">✳</div></section>
    <section className={s.pricingSection} id="melius-pricing"><Reveal className={s.sectionHeading}><span className={s.eyebrow}>روی خلاقیتت سرمایه‌گذاری کن</span><h2>به اندازهٔ رویاهات، انتخاب کن.</h2><p>یک اشتراک، تمام مدل‌ها. بدون مرز برای ایده‌ها.</p></Reveal><div className={s.billingToggle}><button className={!yearly ? s.billingActive : ''} aria-pressed={!yearly} onClick={() => setYearly(false)}>ماهانه</button><button className={yearly ? s.billingActive : ''} aria-pressed={yearly} onClick={() => setYearly(true)}>سالانه <span>۱۵٪ تخفیف</span></button></div><div className={s.pricingGrid}>{plans.map((plan,i) => <Reveal key={plan.id} delay={i*.08} className={`${s.priceCard} ${i===1 ? s.featuredPlan : ''}`}>{i===1 && <div className={s.popular}>انتخاب خالق‌های بلندپرواز <Sparkles size={12}/></div>}<div className={s.planName}><h3>{plan.name}</h3><span>{plan.en}</span></div><p className={s.planDescription}>{plan.description}</p><div className={s.planPrice}><strong>{new Intl.NumberFormat('fa-IR').format(Math.round(plan.price * (yearly ? .85 : 1)))}</strong><span>تومان <small>/ ماه</small></span></div><span className={s.billedNote}>{yearly ? `پرداخت سالانه ${new Intl.NumberFormat('fa-IR').format(plan.price * .85 * 12)} تومان` : 'پرداخت ماهانه · لغو در هر زمان'}</span><div className={s.creditBox}><img src="/melius/images/coin.webp" alt="" loading="lazy"/><div><strong>{plan.credits} اعتبار در ماه</strong><span>{plan.capacity}</span></div></div><button className={i===1 ? s.orangeButton : s.outlineButton} onClick={() => setModal({ type: 'signup', plan: plan.id })}>شروع با طرح {plan.name}<ArrowUpLeft size={16}/></button><div className={s.features}><span>فضایی برای بیشتر خلق کردن</span>{plan.features.map(f => <p key={f}><Check size={15}/>{f}</p>)}</div></Reveal>)}</div><Reveal className={s.enterprise}><div className={s.enterpriseIcon}><Layers3 size={30}/></div><div><h3>ایده‌های بزرگ، تیم‌های بزرگ‌تر.</h3><p>اعتبار بیشتر، دستیارهای نامحدود و پشتیبانی اختصاصی برای سازمان شما.</p></div><button className={s.darkButton} onClick={() => setModal({ type: 'contact', plan: 'enterprise' })}>با ما صحبت کنید <ArrowUpLeft size={17}/></button></Reveal><p className={s.pricingNotice}>همهٔ قیمت‌ها به تومان و صرفاً برای نمایش هستند. در این نسخه پرداخت انجام نمی‌شود.</p></section>
    <section className={s.faqSection}><Reveal className={s.faqIntro}><span className={s.eyebrow}><CircleHelp size={15}/> خوب است بدانی</span><h2>شاید سؤال تو<br/>هم باشد.</h2><p>چیزی در ذهنت مانده؟<br/>خوشحال می‌شویم با هم صحبت کنیم.</p><button className={s.textButton} onClick={() => setModal({ type: 'contact' })}>ارتباط با ما <ArrowLeft size={18}/></button></Reveal><div className={s.faqList}>{faqs.map((item,i) => <div className={`${s.faqItem} ${faq===i ? s.faqOpen : ''}`} key={item.q}><button aria-expanded={faq===i} aria-controls={`melius-faq-${i}`} onClick={() => setFaq(faq===i ? null : i)}><span><small>۰{i+1}</small>{item.q}</span><Plus size={20}/></button><AnimatePresence initial={false}>{faq===i && <motion.div id={`melius-faq-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }}><p>{item.a}</p></motion.div>}</AnimatePresence></div>)}</div></section>
    <section className={s.finalCta}><Reveal><span className={s.eyebrow}>برای ایدهٔ بعدی‌ات آماده‌ای؟</span><h2>کمتر تصور کن.<br/>بیشتر <span>خلق کن.</span></h2><button className={s.orangeButton} onClick={() => setModal({ type: 'studio' })}>اولین ایده‌ات را زنده کن <ArrowUpLeft size={19}/></button><p>یک فضای تازه، برای ذهن بی‌مرز تو.</p></Reveal><img className={s.ctaImageOne} src={imagePath(17)} alt="" loading="lazy"/><img className={s.ctaImageTwo} src={imagePath(20)} alt="" loading="lazy"/></section>
    <footer className={s.footer}><div className={s.footerTop}><Brand light/><span>خانه‌ای برای ایده‌هایی که هنوز خلق نشده‌اند.</span><a href="#melius-top" onClick={e => goTo(e,'melius-top')} aria-label="بازگشت به بالای صفحه"><ArrowUp size={20}/></a></div><div className={s.footerBottom}><span>© ۱۴۰۵ ملیوس — نسخهٔ نمایشی فارسی</span><div><span><Globe2 size={14}/> فارسی / ایران</span><button onClick={() => setModal({ type: 'contact' })}>ارتباط با ما</button><a href="#melius-pricing" onClick={e => goTo(e,'melius-pricing')}>تعرفه‌ها</a></div><span dir="ltr">MADE FOR THE IMAGINATIVE.</span></div></footer>
    {modal && <ExperienceModal key={`${modal.type}-${modal.image || ''}-${modal.plan || ''}`} state={modal} close={() => setModal(null)} change={setModal}/>}
  </main></MotionConfig>;
}
