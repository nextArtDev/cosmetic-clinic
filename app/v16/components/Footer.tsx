"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  ArrowLeft,
  Check,
  Loader2,
  Heart,
  Camera,
  Send,
  AtSign,
  Aperture,
  ChevronDown,
} from "lucide-react";
import { cn, fa, gsapSetup, scrollToTarget, EASE_EXPO } from "../lib/fx";
import { useStore } from "./Store";
import { MayaMarquee } from "./bits";

const QUICK_LINKS = ["خانه", "جستجو", "کالکشن‌ها", "درباره ما", "اخبار و مقالات"];
const SUPPORT_LINKS = ["حریم خصوصی", "بازگشت وجه", "سیاست ارسال", "تماس با ما", "سوالات متداول", "پیگیری سفارش"];

/* ------------------------------ newsletter ------------------------------ */

function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState("error");
      setMsg("لطفاً یک ایمیل معتبر وارد کن");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/v16/api/maya/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok: boolean; already?: boolean };
      if (!res.ok || !data.ok) throw new Error();
      setState("done");
      setMsg(data.already ? "قبلاً عضو خبرنامه بودی!" : "عضویتت ثبت شد؛ به‌زودی خبرهای خوب می‌آید");
    } catch {
      setState("error");
      setMsg("خطایی پیش آمد؛ دوباره تلاش کن");
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className="flex items-center gap-2 rounded-full border border-maya-creamline p-1.5 pl-2 transition-colors focus-within:border-maya-cream">
        <input
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          placeholder="email@example.com"
          aria-label="ایمیل برای عضویت در خبرنامه"
          className="w-full bg-transparent px-4 text-left text-sm font-semibold text-maya-cream outline-none placeholder:text-maya-cream/40"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="maya-btn maya-btn-cream flex-none px-5! py-2.5! text-xs! disabled:pointer-events-auto"
        >
          {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : "عضویت"}
        </button>
      </div>
      <AnimatePresence>
        {state !== "idle" && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "mt-3 flex items-center gap-2 text-xs font-bold",
              state === "done" ? "text-emerald-300" : "text-red-300",
            )}
          >
            {state === "done" && <Check className="size-3.5" />}
            {msg}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

/* ------------------------------ back to top ------------------------------ */

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 24, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.8 }}
          transition={{ duration: 0.35, ease: EASE_EXPO }}
          onClick={() => scrollToTarget(0)}
          aria-label="بازگشت به بالا"
          className="fixed bottom-24 left-4 z-[70] grid size-12 place-items-center rounded-full bg-maya-ink text-maya-cream shadow-xl transition-colors hover:bg-maya-clay lg:bottom-8 lg:left-8"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------- footer -------------------------------- */

/* Footer link column. The theme uses
   `<details is="accordion-details" data-footer-accordions>` whose
   handleResize() opens it on desktop and closes it on mobile; the
   desktop-open state is enforced in CSS so there is no post-mount flash. */
function FooterColumn({
  head,
  links,
  onLink,
}: {
  head: string;
  links: string[];
  onLink: (label: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const sync = () => {
      if (window.innerWidth <= 768) setCollapsed(true);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between gap-4 text-right md:pointer-events-none"
      >
        <span className="text-xs font-black text-maya-sand">{head}</span>
        <ChevronDown
          className={cn(
            "size-4 flex-none text-maya-cream/60 transition-transform duration-300 md:hidden",
            !collapsed && "rotate-180",
          )}
        />
      </button>
      <div className="maya-footer-col-body" data-collapsed={collapsed}>
        <div className="min-h-0 overflow-hidden">
          <ul className="space-y-3 pt-5">
            {links.map((l) => (
              <li key={l}>
                <button
                  onClick={() => onLink(l)}
                  className="maya-linkline text-sm font-semibold text-maya-cream/70 hover:text-maya-cream"
                >
                  {l}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const { notify } = useStore();
  const markRef = useRef<HTMLDivElement>(null);

  /* watermark parallax */
  useLayoutEffect(() => {
    const { gsap } = gsapSetup();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        markRef.current,
        { yPercent: 46 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: markRef.current, start: "top bottom", end: "bottom bottom", scrub: 0.5 },
        },
      );
    }, markRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <footer className="relative overflow-hidden bg-maya-ink text-maya-cream" aria-label="پانوشت">
        {/* top marquee */}
        <div className="border-b border-maya-creamline py-5 md:py-7">
          <MayaMarquee speed={26} direction={1} fadeEdges={false}>
            <span className="flex items-center whitespace-nowrap">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="flex items-center">
                  <span className="maya-outline-cream px-5 text-3xl font-black md:text-5xl">
                    استایل‌های محبوبت
                  </span>
                  <i className="maya-diamond scale-150 text-maya-clay" />
                  <span className="px-5 text-3xl font-black text-maya-cream md:text-5xl">با قیمت‌های باورنکردنی</span>
                  <i className="maya-diamond scale-150 text-maya-clay" />
                </span>
              ))}
            </span>
          </MayaMarquee>
        </div>

        <div className="maya-wrap grid gap-12 py-16 md:py-20 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          {/* brand + newsletter */}
          <div>
            <p className="text-3xl font-black">
              مایا<span className="text-maya-clay">.</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-8 text-maya-cream/65">
              چه به‌دنبال شیک‌ترین ضروری‌ها باشی، چه استایل‌های خاص یا لباس‌های راحتِ روزمره؛ برای هر
              سلیقه‌ای چیزی داریم. کمدت را امروز با داغ‌ترین استایل‌های فصل تازه کن.
            </p>
            <p className="mt-8 mb-3 text-xs font-black text-maya-sand">از تخفیف‌ها زودتر باخبر شو</p>
            <Newsletter />
          </div>

          {/* link columns — collapsible on mobile, always open on desktop
              (the theme's `<details is="accordion-details" data-footer-accordions>`) */}
          {[
            ["لینک‌های سریع", QUICK_LINKS],
            ["پشتیبانی", SUPPORT_LINKS],
          ].map(([head, links]) => (
            <FooterColumn
              key={head as string}
              head={head as string}
              links={links as string[]}
              onLink={(l) =>
                l === "جستجو" ? scrollToTarget("#maya-trending") : notify(`نسخه نمایشی — صفحه «${l}» به‌زودی`)
              }
            />
          ))}

          {/* social + payments */}
          <div>
            <p className="mb-5 text-xs font-black text-maya-sand">همراه ما باشید</p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Camera, label: "اینستاگرام" },
                { icon: Send, label: "تلگرام" },
                { icon: Aperture, label: "آپارات" },
                { icon: AtSign, label: "پینترست" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  onClick={() => notify(`نسخه نمایشی — ${label} مایا به‌زودی`)}
                  className="grid size-11 place-items-center rounded-full border border-maya-creamline text-maya-cream/75 transition-all duration-300 hover:-translate-y-1 hover:border-maya-cream hover:bg-maya-cream hover:text-maya-ink"
                >
                  <Icon className="size-[1.15rem]" />
                </button>
              ))}
            </div>
            <p className="mt-8 mb-3 text-xs font-black text-maya-sand">پرداخت امن با</p>
            <div className="flex flex-wrap gap-2">
              {["زرین‌پال", "شتاب", "نماد اعتماد"].map((p) => (
                <span
                  key={p}
                  className="rounded-lg border border-maya-creamline px-3 py-2 text-[11px] font-bold text-maya-cream/70"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-maya-creamline">
          <div className="maya-wrap flex flex-wrap items-center justify-between gap-4 py-6 text-xs text-maya-cream/55">
            <p className="flex items-center gap-1.5">
              © {fa(1405)} مایا — ساخته‌شده با
              <Heart className="size-3.5 text-maya-clay" fill="currentColor" />
              در تهران
            </p>
            <button className="maya-linkline flex items-center gap-2 font-bold text-maya-cream/75 hover:text-maya-cream">
              تومان · فارسی
              <ArrowLeft className="size-3.5" />
            </button>
          </div>
        </div>

        {/* watermark */}
        <div ref={markRef} className="pointer-events-none relative z-0 -mb-[4vw] select-none will-change-transform" aria-hidden>
          <p className="maya-outline-cream text-center text-[38vw] font-black leading-[0.8] opacity-30 lg:text-[24vw]">
            مایا
          </p>
        </div>
      </footer>

      <BackToTop />
    </>
  );
}
