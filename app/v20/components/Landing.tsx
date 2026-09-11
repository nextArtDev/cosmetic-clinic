"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../lib/anim";
import type { IranfitContent } from "../data/types";
import Nav from "./Nav";
import Hero from "./Hero";
import Marquee from "./Marquee";
import Plans from "./Plans";
import Book from "./Book";
import Pricing from "./Pricing";
import AppSection from "./AppSection";
import Testimonials from "./Testimonials";
import Coach from "./Coach";
import News from "./News";
import CtaBand from "./CtaBand";
import Footer from "./Footer";
import ProgressRail from "./ProgressRail";
import BackToTop from "./BackToTop";
import VideoModal from "./VideoModal";

const DEMO_VIDEO = {
  src: "https://videos.pexels.com/video-files/6389576/6389576-uhd_3840_2160_25fps.mp4",
  poster:
    "https://images.pexels.com/videos/6389576/pexels-photo-6389576.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
};

export default function Landing({ content }: { content: IranfitContent }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  const openVideo = useCallback(() => setVideoOpen(true), []);
  const closeVideo = useCallback(() => setVideoOpen(false), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      /* ---- generic reveals ---- */
      gsap.utils.toArray<HTMLElement>("[data-if-reveal]").forEach((el) => {
        const delay = Number(el.dataset.ifDelay ?? 0);
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1.05,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      /* ---- giant ghost numbers: slow parallax drift ---- */
      gsap.utils.toArray<HTMLElement>(".if-ghost").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 22 },
          {
            yPercent: -22,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 1.2 },
          }
        );
      });

      /* ---- hero intro timeline ---- */
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(
        ".if-hero h1 .if-line > span",
        { yPercent: 115 },
        { yPercent: 0, duration: 1.25, stagger: 0.14 },
        0.15
      )
        .fromTo(".if-hero .if-kicker", { opacity: 0, x: 26 }, { opacity: 1, x: 0, duration: 0.9 }, 0.35)
        .fromTo(".if-hero-sub", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9 }, 0.65)
        .fromTo(".if-hero-actions > *", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.8)
        .fromTo(".if-hero-stat", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 }, 1.0)
        .fromTo(".if-hero-bg img", { scale: 1.18 }, { scale: 1.02, duration: 2.4, ease: "power2.out" }, 0);

      /* ---- number counters ---- */
      gsap.utils.toArray<HTMLElement>("[data-if-count]").forEach((el) => {
        const target = Number(el.dataset.ifCount ?? "0");
        const decimals = Number(el.dataset.ifDecimals ?? "0");
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = obj.v
              .toFixed(decimals)
              .replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
          },
        });
      });

      /* ---- coach / book image parallax ---- */
      gsap.utils.toArray<HTMLElement>("[data-if-parallax]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 46 },
          {
            y: -46,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
          }
        );
      });
    }, root);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={rootRef} dir="rtl" className="iranfit-root">
      <a
        href="#if-main"
        style={{ position: "absolute", insetInlineStart: "-9999px" }}
      >
        پرش به محتوا
      </a>

      <Nav />
      <ProgressRail />

      <main id="if-main">
        <Hero onPlay={openVideo} />
        <Marquee />
        <Plans months={content.months} />
        <Book />
        <Pricing plans={content.plans} />
        <AppSection />
        <Testimonials items={content.testimonials} />
        <Coach />
        <News posts={content.posts} />
        <CtaBand />
      </main>

      <Footer />
      <BackToTop />
      <VideoModal open={videoOpen} onClose={closeVideo} src={DEMO_VIDEO.src} poster={DEMO_VIDEO.poster} />
      <div className="if-grain" aria-hidden />
    </div>
  );
}
