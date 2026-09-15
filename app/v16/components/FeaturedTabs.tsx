"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft } from "lucide-react";
import type { MayaFeaturedTab, MayaProduct } from "../lib/data";
import { gsapSetup } from "../lib/fx";
import { useStore } from "./Store";
import { SplitText } from "./Motion";

type Tab = MayaFeaturedTab & { products: MayaProduct[] };
const DURATION = 7000;

/* The engine swaps the whole section's colour scheme on every tab change
   (`section.classList.replace(oldScheme, newScheme)`, keyed off each tab's
   `data-color-scheme`). These are the three schemes the reference's tabs
   carry, transcribed from its `.scheme-*` rules:
     ac1ed1d3 → body #ffffff + a crimson radial, ink #ffffff, button #000/#fff
     f2e74476 → body #000000 + an olive radial,  ink #dddddd, button #fff/#000
     6d9411dd → body #242427 + an orange radial, ink #eceaea, button #fff/#000 */
const SCHEMES = [
  {
    bg: "#ffffff",
    grad: "radial-gradient(rgb(142 9 67), rgb(2 2 1) 65%)",
    ink: "#ffffff",
    btnBg: "#000000",
    btnInk: "#ffffff",
  },
  {
    bg: "#000000",
    grad: "radial-gradient(rgb(37 45 0), rgb(0 0 0) 73%)",
    ink: "#dddddd",
    btnBg: "#ffffff",
    btnInk: "#000000",
  },
  {
    bg: "#242427",
    grad: "radial-gradient(rgb(228 100 21), rgb(2 2 1) 65%)",
    ink: "#eceaea",
    btnBg: "#ffffff",
    btnInk: "#000000",
  },
] as const;

/* ==================================================================
   Port of the theme's `featuredCollectionsList()` engine method
   (section `featured_collections_tabs`, methodCalled="featuredCollectionsList").

   The reference lays the section out as four stacked layers inside one
   pinned stage:

     .featured-collections-list-front      the section head, absolutely
                                           centred; fades out (`fade-out-text`)
                                           once the pin starts
     .featured-collections-list-tabs       the chip deck — `position: fixed`,
                                           centred at
                                           `calc(50% - var(--list-tabs-height)/2.4)`,
                                           each chip 106x86; the ACTIVE chip
                                           expands to 475x86 and reveals its
                                           label (`.list-tab-text`, nowrap)
     .featured-collections-text-wrapper    the text column: the active
                                           collection's h2 + description,
                                           all three stacked in one grid cell
     .featured-collections-list-tabscontent the media column: a 2-column grid
                                           holding a full-bleed `list-mainmedia`
                                           plus three tiles — two squares
                                           (`--image-ratio:100%`) and one
                                           full-width (`--image-ratio:60%`) —
                                           with the caption pill between them

   Across the pin the engine plays, in order:
     [0] the main media in from xPercent -100 / scale .7
     [1] the description rail 0 -> 100% width
     [2] a thin rule scaleX 0 -> 1
     [3] the rule scaleX 1 -> 0
   and `onUpdate` shrinks every `list-mainmedia` to scale 0 while scaling
   every `multi-media-img` to 1, i.e. the single hero image resolves into
   the 4-image mosaic.
   ================================================================== */
export function FeaturedTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [typed, setTyped] = useState("");
  const touch = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const { setQuickView } = useStore();

  const select = useCallback((i: number) => {
    setActive(i);
    touch.current = Date.now(); // reset autoplay clock
  }, []);

  /* autoplay — the clock resets whenever the timer (re)starts, and each
     auto-advance restarts it too, so tabs change exactly every DURATION */
  useEffect(() => {
    if (paused) return;
    touch.current = Date.now(); // start a fresh countdown on mount/resume
    const t = window.setInterval(() => {
      if (Date.now() - touch.current >= DURATION - 200) {
        touch.current = Date.now();
        setActive((a) => (a + 1) % tabs.length);
      }
    }, 400);
    return () => window.clearInterval(t);
  }, [paused, tabs.length]);

  /* typewriter */
  useEffect(() => {
    const full = tabs[active].typed;
    setTyped(""); // eslint-disable-line react-hooks/set-state-in-effect -- restart typewriter when the active tab changes
    let i = 0;
    const t = window.setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(t);
    }, 65);
    return () => window.clearInterval(t);
  }, [active, tabs]);

  useLayoutEffect(() => {
    const { gsap, ScrollTrigger } = gsapSetup();
    const stage = stageRef.current;
    if (!stage) return;

    const ctx = gsap.context(() => {
      const mains = stage.querySelectorAll<HTMLElement>("[data-ft-main]");
      const tiles = stage.querySelectorAll<HTMLElement>("[data-ft-tile]");
      const fill = stage.querySelector<HTMLElement>("[data-ft-fill]");
      const desc = stage.querySelector<HTMLElement>("[data-ft-desc-inner]");
      const front = stage.querySelector<HTMLElement>("[data-ft-front]");
      const section = stage.closest("section");

      const chars = () => stage.querySelectorAll<HTMLElement>(".maya-ft-char");
      const revealChars = () => {
        const c = chars();
        if (c.length)
          gsap.from(c, { duration: 0.8, opacity: 0, stagger: 0.02, rotationX: 90, ease: "expo.out" });
      };

      /* re-run the char reveal whenever the user switches tabs (both breakpoints) */
      const onClick = () => {
        const c = chars();
        if (c.length)
          gsap.fromTo(
            c,
            { opacity: 0, rotationX: 90 },
            { duration: 0.8, opacity: 1, rotationX: 0, stagger: 0.02, ease: "expo.out" },
          );
      };
      stage.querySelectorAll("[data-ft-tab]").forEach((b) => b.addEventListener("click", onClick));

      const mm = gsap.matchMedia();

      /* ---- ≥768px: the pinned four-layer stage --------------------------
         The engine's opening state — the hero sits off-axis and scaled down,
         the description rail is collapsed, the mosaic tiles are scaled out,
         and the rule is unswept. */
      mm.add("(min-width: 768px)", () => {
        gsap.set(mains, { xPercent: -100, scale: 0.7 });
        if (tiles.length) gsap.set(tiles, { scale: 0 });
        if (fill) gsap.set(fill, { scaleX: 0 });
        if (desc) gsap.set(desc, { width: "0%" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
            onEnter: () => section?.classList.add("maya-ft-pinned"),
            onLeaveBack: () => section?.classList.remove("maya-ft-pinned"),
          },
        });

        /* [0] the main media in */
        tl.to(mains, {
          xPercent: 0,
          scale: 1,
          ease: "none",
          onStart: () => {
            section?.classList.add("maya-ft-pinned");
            revealChars();
          },
          onReverseComplete: () => section?.classList.remove("maya-ft-pinned"),
        });
        /* [1] the description rail grows to full width */
        if (desc) tl.to(desc, { width: "100%", ease: "none" }, "<");
        /* [2] + [3] the rule sweeps out and back */
        if (fill) tl.to(fill, { scaleX: 1, ease: "none" }, "<").to(fill, { scaleX: 0, ease: "none" });

        /* the engine's onUpdate, phase 4: the hero resolves into the mosaic */
        ScrollTrigger.create({
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress > 0.72) {
              gsap.to(mains, { scale: 0, duration: 0.18, ease: "sine.inOut", overwrite: "auto" });
              gsap.to(tiles, { scale: 1, duration: 0.22, ease: "sine.inOut", overwrite: "auto" });
              if (front) front.classList.add("is-faded");
            } else {
              gsap.to(mains, { scale: 1, duration: 0.18, ease: "sine.inOut", overwrite: "auto" });
              gsap.to(tiles, { scale: 0, duration: 0.22, ease: "sine.inOut", overwrite: "auto" });
              if (front) front.classList.remove("is-faded");
            }
          },
        });
      });

      /* ---- <768px: the reference drops the pin entirely -----------------
         `featured-collections-tabs.css` scopes BOTH the chip deck's
         `position:fixed` and the head's / hero's `position:absolute` inside
         `@media(min-width:768px)`. Below 768 the wrapper is a plain
         three-row grid ("collection-heading" / "collection-tab" /
         "collection-tabcontent") and every layer is in flow: the head stays
         visible, the hero keeps its 300px height instead of being scaled
         away, and the mosaic tiles are all shown stacked beneath it.
         So there is nothing to scrub — pin nothing, scale nothing. */
      mm.add("(max-width: 767px)", () => {
        gsap.set(mains, { clearProps: "transform" });
        gsap.set(tiles, { clearProps: "transform" });
        if (fill) gsap.set(fill, { clearProps: "transform" });
        /* the engine only grows the description rail 0 -> 100% on the pinned
           path; on the reference's mobile layout the pill just hugs its text
           (measured 305 / 319 / 293px), so drop the width entirely. */
        if (desc) gsap.set(desc, { clearProps: "width" });
        front?.classList.remove("is-faded");
        section?.classList.remove("maya-ft-pinned");
        return () => {
          front?.classList.remove("is-faded");
          section?.classList.remove("maya-ft-pinned");
        };
      });

      ScrollTrigger.refresh();
      return () => {
        mm.revert();
        stage.querySelectorAll("[data-ft-tab]").forEach((b) => b.removeEventListener("click", onClick));
      };
    }, stageRef);

    return () => ctx.revert();
  }, [tabs.length]);

  const tab = tabs[active];
  const scheme = SCHEMES[active % SCHEMES.length];

  return (
    <section
      className="maya-ft-section"
      aria-label="کالکشن‌های منتخب"
      style={
        {
          "--ft-bg": scheme.bg,
          "--ft-grad": scheme.grad,
          "--ft-ink": scheme.ink,
          "--ft-btn-bg": scheme.btnBg,
          "--ft-btn-ink": scheme.btnInk,
        } as CSSProperties
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={stageRef} className="maya-ft-stage">
        <div className="maya-ft-panel">
          {/* ---- the section head, which fades out as the pin starts ---- */}
          <div data-ft-front className="maya-ft-front">
            <h3 className="maya-ft-front-title">استایلی که تا کمال خلق شده</h3>
            <p className="maya-ft-front-desc">
              مدی که با هر حال‌وهوایی جور می‌شود! از ضروری‌های روزمره تا ترندهای شاخص؛ برای هر موقعیت، یک
              استایل کامل.
            </p>
          </div>

          {/* ---- the chip deck ---- */}
          <div className="maya-ft-tabs" role="tablist" aria-label="کالکشن‌ها">
            {tabs.map((t, i) => {
              const isActive = i === active;
              return (
                <button
                  key={t.id}
                  data-ft-tab
                  role="tab"
                  aria-selected={isActive}
                  aria-label={t.chip}
                  onClick={() => select(i)}
                  className="maya-ft-chip"
                  data-active={isActive}
                >
                  <span className="maya-ft-chip-icon" aria-hidden="true">
                    <img src={t.image} alt="" loading="eager" />
                  </span>
                  <span className="maya-ft-chip-label">{t.chip}</span>
                </button>
              );
            })}
          </div>

          {/* ---- the two columns: text + media mosaic ---- */}
          <div className="maya-ft-body maya-wrap">
            <div className="maya-ft-textcol">
              {tabs.map((t, i) => (
                <div key={t.id} className="maya-ft-text" data-active={i === active} aria-hidden={i !== active}>
                  <h2 className="maya-ft-heading">
                    {i === active ? (
                      <SplitText text={t.heading} by="chars" itemClassName="maya-ft-char" />
                    ) : (
                      t.heading
                    )}
                  </h2>
                  <div className="maya-ft-paras">
                    {t.paragraphs.map((p) => (
                      <p key={p.slice(0, 16)}>{p}</p>
                    ))}
                  </div>
                </div>
              ))}

              {/* typewriter line + the rule the engine sweeps 0 -> 1 -> 0 */}
              <div className="maya-ft-typed">
                <span>
                  {typed}
                  <i className="maya-caret" />
                </span>
              </div>
              <div className="maya-ft-rule">
                <div data-ft-fill className="maya-ft-fill" />
              </div>
              <div className="maya-ft-descwrap">
                <div data-ft-desc-inner className="maya-ft-desc-inner">
                  {tab.typed}
                </div>
              </div>
            </div>

            <div className="maya-ft-mediacol">
              {tabs.map((t, i) => (
                <div
                  key={t.id}
                  className="maya-ft-media"
                  data-active={i === active}
                  aria-hidden={i !== active}
                >
                  {/* the full-bleed hero the mosaic resolves out of */}
                  <img
                    data-ft-main
                    src={t.image}
                    alt={t.heading}
                    loading="eager"
                    className="maya-ft-main"
                  />
                  {/* two squares, then the caption pill, then one wide tile */}
                  {t.mosaic.slice(0, 2).map((m) => (
                    <div key={m.src} className="maya-ft-tile" data-ft-tile>
                      <img src={m.src} alt="" loading="eager" />
                    </div>
                  ))}
                  <div className="maya-ft-cap">
                    <span className="maya-ft-cap-inner">
                      <span className="maya-ft-cap-text">{t.caption}</span>
                      <span className="maya-ft-cap-icon" aria-hidden="true">
                        <ArrowLeft className="size-3" />
                      </span>
                    </span>
                  </div>
                  {t.mosaic.slice(2).map((m) => (
                    <div key={m.src} className="maya-ft-tile maya-ft-tile-wide" data-ft-tile>
                      <img src={m.src} alt="" loading="eager" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ---- product thumbs for the active collection ---- */}
          <div className="maya-ft-thumbs maya-wrap">
            {tab.products.map((p) => (
              <button
                key={`${tab.id}-${p.id}`}
                onClick={() => setQuickView(p)}
                className="maya-ft-thumb"
                aria-label={`مشاهده ${p.title}`}
              >
                <img src={p.image} alt={p.title} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
