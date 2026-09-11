'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react';
import { AnimatePresence, MotionConfig, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowUpLeft, ArrowLeft, Plus, Minus, X, ShoppingBag, Menu, Check, Flower2, Maximize2 } from 'lucide-react';
import { categories, money, persian, type Category, type Product } from '../_lib/catalog';
import s from './FlowersExperience.module.css';
import m from './FlowersMotion.module.css';
import {
 BlurText,
 CursorLayer,
 LinkSlide,
 NoiseOverlay,
 PinnedShowcase,
 Rule,
 StickyHeader,
 ZoomLightbox,
 useSafeReducedMotion,
 useSmoothScroll,
 type ShowcaseItem,
} from './FlowersMotion';

type CartItem = { id: string; quantity: number };
type Panel = 'menu' | 'cart' | 'contact' | 'product' | null;
const ease = [0.22, 1, 0.36, 1] as const;
const stories = [
 { title: 'زیباییِ یک شاخه', text: 'ما به زبان یک گل باور داریم. با انتخاب یک گونه، فرم، ریتم و شخصیتش را بدون هیچ شلوغی به تماشا می‌گذاریم.', image: '/flowers/quiet.webp' },
 { title: 'گل، زبانِ ناگفته‌ها', text: 'گاهی یک دسته گل، تمام حرف‌هایی است که نمی‌توانیم بگوییم. برای دوستت دارم، دلتنگتم، یا فقط به یادت بودم.', image: '/flowers/gift.webp' },
 { title: 'ادامه‌ای از فضای شما', text: 'گل‌ها قرار نیست فقط دیده شوند؛ قرار است بخشی از خانه شوند. با نور، رنگ و حس فضای شما همراهشان می‌کنیم.', image: '/flowers/interior.webp' },
 { title: 'حالِ خوب، بی‌بهانه', text: 'منتظر مناسبت نمانید. یک روز معمولی هم می‌تواند با چند شاخه گل، به خاطره‌ای کوچک و زیبا تبدیل شود.', image: '/flowers/daisy.webp' },
];
// Copy for the pinned showcase, mirroring the original's four panels —
// "Home and atmosphere / Office and condition / A gift and a person / Joy for
// no reason" — which upstream pins with fi:'fixed' sbs scroll animations
// (rec1825455681, 4686px tall).
const showcaseText: Record<string, string> = {
 home: 'گل‌هایی که با نور، رنگ و حس فضای شما همراه می‌شوند؛ نه فقط به‌عنوان تزئین، بلکه به‌عنوان بخشی از خانه.',
 office: 'یک گونه در فضای کار، آرامش و تمرکز می‌آورد؛ جایی که توجه به جزئیات در هر گوشه احساس می‌شود.',
 gift: 'دسته‌گل را با توجه به شخصیت، رابطه و حال‌وهوای مخاطب می‌چینیم؛ بی‌نیاز از یک مناسبت مشخص.',
 event: 'برای دورهمی‌ها و لحظه‌های کوچک؛ گلی که آن روز را کمی روشن‌تر و به‌یادماندنی‌تر می‌کند.',
};

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
 const reduced = useSafeReducedMotion();
 return <motion.div className={className} initial={{ opacity: 0, y: reduced ? 0 : 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .85, ease, delay }}>{children}</motion.div>;
}
function Modal({ children, title, onClose, wide = false }: { children: ReactNode; title: string; onClose: () => void; wide?: boolean }) {
 const ref = useRef<HTMLDivElement>(null);
 useEffect(() => {
  const previous = document.activeElement as HTMLElement;
  const overflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  ref.current?.focus();
  const key = (e: KeyboardEvent) => {
   if (e.key === 'Escape') onClose();
   if (e.key === 'Tab') {
    const els = ref.current?.querySelectorAll<HTMLElement>('button, a[href], input, textarea, select, [tabindex="0"]');
    if (!els?.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) { e.preventDefault(); first.focus(); }
   }
  };
  document.addEventListener('keydown', key);
  return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); previous?.focus(); };
 }, [onClose]);
 return <motion.div className={s.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
  <motion.div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={`${s.dialog} ${wide ? s.wideDialog : ''}`} initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: .5, ease }} onClick={e => e.stopPropagation()}>
   <div className={s.dialogHeader}><span>{title}</span><button className={s.iconButton} onClick={onClose} aria-label="بستن"><X size={24} /></button></div>{children}
  </motion.div>
 </motion.div>;
}

export default function FlowersExperience({ products }: { products: Product[] }) {
 const root = useRef<HTMLDivElement>(null);
 const hero = useRef<HTMLElement>(null);
 const reduced = useSafeReducedMotion();
 const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
 const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '24%']);
 const heroScale = useTransform(scrollYProgress, [0, 1], [1.035, 1.13]);
 const [panel, setPanel] = useState<Panel>(null);
 const [selected, setSelected] = useState<Product>(products[0]);
 const [category, setCategory] = useState<Category>('all');
 const [story, setStory] = useState(0);
 const [cart, setCart] = useState<CartItem[]>([]);
 const [ready, setReady] = useState(false);
 const [toast, setToast] = useState('');
 const [checkout, setCheckout] = useState(false);
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState('');
 const [receipt, setReceipt] = useState('');
 const [contactSent, setContactSent] = useState(false);
 const [faq, setFaq] = useState<number | null>(null);
 const [sticky, setSticky] = useState(false);
 const [zoom, setZoom] = useState<{ src: string; caption: string } | null>(null);
 const smoothScrollTo = useSmoothScroll();
  const closeRef = useRef<() => void>(() => {});
  const [close] = useState(() => () => closeRef.current());
  useEffect(() => { closeRef.current = () => { setPanel(null); setError(''); }; });
  /* eslint-disable react-hooks/set-state-in-effect -- upstream hydration pattern: localStorage is only read post-mount to avoid an SSR/CSR cart mismatch. */
  useEffect(() => {
   try { const saved = JSON.parse(localStorage.getItem('sim-flowers-cart-v1') || '[]'); if (Array.isArray(saved)) setCart(saved.filter((i: CartItem) => products.some(p => p.id === i.id) && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 10)); } catch { /* Fresh cart if storage is unavailable. */ }
   setReady(true);
  }, [products]);
  /* eslint-enable react-hooks/set-state-in-effect */
 useEffect(() => { if (ready) { try { localStorage.setItem('sim-flowers-cart-v1', JSON.stringify(cart)); } catch { /* Storage is optional. */ } } }, [cart, ready]);
 useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3200); return () => clearTimeout(timer); }, [toast]);
 const total = cart.reduce((sum, item) => sum + (products.find(p => p.id === item.id)?.price ?? 0) * item.quantity, 0);
 const count = cart.reduce((sum, item) => sum + item.quantity, 0);
 const showcase: ShowcaseItem[] = categories.map(c => ({ id: c.id, label: c.label, english: c.english, image: c.image, text: showcaseText[c.id] ?? '' }));
 // Upstream keeps a fixed header bar (rec1835390891) translated out of view
 // and slides it in once the hero has been scrolled past.
 useMotionValueEvent(scrollYProgress, 'change', value => { const next = value > .82; setSticky(current => current === next ? current : next); });
 const scrollTo = useCallback((id: string) => { setPanel(null); smoothScrollTo(id); }, [smoothScrollTo]);
 function pickCategory(id: Category) { setCategory(id); scrollTo('flowers-catalog'); }
 function add(product: Product) {
  setCart(current => { const exists = current.find(i => i.id === product.id); return exists ? current.map(i => i.id === product.id ? { ...i, quantity: Math.min(10, i.quantity + 1) } : i) : [...current, { id: product.id, quantity: 1 }]; });
  setReceipt(''); setToast(`${product.name} به سبد گل شما اضافه شد`);
 }
 function change(id: string, delta: number) { setCart(current => current.map(i => i.id === id ? { ...i, quantity: Math.min(10, i.quantity + delta) } : i).filter(i => i.quantity > 0)); }
 function openProduct(product: Product) { setSelected(product); setPanel('product'); }
 async function submitOrder(e: FormEvent<HTMLFormElement>) {
  e.preventDefault(); setBusy(true); setError(''); const fields = Object.fromEntries(new FormData(e.currentTarget));
  try { const response = await fetch('/api/flowers/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fields, items: cart }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setReceipt(data.id); setCart([]); setCheckout(false); }
  catch (err) { setError(err instanceof Error ? err.message : 'ارتباط برقرار نشد. دوباره تلاش کنید.'); } finally { setBusy(false); }
 }
 async function submitContact(e: FormEvent<HTMLFormElement>) {
  e.preventDefault(); setBusy(true); setError(''); const fields = Object.fromEntries(new FormData(e.currentTarget));
  try { const response = await fetch('/api/flowers/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setContactSent(true); }
  catch (err) { setError(err instanceof Error ? err.message : 'ارتباط برقرار نشد. دوباره تلاش کنید.'); } finally { setBusy(false); }
 }
 const fields = <><label>نام و نام خانوادگی<input name="name" autoComplete="name" placeholder="نام شما" minLength={2} maxLength={100} required /></label><label>شماره موبایل<input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰" required dir="ltr" /></label></>;
 return <MotionConfig reducedMotion="user"><div className={s.experience} dir="rtl" lang="fa" ref={root}>
  <NoiseOverlay />
  <CursorLayer />
  <StickyHeader visible={sticky} count={count} onNav={scrollTo} onContact={() => { setContactSent(false); setPanel('contact'); }} onCart={() => { setPanel('cart'); setError(''); }} />
  <div inert={panel ? true : undefined}>
   <section className={s.hero} ref={hero} id="flowers-top">
    <motion.div className={s.heroImage} style={{ y: reduced ? 0 : heroY, scale: reduced ? 1 : heroScale }}><img src="/flowers/hero.webp" alt="پرتره هنری با کلاه مشکی در پس‌زمینه سرخ استودیو گل سیم" fetchPriority="high" /></motion.div>
    <div className={s.heroShade} />
    <header className={s.header}>
     <a className={s.logo} href="/flowers" aria-label="گل سیم، صفحه اصلی">گُل<span>/</span>سیم<sup>®</sup><small>FLOWERS / SIM</small></a>
     <div className={`${s.headerNote} fl:flex fl:flex-col`}><span>استودیو گل‌آرایی، تهران</span><span className={s.status}><i /> هر روز، برای زیبایی</span></div>
     <nav className={s.desktopNav} aria-label="ناوبری اصلی"><button onClick={() => scrollTo('flowers-story')}><LinkSlide label="نگاه ما" /></button><button onClick={() => scrollTo('flowers-catalog')}><LinkSlide label="مجموعه گل‌ها" /></button><button onClick={() => scrollTo('flowers-team')}><LinkSlide label="آدم‌های سیم" /></button><button onClick={() => { setContactSent(false); setPanel('contact'); }}><LinkSlide label="گفت‌وگو با ما" /></button></nav>
     <button className={s.catalogPreview} onClick={() => scrollTo('flowers-catalog')} aria-label="دیدن مجموعه گل‌ها" data-flower-cursor="/flowers/tulip.webp" data-flower-cursor-label="THE FLOWER EDIT"><video muted loop playsInline autoPlay={!reduced} poster="/flowers/quiet.webp" src="/flowers/blossom.mp4" /><span>مجموعه گل‌ها <ArrowUpLeft size={23} /></span><small>THE FLOWER EDIT — ۰۱</small></button>
     <button className={`${s.iconButton} ${s.mobileMenu}`} onClick={() => setPanel('menu')} aria-label="باز کردن منو"><Menu /></button>
    </header>
    <div className={s.heroSide}><span className={s.tinyLabel}>برای هر حال، یک گل</span>{categories.map((c, i) => <button key={c.id} onClick={() => pickCategory(c.id)} data-flower-cursor={c.image} data-flower-cursor-label={c.english}><span>({['خ','ک','ع','ل'][i]})</span><LinkSlide label={c.label} /><ArrowUpLeft size={14} /></button>)}</div>
    <span className={s.verticalNote}>A LITTLE BEAUTY. EVERY DAY.</span>
    <div className={s.heroBottom}>
     <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15, duration: .8 }}>گل‌هایی که آرام به فضای شما جان می‌دهند؛<br />بی‌مناسبت، بی‌انتظار، بی‌نیاز از کلمه‌ای اضافه.</motion.p>
     <h1><BlurText text="کمی زیبایی، برای هر روز." delay={.25} /><br /><BlurText text="برای شما که" delay={.5} /> <em><BlurText text="ظرافت را زندگی می‌کنید." delay={.65} /></em></h1>
     <button className={s.scrollButton} onClick={() => scrollTo('flowers-story')} aria-label="کشف داستان سیم"><ArrowDown size={22} /><span>کمی پایین‌تر</span></button>
    </div>
    <div className={s.heroFoot}><span>گل / سیم — زیبایی، بی‌بهانه</span><span dir="ltr">TEHRAN, IRAN · EST. 2021</span></div>
   </section>

   <section className={s.storySection} id="flowers-story">
    <Reveal className={s.sectionTop}><span className={s.eyebrow}>۰۱ / نگاه ما</span><span dir="ltr">THE ART OF LESS</span></Reveal>
    <div className={s.storyGrid}>
     <div className={s.storyIntro}><Reveal><h2><BlurText text="زیبایی،" /><br /><span className={s.accentStone}><BlurText text="در ساده‌ترین شکل." delay={.15} /></span></h2><p>ما در سیم، گل‌ها را برای یک مناسبت نمی‌چینیم.<br />برای یک حس می‌چینیم. حسی که به خانه می‌آید<br />و کمی بیشتر از یک لحظه، می‌ماند.</p></Reveal><div className={`${s.storyImage} ${m.zoomHost}`}><AnimatePresence mode="wait"><motion.img key={story} src={stories[story].image} alt={stories[story].title} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .5 }} /></AnimatePresence><span>( S / {persian(story + 1)} )</span><button className={m.zoomTrigger} onClick={() => setZoom({ src: stories[story].image, caption: stories[story].title })} aria-label={`نمایش بزرگ ${stories[story].title}`}><Maximize2 size={16} /></button></div><div className={s.imageCaption}><span>طبیعت، بدون هیچ کلمه اضافه.</span><Flower2 size={20} strokeWidth={1} /></div></div>
     <div className={s.storyList}>{stories.map((item, i) => <Reveal key={item.title} delay={i * .06}><div className={`${s.storyItem} ${story === i ? s.storyActive : ''}`}><button onClick={() => setStory(i)} aria-expanded={story === i} aria-controls={`story-${i}`}><span className={s.storyNumber}>۰{persian(i + 1)}</span><h3>{item.title}</h3><span className={s.storyToggle}>{story === i ? <Minus size={20} /> : <Plus size={20} />}</span></button><AnimatePresence initial={false}>{story === i && <motion.div id={`story-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .4, ease }}><p>{item.text}</p></motion.div>}</AnimatePresence></div></Reveal>)}<p className={s.storySignature}>با حوصله انتخاب می‌کنیم.<br />با عشق کنار هم می‌گذاریم.<span>تیم گل / سیم</span></p></div>
    </div>
   </section>

   <section className={s.occasionSection}><Reveal className={s.sectionTop}><h2><BlurText text="هر گل، یک قصه." /></h2><span>قصه شما کدام است؟</span></Reveal><div className={s.occasionGrid}>{categories.map((c, i) => <Reveal key={c.id} delay={i * .08}><button className={s.occasionCard} onClick={() => pickCategory(c.id)} data-flower-cursor={c.image} data-flower-cursor-label={c.english}><div className={s.occasionImage}><img src={c.image} alt={c.label} loading="lazy" /><span className={s.imageArrow}><ArrowUpLeft /></span><span className={s.occasionNumber}>۰{persian(i + 1)}</span></div><div className={s.occasionCaption}><h3>{c.label}</h3><span dir="ltr">{c.english}</span></div></button></Reveal>)}</div><Rule className={s.occasionRule} /></section>

   <section className={s.manifesto}><span className={s.eyebrow}>فلسفه سیم</span><Reveal><h2><BlurText text="برای گل خریدن،" /><br /><BlurText text="لازم نیست" delay={.12} /> <span className={s.accentRose}><BlurText text="اتفاقی افتاده باشد." delay={.24} /></span><br /><BlurText text="گاهی، خودِ گل اتفاق است." delay={.36} /></h2></Reveal><div className={s.manifestoBottom}><Flower2 size={46} strokeWidth={.8} /><p>ما به شادی‌های کوچک باور داریم. به یک شاخه روی میز،<br />به نوری که از لابه‌لای گلبرگ‌ها می‌گذرد،<br />به روزی که بی‌هیچ بهانه‌ای، زیباتر می‌شود.</p><span dir="ltr">NOT FOR AN OCCASION.<br />FOR A FEELING.</span></div></section>

   <PinnedShowcase items={showcase} eyebrow="پشت هر انتخاب، یک نگاه" onSelect={id => pickCategory(id as Category)} />

   <section className={s.catalogSection} id="flowers-catalog"><Reveal className={s.sectionTop}><div><span className={s.eyebrow}>۰۲ / مجموعه گل‌ها</span><h2><BlurText text="از طبیعت، برای شما." /></h2></div><p>تازه، فصلی، با دقت انتخاب‌شده.<br />هر دسته گل، به شیوه خودش یگانه است.</p></Reveal><div className={s.filterBar}><div className={s.filters}>{[{ id: 'all', label: 'همه گل‌ها' }, ...categories].map(c => <button key={c.id} className={category === c.id ? s.filterActive : ''} onClick={() => setCategory(c.id as Category)} aria-pressed={category === c.id}>{c.label}{category === c.id && <span>↙</span>}</button>)}</div><span>{persian(products.filter(p => category === 'all' || p.category === category).length)} انتخابِ سیم</span></div><motion.div layout className={s.productGrid}><AnimatePresence mode="popLayout">{products.filter(p => category === 'all' || p.category === category).map(product => <motion.article key={product.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .97 }} transition={{ duration: .4, ease }} className={s.productCard}><button className={s.productImage} onClick={() => openProduct(product)} data-flower-cursor={product.image} data-flower-cursor-label={product.name}><img src={product.image} alt={product.subtitle} loading="lazy" /><span className={s.productTag}>{product.stems}</span><span className={s.viewProduct}>نگاه نزدیک‌تر <ArrowUpLeft size={18} /></span></button><div className={s.productInfo}><button onClick={() => openProduct(product)}><h3>{product.name}</h3><p>{product.subtitle}</p></button><button className={s.addButton} onClick={() => add(product)} aria-label={`افزودن ${product.name} به سبد`}><Plus size={21} /></button></div><p className={s.price}>{money(product.price)} <span>تومان</span></p></motion.article>)}</AnimatePresence></motion.div><div className={s.catalogNote}><span><i /> تازه از گلخانه‌های ایران</span><span>ارسال با مراقبت، در سراسر تهران <ArrowLeft size={16} /></span></div></section>

   <section className={s.spaceSection}><div className={`${s.spaceImage} ${m.zoomHost}`}><img src="/flowers/interior.webp" alt="چیدمان گل در فضای آرام یک خانه" loading="lazy" /><button className={m.zoomTrigger} onClick={() => setZoom({ src: '/flowers/interior.webp', caption: 'گل، در زندگی واقعی' })} aria-label="نمایش بزرگ تصویر چیدمان"><Maximize2 size={16} /></button></div><div className={s.spaceContent}><span className={s.eyebrow}>گل، در زندگی واقعی</span><Reveal><h2><BlurText text="یک گوشه از خانه." /><br /><em><BlurText text="یک جهان، حال خوب." delay={.15} /></em></h2><p>گل‌ها چیزی به فضا اضافه نمی‌کنند؛<br />چیزی را که کم بود، به آن برمی‌گردانند.<br />با هم، گل مناسب فضای شما را پیدا می‌کنیم.</p><button className={s.textLink} onClick={() => { setContactSent(false); setPanel('contact'); }}>برای فضای من پیشنهاد بده <ArrowUpLeft size={24} /></button></Reveal><span className={s.spaceFoot}>HOME IS WHERE THE FLOWERS ARE.</span></div></section>

   <section className={s.teamSection} id="flowers-team"><Reveal className={s.sectionTop}><span className={s.eyebrow}>۰۳ / آدم‌های سیم</span><h2><BlurText text="دست‌هایی که" /><br /><span className={s.accentMuted}><BlurText text="زیبایی را می‌شناسند." delay={.15} /></span></h2><p>پشت هر دسته گل، یک نگاه است.<br />و پشت هر نگاه، عشقی به طبیعت.</p></Reveal>{[{ name: 'نیلوفر', role: 'بنیان‌گذار و طراح گل', text: 'زیبایی را در جزئیات کوچک پیدا می‌کند؛ در خم یک ساقه و در فاصله میان دو گل.' }, { name: 'رها', role: 'طراح فضا و چیدمان', text: 'گل‌ها را ادامه‌ای از فضای شما می‌بیند. هر چیدمانش، گفت‌وگویی میان طبیعت و خانه است.' }, { name: 'سارا', role: 'همراه شما در انتخاب', text: 'با حوصله می‌شنود، با دقت پیشنهاد می‌دهد؛ تا گل‌ها درست شبیه حسی باشند که در ذهن دارید.' }].map((member, i) => <Reveal key={member.name}><div className={s.teamRow}><span className={s.teamIndex}>۰{persian(i + 1)}</span><h3>{member.name}</h3><span className={s.teamRole}>{member.role}</span><p>{member.text}</p><Flower2 size={23} strokeWidth={1} /></div></Reveal>)}</section>

   <section className={s.faqSection}><h2><BlurText text="شاید بپرسید." /></h2><div>{[{ q: 'گل‌ها در چه محدوده‌ای ارسال می‌شوند؟', a: 'در نسخه واقعی، ارسال در تمام مناطق تهران با پیک ویژه گل انجام می‌شود. این صفحه یک نسخه آزمایشی است و ارسال واقعی ندارد.' }, { q: 'می‌توانم دسته گل دلخواهم را سفارش بدهم؟', a: 'بله. از بخش گفت‌وگو با ما، رنگ، بودجه و حال‌وهوای دلخواهتان را بنویسید تا برای طراحی اختصاصی راهنمایی شوید.' }, { q: 'چطور گل‌هایم را تازه‌تر نگه دارم؟', a: 'هر دو روز آب گلدان را عوض کنید، یک سانتی‌متر از ساقه را اریب ببرید و گل‌ها را دور از آفتاب مستقیم و میوه‌ها بگذارید.' }].map((item, i) => <div className={s.faqItem} key={item.q}><button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i}>{item.q}{faq === i ? <Minus size={18} /> : <Plus size={18} />}</button><AnimatePresence>{faq === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}><p>{item.a}</p></motion.div>}</AnimatePresence></div>)}</div></section>

   <footer className={s.footer}><div className={s.footerTop}><div><span className={s.eyebrow}>همیشه، یک بهانه برای زیبایی هست.</span><h2><BlurText text="از حال‌وهوایتان بگویید." /><br /><BlurText text="گلش را ما پیدا می‌کنیم." delay={.15} /></h2><button className={s.footerContact} onClick={() => { setContactSent(false); setPanel('contact'); }}><LinkSlide label="گفت‌وگو با ما" /> <ArrowUpLeft size={30} /></button></div><div className={s.footerLinks}><span>کمی نزدیک‌تر</span><button onClick={() => scrollTo('flowers-story')}><LinkSlide label="داستان سیم" /></button><button onClick={() => scrollTo('flowers-catalog')}><LinkSlide label="مجموعه گل‌ها" /></button><button onClick={() => scrollTo('flowers-team')}><LinkSlide label="آدم‌های سیم" /></button><span className={s.footerLocation}>تهران، ایران<br />شنبه تا پنجشنبه، ۹ تا ۱۹</span></div><button className={s.backTop} onClick={() => scrollTo('flowers-top')} aria-label="بازگشت به بالا"><ArrowDown size={26} /></button></div><div className={s.footerWordmark}>گُل<span>/</span>سیم<sup>®</sup><span className={s.footerFlower}>✳</span></div><div className={s.footerBottom}><span>© گل / سیم ۱۴۰۵</span><span>نسخه نمایشی — بدون پرداخت و ارسال واقعی</span><span dir="ltr">FLOWERS, WITH FEELING.</span></div></footer>
   <button className={s.cartFloat} onClick={() => { setPanel('cart'); setError(''); }} aria-label={`سبد گل، ${persian(count)} محصول`}><ShoppingBag size={22} strokeWidth={1.4} /><span>{persian(count)}</span></button>
  </div>

  <AnimatePresence>{toast && <motion.div className={s.toast} role="status" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}><Check size={18} /><span>{toast}</span><button onClick={() => { setToast(''); setPanel('cart'); }}>دیدن سبد <ArrowLeft size={16} /></button></motion.div>}</AnimatePresence>
  <AnimatePresence>{panel && <Modal key={panel} title={panel === 'menu' ? 'گل / سیم' : panel === 'cart' ? `سبد گل شما (${persian(count)})` : panel === 'product' ? 'یک نگاه نزدیک‌تر' : 'گفت‌وگو با سیم'} onClose={close} wide={panel === 'product'}>
   {panel === 'menu' && <div className={s.menuContent}>{[['نگاه ما','flowers-story'],['مجموعه گل‌ها','flowers-catalog'],['آدم‌های سیم','flowers-team']].map(([name, id], i) => <motion.button initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .08 }} key={id} onClick={() => scrollTo(id)}><span>۰{persian(i + 1)}</span>{name}<ArrowUpLeft /></motion.button>)}<button onClick={() => { setContactSent(false); setPanel('contact'); }}><span>۰۴</span>گفت‌وگو با ما<ArrowUpLeft /></button><p>استودیو گل‌آرایی سیم / تهران<br />کمی زیبایی، برای هر روز.</p></div>}
   {panel === 'product' && <div className={s.productDetail}><div className={`${s.detailImage} ${m.zoomHost}`}><img src={selected.image} alt={selected.subtitle} /><button className={m.zoomTrigger} onClick={() => setZoom({ src: selected.image, caption: selected.name })} aria-label={`نمایش بزرگ ${selected.name}`}><Maximize2 size={16} /></button></div><div><span className={s.eyebrow}>{selected.subtitle} / انتخاب سیم</span><h2>{selected.name}</h2><p>{selected.description}</p><div className={s.detailFacts}><span>ترکیب</span><span>{selected.stems}</span><span>بسته‌بندی</span><span>کاغذ طبیعی و روبان پارچه‌ای</span><span>محدوده ارسال</span><span>تهران · نسخه آزمایشی</span></div><div className={s.detailPrice}>{money(selected.price)} <small>تومان</small></div><button className={s.primaryButton} onClick={() => add(selected)}>به سبد گلم اضافه کن <Plus size={20} /></button><small className={s.finePrint}>هر گل فرم طبیعی خودش را دارد؛ ممکن است کمی با تصویر متفاوت باشد.</small></div></div>}
   {panel === 'cart' && <div className={s.cartContent}>{receipt ? <div className={s.emptyState}><span className={s.successIcon}><Check size={35} /></span><h2>یک انتخاب زیبا.</h2><p>سفارش آزمایشی شما ثبت شد.<br />پرداخت یا ارسال واقعی انجام نمی‌شود.</p><span dir="ltr" className={s.receipt}>{receipt}</span><button className={s.primaryButton} onClick={() => { close(); scrollTo('flowers-catalog'); }}>بازگشت به گل‌ها <ArrowLeft size={18} /></button></div> : !cart.length ? <div className={s.emptyState}><Flower2 size={56} strokeWidth={1} /><h2>جای یک گل خالی‌ست.</h2><p>گل دلخواهتان را پیدا کنید؛<br />یک حال خوب کوچک منتظر شماست.</p><button className={s.primaryButton} onClick={() => scrollTo('flowers-catalog')}>دیدن مجموعه گل‌ها <ArrowLeft size={18} /></button></div> : <>{cart.map(item => { const product = products.find(p => p.id === item.id)!; return <div className={s.cartItem} key={item.id}><img src={product.image} alt={product.name} /><div><h3>{product.name}</h3><p>{money(product.price)} تومان</p><div className={s.quantity}><button onClick={() => change(item.id, 1)} disabled={item.quantity >= 10} aria-label={`افزایش تعداد ${product.name}`}><Plus size={15} /></button><span>{persian(item.quantity)}</span><button onClick={() => change(item.id, -1)} aria-label={`کاهش تعداد ${product.name}`}><Minus size={15} /></button></div></div><button className={s.removeItem} onClick={() => setCart(cart.filter(i => i.id !== item.id))} aria-label={`حذف ${product.name}`}><X size={18} /></button></div>; })}<div className={s.cartTotal}><span>جمع گل‌های شما</span><strong>{money(total)} <small>تومان</small></strong></div><p className={s.mockNote}>نسخه نمایشی است. هیچ مبلغی از شما دریافت نمی‌شود.</p>{checkout ? <form className={s.form} onSubmit={submitOrder}><h3>این گل‌ها کجا بروند؟</h3>{fields}<label>آدرس کامل در تهران<textarea name="address" placeholder="محله، خیابان، پلاک و واحد" minLength={10} maxLength={1000} required rows={3} /></label><label>یادداشت همراه گل <span>(اختیاری)</span><textarea name="note" placeholder="چند کلمه از دل شما..." maxLength={500} rows={2} /></label>{error && <p className={s.error} role="alert">{error}</p>}<button className={s.primaryButton} disabled={busy}>{busy ? 'در حال ثبت...' : 'ثبت سفارش آزمایشی'}<ArrowLeft size={18} /></button><button type="button" className={s.subtleButton} onClick={() => setCheckout(false)}>بازگشت به سبد</button></form> : <button className={s.primaryButton} onClick={() => setCheckout(true)}>ادامه و ثبت سفارش <ArrowLeft size={18} /></button>}</>}</div>}
   {panel === 'contact' && (contactSent ? <div className={s.emptyState}><Check size={50} strokeWidth={1} /><h2>از شما شنیدیم.</h2><p>پیام آزمایشی شما دریافت شد.<br />در این نسخه، پیامی برای استودیو ارسال نمی‌شود.</p><button className={s.primaryButton} onClick={close}>تا یک حال خوب دیگر <ArrowLeft size={18} /></button></div> : <div className={s.contactContent}><span className={s.eyebrow}>هر دسته گل، با یک گفت‌وگو شروع می‌شود.</span><h2>از حال‌وهوایتان بگویید.</h2><p>برای خانه، یک عزیز، یا یک روز خاص؟<br />اینجا از ایده‌ای که در ذهن دارید بنویسید.</p><form onSubmit={submitContact} className={s.form}>{fields}<label>پیام شما<textarea name="message" placeholder="دوست دارم یک دسته گل..." minLength={5} maxLength={2000} required rows={4} /></label>{error && <p className={s.error} role="alert">{error}</p>}<button disabled={busy} className={s.primaryButton}>{busy ? 'در حال ارسال...' : 'ارسال پیام آزمایشی'}<ArrowUpLeft size={20} /></button><small className={s.finePrint}>این فرم نمایشی است و به استودیوی واقعی متصل نیست.</small></form></div>)}
  </Modal>}</AnimatePresence>
  <ZoomLightbox open={!!zoom} src={zoom?.src ?? ''} caption={zoom?.caption} onClose={() => setZoom(null)} />
 </div></MotionConfig>;
}
