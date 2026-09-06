"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Globe2, Menu, Play, Plus, X } from "lucide-react";
import { consultationTypes, faqs, navigation, processSteps, services, testimonials } from "../lib/site-content";
import { BookingForm } from "./booking-form";
import { MotionSystem, Words, ShaninaShell } from "./motion-system";

const imagePath = (name: string) => `/v2/images/${name}`;
const refreshLayout = () => window.dispatchEvent(new Event("layout:changed"));

function Picture({ desktop, mobile, alt = "", className = "", eager = false }: { desktop: string; mobile?: string; alt?: string; className?: string; eager?: boolean }) {
  return <picture className={className}>{mobile && <source media="(max-width: 767px)" srcSet={imagePath(mobile)} />}<img src={imagePath(desktop)} alt={alt} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} draggable={false} /></picture>;
}

function Star({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 356 356" fill="none" aria-hidden="true"><path d="M178 0s-2.346 100.135 37.76 140.24S356 178 356 178s-100.135-2.346-140.24 37.76S178 356 178 356s2.346-100.135-37.76-140.24S0 178 0 178s100.135 2.346 140.24-37.76S178 0 178 0Z" fill="currentColor" /></svg>;
}

function MagneticLink({ children, className = "", href = "#form", label, onClick }: { children: ReactNode; className?: string; href?: string; label?: string; onClick?: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 15 });
  const springY = useSpring(y, { stiffness: 180, damping: 15 });
  const reduced = useReducedMotion();
  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse" || reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.23);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.23);
  }
  return <motion.a href={href} className={className} aria-label={label} onClick={onClick} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0); }} style={{ x: springX, y: springY }} whileTap={{ scale: 0.94 }}>{children}</motion.a>;
}

function Header() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  useEffect(() => {
    const handle = () => setVisible(window.scrollY > window.innerHeight * 0.82);
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, []);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open]);
  return (
    <>
      <header className={`site-header ${visible || open ? "is-visible" : ""}`} inert={!visible && !open}>
        <div className="header-bar"><a href="#main" className="header-logo" onClick={() => setOpen(false)}>Doctor <strong>Shanina</strong></a><nav className="header-desktop-nav" aria-label="Quick navigation"><a href="#about">About</a><a href="#online">Consultations</a><a href="#clients">Clients</a></nav><a href="#form" className="header-book" onClick={() => setOpen(false)}>Book a consultation <ArrowUpRight size={17} /></a><button className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="expanded-navigation" onClick={() => setOpen(!open)}>{open ? <X size={24} /> : <Menu size={24} />}</button></div>
        <AnimatePresence initial={false}>{open && <motion.nav id="expanded-navigation" className="expanded-nav" aria-label="Main navigation" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>{navigation.map((item, index) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}><span className="nav-index">0{index + 1}</span><span>{item.label}</span><ArrowUpRight strokeWidth={1} /></a>)}<div className="expanded-nav-note">Personalized care. Wherever you are.</div></motion.nav>}</AnimatePresence>
        <motion.div className="reading-progress" style={{ scaleX: progress }} />
      </header>
    </>
  );
}

function Hero() {
  const hero = useRef<HTMLElement>(null);
  const [cursorVisible, setCursorVisible] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(mouseX, { stiffness: 160, damping: 24, mass: 0.55 });
  const y = useSpring(mouseY, { stiffness: 160, damping: 24, mass: 0.55 });
  const reduced = useReducedMotion();
  function handlePointer(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || reduced || !hero.current) return;
    const rect = hero.current.getBoundingClientRect();
    const diameter = Math.min(230, Math.max(138, window.innerWidth * 0.1171875));
    mouseX.set(event.clientX - rect.left - diameter / 2);
    mouseY.set(event.clientY - rect.top - diameter / 2);
    const target = event.target as HTMLElement;
    setCursorVisible(!target.closest("nav, .hero-facts"));
  }
  return (
    <section className="hero" id="main" ref={hero} onPointerMove={handlePointer} onPointerLeave={() => setCursorVisible(false)} aria-label="Doctor Anna Shanina">
      <Picture desktop="hero-bg-d-scaled.webp" mobile="hero-bg-m.webp" alt="Warm sunlight falling across a woman’s face and neck" className="hero-background" eager />
      <a className="hero-background-link" href="#form" aria-label="Book a consultation with Doctor Shanina" tabIndex={-1} />
      <div className="hero-inner">
        <h1 className="hero-title" aria-label="Doctor Shanina"><span className="title-word">Doctor</span>{" "}<span className="title-word">Shanina</span></h1>
        <nav className="hero-nav" aria-label="Section navigation">{navigation.map(item => <div className={`hero-nav-item ${["#about", "#online", "#availability"].includes(item.href) ? "desktop-link" : ""}`} key={item.href}><a href={item.href} className="rolling-link"><span data-label={item.label}>{item.label}</span></a></div>)}</nav>
        <MagneticLink className="mobile-hero-book" label="Book a consultation"><span>Book the<br />consultation</span></MagneticLink>
        <div className="hero-copy"><h2>Expert care for your<br className="desktop-break" /> skin and beauty</h2><p>Personalized online skin care advice from an experienced cosmetic doctor with 20 years of experience</p></div>
        <div className="hero-facts"><div><span>Doctor expert.</span><strong>Anna Shanina</strong></div><div className="desktop-fact"><span>Experience</span><strong>20 years</strong></div><div><span>Individual</span><strong>Skincare roadmap</strong></div><a href="#form" className="desktop-fact"><span>Want a consultation?</span><strong>Tap a button <ArrowUpRight size={14} /></strong></a></div>
      </div>
      <motion.div className="hero-cursor" aria-hidden="true" style={{ x, y }} animate={{ scale: cursorVisible ? 1 : 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}><span>Book the<br />consultation</span></motion.div>
      <a href="#about" className="hero-scroll" aria-label="Discover my approach"><ArrowDown size={17} strokeWidth={1} /></a>
    </section>
  );
}

function About() {
  const [active, setActive] = useState(0);
  const section = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!section.current) return;
      const rect = section.current.getBoundingClientRect();
      if (rect.top <= 0 && rect.bottom > 0) setActive(-rect.top / Math.max(1, rect.height - window.innerHeight) > 0.5 ? 1 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const slides = [
    { title: "Holistic vision", heading: "I believe in a holistic approach to body health, realizing that beauty and well-being starts from the inside out.", text: "Every aspect of health is important and there are no one-size-fits-all solutions. In my consultations, I emphasize a holistic approach that encompasses all aspects of caring for your body and skin." },
    { title: "Beyond skin care", heading: "My specialization is focused on skin, but I also pay attention to other important aspects of health and appearance.", text: "Together, we will address not only facial and body skin concerns but also issues related to hair care, skincare routines, and proper nutrition." },
  ];
  return <div className="about-scene" id="about" ref={section}><section className="about-section"><Picture desktop="about-bg-d-scaled.webp" mobile="about-bg-m.webp" className="about-background" /><div className="about-indicators" role="tablist" aria-label="My approach">{slides.map((slide, index) => <button key={slide.title} className={active === index ? "active" : ""} role="tab" aria-selected={active === index} aria-controls="about-story" aria-label={slide.title} onClick={() => setActive(index)} onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); setActive(1 - active); } }}><span /></button>)}</div><div className="about-story" id="about-story" role="tabpanel"><AnimatePresence mode="wait" initial={false}><motion.div key={active} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45 }}><h3 className="eyebrow">{slides[active].title}</h3><div className="fine-line" /><h4>{slides[active].heading}</h4><p>{slides[active].text}</p></motion.div></AnimatePresence></div><div className="about-author"><h2 className="about-name" data-reveal><span>Anna</span><span>Shanina</span></h2><div className="about-portrait" data-parallax><img src={imagePath("about-img.webp")} alt="Dr. Anna Shanina, cosmetic doctor" loading="lazy" /><span className="portrait-caption">Your skin, understood.</span></div></div><div className="about-footer eyebrow"><span>A personal approach to your well-being</span><span>Science. Care. Balance.</span></div></section></div>;
}

function HolisticScene() {
  return <section className="holistic-scene" aria-label="A holistic view of health"><div className="holistic-sticky"><div className="holistic-marquee" aria-hidden="true">{[0, 1, 2].map(index => <div className="holistic-marquee-row" key={index}>Holistic view of health <Star /> Holistic view of health <Star /></div>)}</div><div className="holistic-image"><Picture desktop="service-img-d-1-scaled.webp" mobile="service-img-m-1.webp" alt="The natural beauty of healthy skin" /></div><span className="holistic-caption eyebrow">Beauty starts from within</span></div></section>;
}

function Services() {
  return <section className="services" id="health" aria-label="Areas of expertise">{services.map((service, index) => <article className="service-panel" key={service.image} style={{ zIndex: index + 1 }}><div className="service-image" data-parallax><Picture desktop={`service-img-d-${service.image}-scaled.webp`} mobile={`service-img-m-${service.image}.webp`} alt={service.label} /></div><div className="service-shade" /><div className="service-audience eyebrow"><span>I work with a diverse age audience</span><span>Gender: <strong>female / male</strong></span></div><div className="service-main"><div className="service-topline"><h2 className="eyebrow">{service.label}</h2><span className="eyebrow">( 0{index + 1} )</span></div><h3 data-reveal>{service.title}</h3></div><div className="service-bottom"><span className="service-year">20 years of expertise</span><div className="service-index"><span>0{index + 1}</span><span className="index-track"><i style={{ width: `${(index + 1) * 20}%` }} /></span><span>05</span></div><MagneticLink className="service-book" label={`Book a consultation for ${service.label.toLowerCase()}`}><span>Book the<br />consultation</span><ArrowUpRight size={23} strokeWidth={1.2} /></MagneticLink></div></article>)}</section>;
}

function Process() {
  return <section className="process-section" id="process"><div className="process-intro"><p data-reveal>Each consultation is built around a holistic approach, addressing not only skincare but overall well-being.</p><span className="eyebrow section-counter">( The process )</span><p data-reveal>From the first steps to follow-up support, every stage is designed to provide personalized and effective care.</p></div><div className="process-marquee" aria-label="Process of consultation"><div className="marquee-track" aria-hidden="true">{[0, 1, 2, 3].map(index => <span key={index}>Process of consultation <Star /></span>)}</div></div><div className="process-timeline"><div className="timeline-line"><div className="timeline-progress" /></div><div className="process-flower-wrap"><Star className="process-flower" /></div>{processSteps.map((step, index) => <article className={`process-step step-${index + 1}`} key={step.title} data-reveal><span className="step-number">( 0{index + 1} )</span><div className="step-copy"><h3>{step.title}</h3><p>{step.text}</p>{step.note && <div className="step-note"><span className="eyebrow">Duration</span><p>{step.note}</p></div>}{index === 0 && <a href="#form" className="text-link">Start here <ArrowUpRight size={17} /></a>}</div></article>)}</div><div className="process-end"><span className="eyebrow">A clear plan. Lasting confidence.</span><MagneticLink className="outline-book">Let’s talk about your skin <ArrowUpRight size={20} /></MagneticLink></div></section>;
}

function Consultations({ onSelect }: { onSelect: (id: string) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  return <section className="consultations" id="online"><div className="section-facts eyebrow"><span>Doctor expert<strong>Anna Shanina</strong></span><span>Experience<strong>20 years</strong></span><span>Counseling from<strong>$150</strong></span><a href="#form">Want a consultation?<strong>Tap a button <ArrowUpRight size={15} /></strong></a></div><h2 className="consultation-heading" data-word-reveal><span className="heading-line"><Words text="Treatment in your" /></span><span className="heading-line"><Words text="skin wellness" /></span><span className="heading-line"><Words text="available for you" /></span><span className="heading-line"><Words text="online now" /><span className="online-dot" /></span></h2><div className="consultation-list">{consultationTypes.map((type, index) => <article className={`consultation-item ${open === index ? "is-open" : ""}`} key={type.id}><button className="consultation-toggle" onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index} aria-controls={`consultation-${type.id}`}><span className="eyebrow consultation-number">( 0{index + 1} )</span><h3>{type.title}</h3><span className="plus-wrap"><Plus size={28} strokeWidth={1} /></span></button><AnimatePresence initial={false}>{open === index && <motion.div id={`consultation-${type.id}`} className="consultation-details" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} onAnimationComplete={refreshLayout}><div className="consultation-details-inner"><div className="consultation-overview"><p>{type.description}</p><div className="consultation-meta"><span>{type.duration}</span><span>{type.price}</span></div><a href="#form" onClick={() => onSelect(type.id)} className="text-link gold">Choose this consultation <ArrowUpRight size={19} /></a></div><div className="consultation-features">{type.details.map(detail => <div key={detail.title}><h4>{detail.title}</h4><p>{detail.text}</p></div>)}</div></div></motion.div>}</AnimatePresence></article>)}</div></section>;
}

function Specialties({ onSelect }: { onSelect: (id: string) => void }) {
  const topics = [
    { title: "Health & cosmetics", tags: ["Cosmetics selection", "Allergies", "Nutrition", "Cosmetology", "Body health"], text: "Beauty and wellness go hand in hand. Get expert recommendations on skincare, nutrition, and holistic self-care.", type: "general" },
    { title: "Hair care", tags: ["Hair restoration", "Scalp health", "Beauty and health"], text: "Strong, healthy hair starts with proper care. Discover solutions for restoration, nourishment, and long-term hair health.", type: "targeted" },
    { title: "Skin care", tags: ["Face & body", "Dry skin", "Sensitivity", "Anti-age", "Acne", "Rosacea"], text: "Healthy skin needs proper care. Whether it’s dryness, sensitivity, or acne, the right routine makes all the difference.", type: "general" },
  ];
  return <section className="specialties" aria-label="Care for every part of you">{topics.map((topic, index) => <article className={`specialty-card specialty-${index + 1}`} key={topic.title}><div className="specialty-top eyebrow"><span>A holistic approach</span><span>( 0{index + 1} / 03 )</span></div><h2 data-reveal>{topic.title}</h2><div className="specialty-bottom"><div className="specialty-tags">{topic.tags.map(tag => <a href="#form" key={tag} onClick={() => onSelect(topic.type)}>{tag}<ArrowUpRight size={12} /></a>)}</div><p>{topic.text}</p><MagneticLink onClick={() => onSelect(topic.type)} className="specialty-arrow" label={`Ask about ${topic.title.toLowerCase()}`}><ArrowUpRight strokeWidth={1} /></MagneticLink></div></article>)}</section>;
}

function Clients({ onVideo }: { onVideo: (index: number) => void }) {
  const [active, setActive] = useState(0);
  const current = testimonials[active];
  const go = (direction: number) => setActive((active + direction + testimonials.length) % testimonials.length);
  return <section className="clients" id="clients"><div className="clients-cover"><Picture desktop="review-bg-d.webp" mobile="review-bg-m.webp" alt="Natural skin, cared for with confidence" className="clients-background" /><h2 className="clients-heading" data-word-reveal><span><Words text="Find out how" /></span><span><Words text="I’ve benefited" /></span><span><Words text="my clients" /></span></h2><span className="clients-cover-label eyebrow">Real people. Personal stories.</span></div><div className="client-stories"><div className="client-selector"><span className="eyebrow client-selector-label">Their words, not mine</span><div className="client-name-list" role="tablist" aria-label="Client stories">{testimonials.map((review, index) => <button id={`review-tab-${index}`} role="tab" aria-selected={active === index} aria-controls="client-story" className={active === index ? "active" : ""} key={review.name} onClick={() => setActive(index)} onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowRight") { event.preventDefault(); go(1); } if (event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); go(-1); } }}><span>{review.name}</span><small>{review.concern}</small><ArrowUpRight size={16} /></button>)}</div></div><div className="client-photo-column"><AnimatePresence mode="wait" initial={false}><motion.div key={current.name} className="client-photo" initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}><img src={imagePath(current.image)} alt={current.name} loading="lazy" />{current.video && <button className="play-story" onClick={() => onVideo(active)} aria-label={`Watch ${current.name}’s story`}><Play size={19} fill="currentColor" /><span>Watch story</span></button>}</motion.div></AnimatePresence><div className="story-controls"><span className="eyebrow">{String(active + 1).padStart(2, "0")} <i>/ {testimonials.length}</i></span><div><button onClick={() => go(-1)} aria-label="Previous client story"><ArrowLeft size={20} strokeWidth={1.4} /></button><button onClick={() => go(1)} aria-label="Next client story"><ArrowRight size={20} strokeWidth={1.4} /></button></div></div></div><div className="client-quote-wrap" id="client-story" role="tabpanel" aria-labelledby={`review-tab-${active}`} aria-live="polite"><AnimatePresence mode="wait" initial={false}><motion.blockquote key={current.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}><span className="quote-symbol">“</span><h3>{current.quote}</h3><p>{current.text}</p><footer><strong>{current.name}</strong><span>{current.concern}</span></footer></motion.blockquote></AnimatePresence></div></div><p className="results-note">Individual experiences shared by clients. Results vary from person to person.</p></section>;
}

function Availability() {
  const features = [
    { title: "Local factors", text: "Your local climate, environment, and lifestyle are part of the picture. Your care should be, too." },
    { title: "Product access", text: "Recommendations for products and procedures that are actually available in your country." },
    { title: "Flexible timing", text: "A schedule that accommodates different time zones, making it easy to find a suitable time." },
    { title: "Routine adaptation", text: "Guidance for adjusting your skincare when your climate, time zone, or circumstances change." },
  ];
  return <section className="availability" id="availability"><div className="availability-top eyebrow"><span>Care without borders</span><Globe2 size={20} strokeWidth={1} /><span>Online. Worldwide.</span></div><h2 className="availability-heading" data-word-reveal><Words text="Personalized counseling in your native language, no matter where you are in the world. Ensuring clarity and comfort in every conversation." /></h2><div className="availability-features">{features.map((feature, index) => <article key={feature.title} data-reveal><span className="eyebrow">( 0{index + 1} )</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div><div className="map-panel"><img className="map-image" src={imagePath("map.webp")} alt="World map representing international online consultations" loading="lazy" /><span className="map-point point-europe"><i /><span>Europe</span></span><span className="map-point point-america"><i /><span>North America</span></span><span className="map-point point-asia"><i /><span>Asia</span></span><span className="map-point point-australia"><i /><span>Australia</span></span><div className="map-caption"><span className="availability-status"><i />Available for online consultations</span></div></div><div className="global-copy"><h3 data-reveal>A global approach to beauty,<br />customized to your location<br />and lifestyle.</h3><div><p>Clients from all over the world seek my expertise. I am well-versed in product markets across continents, including Japan, Korea, Europe, and the USA. I understand that available procedures vary by region, adapting to different skincare needs.</p><a href="#form" className="text-link">Find your personal approach <ArrowUpRight size={19} /></a></div></div></section>;
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return <section className="faq-section" id="faq"><div className="faq-heading"><h2 data-reveal>Good to know</h2><span className="eyebrow">Questions & answers</span></div><div className="faq-list">{faqs.map((faq, index) => <article className={`faq-item ${open === index ? "is-open" : ""}`} key={faq.question}><button aria-expanded={open === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpen(open === index ? null : index)}><span className="faq-number eyebrow">( 0{index + 1} )</span><h3>{faq.question}</h3><span className="faq-plus"><Plus size={25} strokeWidth={1.2} /></span></button><AnimatePresence initial={false}>{open === index && <motion.div className="faq-answer" id={`faq-answer-${index}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} onAnimationComplete={refreshLayout}><p>{faq.answer}</p></motion.div>}</AnimatePresence></article>)}</div><div className="faq-bottom"><span>Still have something on your mind?</span><a className="text-link" href="#form">Let’s talk <ArrowUpRight size={18} /></a></div></section>;
}

function Modal({ children, onClose, label, video = false }: { children: ReactNode; onClose: () => void; label: string; video?: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("scroll:lock", { detail: true }));
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const elements = panel.current?.querySelectorAll<HTMLElement>('button, a[href], input, [tabindex="0"]');
        if (!elements?.length) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = previousOverflow; window.dispatchEvent(new CustomEvent("scroll:lock", { detail: false })); document.removeEventListener("keydown", keydown); previousFocus?.focus({ preventScroll: true }); };
  }, [onClose]);
  return <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.div ref={panel} role="dialog" aria-modal="true" aria-label={label} className={`modal-panel ${video ? "video-modal" : ""}`} data-lenis-prevent onClick={event => event.stopPropagation()} initial={{ y: 30, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.97 }} transition={{ duration: 0.3 }}><button className="modal-close" aria-label="Close dialog" onClick={onClose}><X size={23} strokeWidth={1.5} /></button>{children}</motion.div></motion.div>;
}

export function ShaninaSite() {
  const [selectedType, setSelectedType] = useState("general");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [videoIndex, setVideoIndex] = useState<number | null>(null);
  const closePrivacy = useCallback(() => setPrivacyOpen(false), []);
  const closeVideo = useCallback(() => setVideoIndex(null), []);
  return <ShaninaShell><MotionSystem><Header /><main><Hero /><About /><HolisticScene /><Services /><Process /><Consultations onSelect={setSelectedType} /><Specialties onSelect={setSelectedType} /><Clients onVideo={setVideoIndex} /><Availability /><FAQ /><section className="booking-section" id="form"><div className="booking-intro"><div className="booking-image" data-parallax><img src={imagePath("form-img.webp")} alt="Anna Shanina welcomes you to a personalized skincare consultation" loading="lazy" /><div className="booking-image-caption"><span className="eyebrow">Doctor expert</span><span>Anna Shanina</span><Star /></div></div><div className="booking-title-wrap"><span className="eyebrow">Start the journey to your healthiest skin</span><h2 data-reveal>Good skin starts<br />with a conversation.</h2><p>Sign up for a consultation and receive professional, personalized skincare care wherever you are.</p><span className="booking-availability"><span />Online consultations available</span></div></div><div className="booking-content"><div className="booking-side-note"><span className="eyebrow">Book a consultation</span><p>A little about your skin.<br />A lot of care from me.</p><ArrowDown size={32} strokeWidth={1} /><span className="booking-detail">Your location, your budget, your goals.<br />Every detail matters.</span></div><BookingForm selectedType={selectedType} onTypeChange={setSelectedType} onPrivacy={() => setPrivacyOpen(true)} /></div></section></main><footer className="site-footer"><div className="footer-top"><a href="#main" className="eyebrow">Back to the beginning <ArrowUpRight size={17} /></a><span>Expert care for your skin and beauty.</span><a href="#form" className="eyebrow">Let’s begin <ArrowUpRight size={17} /></a></div><a href="#main" className="footer-wordmark" aria-label="Doctor Shanina, back to top">Doctor Shanina</a><div className="footer-bottom"><span>© {new Date().getFullYear()} Doctor Shanina</span><span>Made with care. Inspired by nature.</span><button type="button" onClick={() => setPrivacyOpen(true)}>Privacy notice <ArrowUpRight size={13} /></button></div></footer><AnimatePresence>{privacyOpen && <Modal label="Privacy notice" onClose={closePrivacy}><span className="eyebrow">Your information, handled with care</span><h2>Privacy notice</h2><p>This website is a demonstration of the Doctor Shanina experience. It is not connected to the original medical practice.</p><h3>What is stored</h3><p>When you submit the form, your name, email, optional phone number, location, consultation preference, and message are saved in this application’s database solely as a consultation request.</p><h3>Your choices</h3><p>Only your name, email, consultation preference, and consent are required. Please do not include medical records, test results, or sensitive health information. You can choose not to submit the form.</p><h3>No automatic appointments or charges</h3><p>Submitting a request does not schedule an appointment, send an email, or process a payment. Your data is not sent to Dr. Shanina or to the original website.</p><button className="outline-book" onClick={closePrivacy}>Understood <Check size={17} /></button></Modal>}{videoIndex !== null && testimonials[videoIndex].video && <Modal label={`${testimonials[videoIndex].name}’s story`} onClose={closeVideo} video><iframe src={`${testimonials[videoIndex].video}&autoplay=1&dnt=1`} title={`${testimonials[videoIndex].name}’s skincare story`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /><div className="video-caption"><span>{testimonials[videoIndex].name} — {testimonials[videoIndex].concern}</span><a href={testimonials[videoIndex].video} target="_blank" rel="noopener noreferrer">Open video <ArrowUpRight size={15} /></a></div></Modal>}</AnimatePresence></MotionSystem></ShaninaShell>;
}
