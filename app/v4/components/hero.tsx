"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { reviews } from "../lib/clinic-data";
import { ease, Magnetic, Star } from "./ui";

const gallery = [
  { image: "/images/doctors/2.jpeg", alt: "فضای آرام و روشن کلینیک دکتر شبنم فضلی" },
  { image: "/images/doctors/3.jpg", alt: "اتاق مشاورهٔ کلینیک" },
  { image: "/images/doctors/4.jpeg", alt: "فضای انتظار کلینیک" },
];

export function AmbientBackground() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) ref.current?.pause();
    else ref.current?.play().catch(() => {});
  }, [reduced]);
  return <div className="ambient-background" aria-hidden="true"><video ref={ref} autoPlay muted loop playsInline preload="auto" poster="/images/personels1.jpg"><source src="/videos/fv.mp4" type="video/mp4" /></video><div className="ambient-wash" /></div>;
}

export function Hero() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [review, setReview] = useState(0);
  const [reviewPaused, setReviewPaused] = useState(false);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 65]);
  useEffect(() => {
    if (reduced || paused) return;
    const timer = setInterval(() => setSlide((s) => (s + 1) % gallery.length), 6200);
    return () => clearInterval(timer);
  }, [paused, reduced]);
  useEffect(() => {
    if (reduced || reviewPaused) return;
    const timer = setInterval(() => setReview((s) => (s + 1) % reviews.length), 7800);
    return () => clearInterval(timer);
  }, [reduced, reviewPaused]);

  return <section className="hero" ref={ref} aria-label="کلینیک دکتر شبنم فضلی">
    <div className="hero-stage">
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.3, ease }} className="hero-star hero-star-one"><Star /></motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.8 }} className="hero-star hero-star-two"><Star /></motion.div>
      <motion.div className="hero-gallery-wrap" style={{ y: reduced ? 0 : y }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease }}>
        <div className="hero-oval" aria-roledescription="اسلایدر" aria-label="تصاویر کلینیک">
          <div className="oval-picture"><AnimatePresence initial={false}>{gallery.map((item, index) => slide === index && <motion.img key={item.image} src={item.image} alt={item.alt} className="hero-image" initial={{ opacity: 0, scale: reduced ? 1 : 1.06, x: reduced ? 0 : 8 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: reduced ? 0 : 1.6 }, scale: { duration: 7, ease: "linear" }, x: { duration: 7, ease: "linear" } }} fetchPriority={index === 0 ? "high" : "auto"} />)}</AnimatePresence><span className="image-soft-light" /></div>
          <div className="gallery-arrows"><button onClick={() => { setSlide((slide + gallery.length - 1) % gallery.length); setPaused(true); }} aria-label="تصویر قبلی"><ChevronRight size={18} strokeWidth={1.3} /></button><button onClick={() => { setSlide((slide + 1) % gallery.length); setPaused(true); }} aria-label="تصویر بعدی"><ChevronLeft size={18} strokeWidth={1.3} /></button></div>
          <Magnetic className="scroll-orbit-position"><a href="#about" className="scroll-orbit" aria-label="دربارهٔ کلینیک"><span className="orbit-ring" aria-hidden="true" /><span><ArrowDown size={22} strokeWidth={1} /></span></a></Magnetic>          <div className="gallery-controls">{gallery.map((item, index) => <button key={item.image} aria-label={`تصویر ${index + 1}`} aria-pressed={slide === index} className={`gallery-dot ${slide === index ? "active" : ""}`} onClick={() => { setSlide(index); setPaused(true); }} />)}<button className="gallery-pause" onClick={() => setPaused(!paused)} aria-label={paused ? "پخش اسلایدشو" : "توقف اسلایدشو"}>{paused ? <Play size={10} fill="currentColor" /> : <Pause size={10} />}</button></div>
        </div>
      </motion.div>
      <div className="hero-copy">
        <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.25, ease }}><span className="hero-wordmark">بیدار کردنِ<br />زیباییِ شما</span></motion.h1>
        <motion.p className="hero-description" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.45, ease }}>کلینیک جراحی پلاستیک و زیبایی دکتر شبنم فضلی در اصفهان؛<br className="desktop-break" />با دقتِ تخصصی و وسواسِ ظرافت، زیباییِ متناسب با چهرهٔ شما را به تصویر می‌کشیم.</motion.p>
        <motion.div className="review-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.7, ease }} onMouseEnter={() => setReviewPaused(true)} onMouseLeave={() => setReviewPaused(false)} onFocusCapture={() => setReviewPaused(true)} onBlurCapture={() => setReviewPaused(false)}>
          <img src="/v4/images/review-avatar.svg" width={34} height={34} alt="" />
          <div className="review-content"><AnimatePresence mode="wait" initial={false}><motion.p key={review} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.4 }}>{reviews[review]}</motion.p></AnimatePresence><div className="review-dots">{reviews.map((_, index) => <button aria-label={`نظر مراجع ${index + 1}`} aria-pressed={review === index} key={index} className={review === index ? "active" : ""} onClick={() => setReview(index)} />)}</div></div>
        </motion.div>
      </div>
      <motion.div className="hero-signature" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.65, ease }}><Star className="pegasus-mark" /><p className="serif">Evoke your true beauty!<br />زیباییِ واقعی‌ات را بیدار کن.<br />ما کلینیکِ لبخند تو هستیم.</p></motion.div>
    </div>
    <div className="hero-rule inner"><img src="/v4/images/shine.svg" alt="" width={49} height={32} /><motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5, delay: 0.5, ease }} /></div>
  </section>;
}
