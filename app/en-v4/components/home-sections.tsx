"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, CalendarDays, MapPin, Minus, Plus } from "lucide-react";
import { articles, caseExamples, faqs, reasons, treatments } from "../lib/clinic-data";
import { ease, Instagram, Magnetic, Reveal, SectionHeading, Star, TextButton, Youtube } from "./ui";

export function NewsStrip({ onArticle }: { onArticle: (id: string) => void }) {
  return <section className="news-strip inner" aria-label="お知らせ"><h2 className="serif">NEWS</h2><div className="news-items">{articles.slice(0, 2).map((article) => <button className="news-item" key={article.id} onClick={() => onArticle(article.id)}><div className="news-thumb"><img src={article.image} alt="" /></div><div className="news-content"><div className="news-meta"><time>{article.date}</time><span>{article.category}</span></div><h3>{article.title}</h3></div><ArrowUpRight className="news-arrow" size={16} strokeWidth={1.3} /></button>)}</div></section>;
}

export function Introduction() {
  return <>
    <section id="about" className="intro-section section-space inner"><Reveal className="intro-heading"><span className="eyebrow"><Star />OUR PHILOSOPHY</span><h2>呼び起こす、<br /><span>美しさ</span></h2><p className="serif">Evoke your true beauty.</p></Reveal><Reveal className="intro-copy" delay={0.12}><p>私たちは、美を追求する<br />皆さまのための専門クリニックです。</p><p>カウンセリングを大切にして、<br />「キレイになりたい」「若返りたい」を全力で応援します。<br />PEGASUS CLINICでの「人生が変わる経験」をきっかけに、<br />美のメンテナンスがより身近で楽しいものになれば幸いです。</p><h3>美容医療は、あなたの味方。</h3><p>経験豊富な院長と、優しいスタッフが、<br />あなたを笑顔でお迎えします。</p><a href="#reasons" className="intro-next"><span>私たちが大切にしていること</span><ArrowDown size={17} strokeWidth={1.2} /></a></Reveal></section>
    <div className="beauty-marquee" aria-hidden="true"><div>{[0, 1, 2, 3].map((i) => <span key={i} className="serif">Evoke your true beauty<Star /></span>)}</div></div>
  </>;
}

export function ClinicReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const clipPath = useTransform(scrollYProgress, [0, 0.5, 1], ["ellipse(34% 46% at 50% 50%)", "ellipse(72% 76% at 50% 50%)", "ellipse(90% 85% at 50% 50%)"]);
  const y = useTransform(scrollYProgress, [0, 1], [-45, 45]);
  return <section className="clinic-reveal" ref={ref} aria-label="心地よい空間で、あなたをお迎えします"><motion.div className="clinic-reveal-mask" style={{ clipPath: reduced ? undefined : clipPath }}><motion.img src="/v4/images/clinic-wide.jpg" alt="明るく心地よいPEGASUS CLINICの内観" loading="lazy" style={{ y: reduced ? 0 : y }} /><div className="clinic-reveal-shade" /><Reveal className="clinic-reveal-copy"><Star /><p>あなたのための、心地よい場所。</p><h2 className="serif">Just be you.</h2></Reveal></motion.div></section>;
}

export function ReasonsSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (value) => { if (window.innerWidth > 900 && !reduced) setActive(Math.min(2, Math.max(0, Math.floor(value * 3)))); });
  function select(index: number) {
    setActive(index);
    if (window.innerWidth > 900 && ref.current && !reduced) {
      const top = ref.current.getBoundingClientRect().top + window.scrollY;
      const travel = ref.current.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + travel * ((index + 0.15) / 3), behavior: "smooth" });
    }
  }
  return <section className="reasons-track" id="reasons" ref={ref}><div className="reasons-sticky"><div className="reasons-inner inner"><div className="reasons-intro"><SectionHeading en="Reason" jp="選ばれる理由" /><h3>PEGASUS CLINICが<br />選ばれる理由</h3><p>経験豊富な医師とスタッフが揃い、<br />あなたのお悩みの解決を目指します。</p><div className="reason-switcher"><div className="reason-pages">{reasons.map((_, index) => <button key={index} className={active === index ? "active" : ""} aria-label={`選ばれる理由 ${index + 1}`} aria-pressed={active === index} onClick={() => select(index)}><span>0{index + 1}</span></button>)}</div><span className="reason-step-label">OUR PROMISE TO YOU</span></div></div><div className="reason-display"><AnimatePresence mode="wait" initial={false}><motion.article key={active} className="reason-card" initial={{ opacity: 0, y: reduced ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -18 }} transition={{ duration: 0.55, ease }}><span className="reason-number serif">0{active + 1}</span><div className="reason-photo"><img src={reasons[active].image} alt={reasons[active].title.replace("\n", "")} loading="lazy" /></div><h3>{reasons[active].title}</h3><p>{reasons[active].description}</p><div className="reason-bottom-line"><img src="/v4/images/shine.svg" alt="" /><span /></div></motion.article></AnimatePresence></div></div><span className="reason-watermark serif" aria-hidden="true">Reason</span></div></section>;
}

export function Recommended({ onTreatment }: { onTreatment: (id: string) => void }) {
  return <section className="recommended-section section-space inner" id="recommended"><Reveal className="recommended-heading"><SectionHeading en="Recommended" jp="おすすめの施術" /><p>なりたい自分へ。<br />あなたに合った、美容医療を。</p></Reveal><div className="recommended-list">{treatments.map((treatment, index) => <Reveal className={`treatment-row treatment-row-${index + 1}`} key={treatment.id}><div className="treatment-row-copy"><span className="treatment-number serif">{treatment.number}</span><p className="treatment-english serif">{treatment.english}</p><h3>{treatment.title}</h3><div className="tag-list">{treatment.tags.map((tag) => <span key={tag}># {tag}</span>)}</div><p className="treatment-description">{treatment.description}</p><TextButton onClick={() => onTreatment(treatment.id)}>施術について詳しく</TextButton></div><button className="treatment-photo" onClick={() => onTreatment(treatment.id)} aria-label={`${treatment.title}の詳細`}><img src={treatment.image} alt={treatment.title} loading="lazy" /><span className="photo-hover-label serif">View<ArrowUpRight size={20} strokeWidth={1.2} /></span><span className="treatment-photo-index">PEGASUS BEAUTY / 0{index + 1}</span></button></Reveal>)}</div></section>;
}

const concerns = [
  { id: "eyes", title: "目元・二重", en: "Eyes", icon: "03", treatment: "double-eyelid" },
  { id: "spots", title: "シミ・くすみ", en: "Skin", icon: "11", treatment: "laser" },
  { id: "wrinkles", title: "シワ・たるみ", en: "Aging care", icon: "15", treatment: "hyaluronic" },
  { id: "contour", title: "フェイスライン", en: "Face line", icon: "01", treatment: "hyaluronic" },
  { id: "pores", title: "毛穴・ニキビ", en: "Skin texture", icon: "13", treatment: "laser" },
  { id: "hair", title: "医療脱毛", en: "Hair removal", icon: "09", treatment: null },
];

export function TreatmentMenu({ onTreatment, onPrice, onBook }: { onTreatment: (id: string) => void; onPrice: () => void; onBook: (title?: string) => void }) {
  const [category, setCategory] = useState("concerns");
  const [selected, setSelected] = useState<string | null>(null);
  const concern = concerns.find((item) => item.id === selected);
  return <section id="treatments" className="treatment-menu-section section-space"><div className="inner"><Reveal className="menu-title-row"><SectionHeading en="Treatment menu" jp="施術メニュー" /><p>あなたのお悩みを、お聞かせください。</p></Reveal><Reveal className="treatment-menu-panel"><div className="menu-tabs" role="tablist" aria-label="施術メニューの表示方法">{[{ id: "concerns", label: "お悩みから探す" }, { id: "surgery", label: "美容外科" }, { id: "skin", label: "美容皮膚科" }].map((tab) => <button role="tab" aria-selected={category === tab.id} key={tab.id} onClick={() => { setCategory(tab.id); setSelected(null); }} className={category === tab.id ? "active" : ""}>{tab.label}{category === tab.id && <motion.span layoutId="menu-tab-indicator" className="menu-tab-indicator" />}</button>)}</div>
    <AnimatePresence mode="wait" initial={false}><motion.div key={category} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={{ duration: 0.25 }}>{category === "concerns" ? <><div className="concerns-grid">{concerns.map((item) => <button key={item.id} className={selected === item.id ? "active" : ""} aria-expanded={selected === item.id} onClick={() => setSelected(selected === item.id ? null : item.id)}><span className="concern-icon"><img src={`/images/parts-${item.icon}.svg`} alt="" /></span><strong>{item.title}</strong><span className="serif">{item.en}</span><Plus size={14} strokeWidth={1.2} /></button>)}</div><AnimatePresence>{concern && <motion.div className="concern-result" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}><div><span>{concern.title}のお悩みに</span><button onClick={() => concern.treatment ? onTreatment(concern.treatment) : onBook("医療脱毛")}>{concern.treatment ? treatments.find((item) => item.id === concern.treatment)?.title : "医療脱毛について相談する"}<ArrowUpRight size={18} /></button><p>適した施術は医師が診察のうえご提案します。</p></div></motion.div>}</AnimatePresence></> : <div className="menu-treatment-list">{treatments.filter((item) => item.category === category).map((item) => <button key={item.id} onClick={() => onTreatment(item.id)}><img src={item.image} alt="" /><span><strong>{item.title}</strong><small className="serif">{item.english}</small></span><ArrowUpRight size={22} strokeWidth={1.2} /></button>)}</div>}</motion.div></AnimatePresence>
    <div id="price" className="menu-price-link"><span>施術の料金についてはこちら</span><TextButton onClick={onPrice}>料金一覧を見る</TextButton></div></Reveal></div></section>;
}

export function DoctorSection({ onBook }: { onBook: () => void }) {
  return <section id="doctor" className="doctor-section section-space inner"><Reveal className="doctor-visual"><div className="doctor-photo"><img src="/v4/images/reason-01.jpg" alt="PEGASUS CLINIC 院長 井上 礎馬" loading="lazy" /></div><Star className="doctor-star" stroke /><p className="doctor-photo-caption serif">Expertise with empathy.</p></Reveal><Reveal className="doctor-copy" delay={0.1}><SectionHeading en="Your doctor" jp="ドクター紹介" /><h3>あなたの「なりたい」に、<br />誠実に、丁寧に。</h3><p>美容医療を通じて、毎日がもっと楽しくなる。<br />そのきっかけをつくりたいと考えています。</p><p>カウンセリングから施術、アフターケアまで、<br />一人ひとりの想いに寄り添い、責任を持って担当します。<br />小さなお悩みも、どうぞ安心してお聞かせください。</p><div className="doctor-name"><span>PEGASUS CLINIC 院長</span><h4>井上 礎馬<small className="serif">Sohma Inoue</small></h4></div><TextButton onClick={onBook}>カウンセリングを予約する</TextButton></Reveal></section>;
}

export function CasesSection({ onCase }: { onCase: (id: string) => void }) {
  const [category, setCategory] = useState("all");
  return <section id="cases" className="cases-section section-space"><div className="inner"><Reveal className="cases-heading"><SectionHeading en="Case photos" jp="症例写真" /><p>小さな変化が、毎日の自信に。</p></Reveal><div className="filter-tabs case-filters" role="tablist" aria-label="症例カテゴリ">{[{ id: "all", label: "すべて" }, { id: "eyes", label: "目元" }, { id: "contour", label: "フェイスライン" }].map((item) => <button role="tab" aria-selected={category === item.id} className={category === item.id ? "active" : ""} key={item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div><motion.div layout className="case-grid"><AnimatePresence mode="popLayout">{caseExamples.filter((item) => category === "all" || item.category === category).map((item) => <motion.button layout key={item.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, ease }} className="case-card" onClick={() => onCase(item.id)}><div className="case-image"><img src={item.image} alt={`${item.title}の症例写真`} loading="lazy" /><span className="case-view"><ArrowUpRight size={22} strokeWidth={1.2} /></span></div><div className="case-text"><span className="eyebrow">{item.number} / CASE STUDY</span><h3>{item.title}</h3><p>{item.subtitle}</p></div></motion.button>)}</AnimatePresence></motion.div><p className="case-disclaimer">※ 施術の効果・経過には個人差があります。施術内容・費用・リスクは各症例の詳細をご確認ください。</p></div></section>;
}

export function JournalSection({ onArticle }: { onArticle: (id: string) => void }) {
  return <section id="journal" className="journal-section section-space inner"><Reveal className="journal-heading"><SectionHeading en="Beauty journal" jp="美容コラム" /><p>もっと知る。もっと、自分を好きになる。</p></Reveal><div className="journal-grid">{articles.map((article, index) => <Reveal delay={index * 0.08} key={article.id}><button className="journal-card" onClick={() => onArticle(article.id)}><div className="journal-image"><img src={article.image} alt="" loading="lazy" /><span><ArrowUpRight size={20} strokeWidth={1.3} /></span></div><div className="journal-meta"><time>{article.date}</time><span>{article.category}</span></div><h3>{article.title}</h3><span className="journal-read serif">Read the story<ArrowRight size={16} strokeWidth={1.1} /></span></button></Reveal>)}</div></section>;
}

export function FAQSection() {
  const [opened, setOpened] = useState<number | null>(null);
  return <section id="faq" className="faq-section section-space inner"><Reveal className="faq-heading"><SectionHeading en="A little reassurance." jp="よくあるご質問" /><p>はじめの一歩を、安心して。</p><img src="/v4/images/pegasus.svg" alt="" /></Reveal><div className="faq-list">{faqs.map((item, index) => <Reveal key={item.question} delay={index * 0.04}><article className={`faq-item ${opened === index ? "opened" : ""}`}><h3><button onClick={() => setOpened(opened === index ? null : index)} aria-expanded={opened === index} aria-controls={`faq-answer-${index}`}><span className="faq-q serif">Q.</span><span>{item.question}</span><span className="faq-toggle">{opened === index ? <Minus size={17} strokeWidth={1.2} /> : <Plus size={17} strokeWidth={1.2} />}</span></button></h3><AnimatePresence initial={false}>{opened === index && <motion.div id={`faq-answer-${index}`} className="faq-answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }}><p>{item.answer}</p></motion.div>}</AnimatePresence></article></Reveal>)}</div></section>;
}

export function ContactFooter({ onBook, onCalendar, onPrice, onPrivacy }: { onBook: () => void; onCalendar: () => void; onPrice: () => void; onPrivacy: () => void }) {
  return <>
    <section id="contact" className="contact-section"><div className="contact-grain" /><div className="inner"><Reveal className="contact-heading"><div><span className="eyebrow">ご予約・お問い合わせ</span><h2 className="serif">Contact</h2></div><img src="/v4/images/pegasus-white.svg" alt="" /></Reveal><Reveal className="contact-body"><h3>あなたらしい美しさへ、<br />最初の一歩を。</h3><div><p>お客様との対話を大切にしていますので、<br />完全予約制となっております。<br />ご予約の上お越しください。</p><a className="contact-phone serif" href="tel:0534158081"><small>tel.</small>053-415-8081</a><span className="contact-hours">受付時間 9:00〜18:00</span></div></Reveal><Reveal className="contact-buttons"><a href="https://lin.ee/zw4msSt" target="_blank" rel="noopener noreferrer"><div><span className="serif">LINE Contact</span><small>LINE予約はこちら</small></div><ArrowUpRight size={25} strokeWidth={1.2} /></a><button onClick={onBook}><div><span className="serif">WEB Contact</span><small>WEBでのご予約はこちら</small></div><ArrowUpRight size={25} strokeWidth={1.2} /></button></Reveal></div><Star className="contact-star-one" stroke /><Star className="contact-star-two" stroke /></section>
    <footer className="site-footer"><div id="access" className="footer-main inner"><div className="footer-clinic"><a href="#top" className="footer-logo"><img src="/v4/images/logo.svg" alt="PEGASUS CLINIC" width={250} height={46} /></a><p className="footer-specialty">美容外科 / 美容皮膚科</p><p>静岡県浜松市中央区鍛冶町140-4<br />浜松Aビル 北館7階</p><a href="https://www.google.com/maps/search/?api=1&query=PEGASUS+CLINIC+浜松" target="_blank" rel="noopener noreferrer" className="map-link"><MapPin size={15} strokeWidth={1.2} /><span>浜松駅から徒歩5分</span><ArrowUpRight size={16} /></a><div className="footer-socials"><a href="https://www.instagram.com/sohma_inoue.pegasus/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a><a href="https://www.youtube.com/@Dr.%E4%BA%95%E4%B8%8A%E7%A4%8E%E9%A6%AC%E3%81%AE%E7%BE%8E%E5%AE%B9%E5%A1%BE%E3%83%81%E3%83%A3%E3%83%B3" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={21} /></a><a href="https://www.tiktok.com/@pegasus_s.inoue" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><img src="/v4/images/tiktok.svg" alt="" /></a></div></div><div className="footer-navigation"><a href="#about">初めての方へ</a><a href="#doctor">ドクター紹介</a><a href="#treatments">施術メニュー</a><button onClick={onPrice}>料金案内</button><a href="#journal">美容コラム</a><a href="#cases">症例写真</a><a href="#faq">よくあるご質問</a><button onClick={onPrivacy}>プライバシーポリシー</button></div><div className="footer-schedule"><span className="eyebrow">CLINIC HOURS</span><p className="serif">9:00 – 18:00</p><span>カウンセリング最終受付 16:30</span><span>休診日：不定休</span><TextButton onClick={onCalendar}><CalendarDays size={16} strokeWidth={1.2} />診療カレンダー</TextButton></div></div><div className="footer-bottom inner"><small>© PEGASUS CLINIC. Design recreation.</small><span>非公式デモサイト・実際の予約は行われません</span><Magnetic><a href="#top" className="back-to-top" aria-label="ページの先頭へ"><span className="serif">Back to top</span><ArrowUp size={18} strokeWidth={1.2} /></a></Magnetic></div></footer>
  </>;
}
