"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Heart,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ArrowLeft,
  Camera,
  Send,
  Aperture,
} from "lucide-react";
import type { MayaCollection } from "../lib/data";
import { cn, fa, scrollToTarget, EASE_EXPO } from "../lib/fx";
import { useStore } from "./Store";

/* --------------------------- announcement ---------------------------- */

const ANNOUNCEMENTS = [
  "ارسال رایگان برای سفارش‌های بالای ۲٬۰۰۰٬۰۰۰ تومان",
  "۷ روز ضمانت بازگشت بی‌قیدوشرط",
  "پرداخت امن با درگاه زرین‌پال و کارت‌های شتاب",
  "ارسال به سراسر ایران با تیپاکس و پست",
];

function AnnouncementBar({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "overflow-hidden bg-maya-ink text-maya-cream transition-all duration-500",
        collapsed ? "max-h-0" : "max-h-10",
      )}
    >
      <div className="maya-ticker h-10 items-center text-[11px] font-semibold md:text-xs">
        <div className="maya-ticker-track h-10 items-center" style={{ ["--maya-ticker-dur" as string]: "36s" }}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex h-10 items-center" aria-hidden={dup === 1}>
              {ANNOUNCEMENTS.map((msg, i) => (
                <span key={i} className="flex items-center gap-6 px-6 whitespace-nowrap">
                  {msg}
                  <i className="maya-diamond opacity-50" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ mega menu --------------------------- */

const MEGA_TABS = [
  {
    title: "کالکشن زمستانه",
    items: ["هودی اورسایز", "پالتو پشمی", "بافت زنانه", "هودی گرم و نرم", "کاپشن کوهنوردی"],
  },
  {
    title: "استایل ورزشی",
    items: ["نیم‌تنه اسپرت", "ست باشگاهی", "لگ ورزشی", "تاپ رانینگ", "شلوارکت راحتی"],
  },
  {
    title: "تابستان خنک",
    items: ["تیشرت نخی", "پیراهن لینن", "شلوارک جین", "تاپ ساتن", "صندل بافتی"],
  },
];

function MegaMenu({ collections, open }: { collections: MayaCollection[]; open: boolean }) {
  const { notify } = useStore();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.35, ease: EASE_EXPO }}
          className="absolute inset-x-0 top-full pt-2"
        >
          <div className="overflow-hidden rounded-3xl border border-maya-line bg-maya-cream shadow-[0_32px_80px_-20px_rgba(22,19,14,0.35)]">
            <div className="grid grid-cols-4 gap-8 p-8">
              {MEGA_TABS.map((col, ci) => (
                <div key={col.title}>
                  <p className="mb-4 text-xs font-black text-maya-clay">{col.title}</p>
                  <ul className="space-y-2.5">
                    {col.items.map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 + ci * 0.05 + i * 0.04, duration: 0.3 }}
                      >
                        <button
                          className="maya-linkline text-sm font-semibold text-maya-coal hover:text-maya-ink"
                          onClick={() => notify(`نسخه نمایشی — صفحه «${item}» به‌زودی`)}
                        >
                          {item}
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
              <button
                className="group relative block overflow-hidden rounded-2xl text-right"
                onClick={() => scrollToTarget("#maya-collections")}
              >
                <img
                  src={collections[0]?.image}
                  alt={collections[0]?.title}
                  className="aspect-[3/3.6] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-maya-ink/70 via-transparent to-transparent" />
                <span className="absolute bottom-4 right-4 left-4 flex items-center justify-between text-maya-cream">
                  <span className="text-sm font-black">{collections[0]?.title}</span>
                  <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ header ------------------------------ */

const NAV = [
  { label: "خانه", target: 0 as const },
  { label: "محصولات پرطرفدار", target: "#maya-trending" },
  { label: "کالکشن‌ها", target: "#maya-collections" },
  { label: "باندل بساز", target: "#maya-bundle" },
  { label: "سوالات متداول", target: "#maya-faq" },
];

export function Header({ collections }: { collections: MayaCollection[] }) {
  const { cartCount, setCartOpen, setSearchOpen, menuOpen, setMenuOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 56);
        if (y > 520 && y > lastY.current + 6) setHidden(true);
        else if (y < lastY.current - 6 || y < 120) setHidden(false);
        lastY.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[80]">
      <AnnouncementBar collapsed={scrolled} />
      <motion.header
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: EASE_EXPO }}
        className={cn(
          "transition-colors duration-500",
          scrolled ? "maya-glass text-maya-ink shadow-[0_10px_40px_-18px_rgba(22,19,14,0.35)]" : "text-maya-cream",
        )}
      >
        <div className="maya-wrap flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
          {/* start side: logo + burger */}
          <div className="flex items-center gap-2">
            <button
              className={cn("maya-iconbtn lg:hidden", !scrolled && "hover:bg-white/10")}
              onClick={() => setMenuOpen(true)}
              aria-label="باز کردن منو"
            >
              <Menu className="size-5" />
            </button>
            <button
              onClick={() => scrollToTarget(0)}
              className="select-none text-2xl font-black tracking-tight"
              aria-label="مایا — بازگشت به بالا"
            >
              مایا<span className="text-maya-clay">.</span>
            </button>
          </div>

          {/* nav */}
          <nav className="hidden items-center gap-7 lg:flex">
            <button
              onClick={() => scrollToTarget(0)}
              className="maya-linkline text-sm font-bold"
            >
              خانه
            </button>
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button
                className="maya-linkline flex items-center gap-1 py-6 text-sm font-bold"
                data-active={megaOpen}
                onClick={() => scrollToTarget("#maya-collections")}
              >
                فروشگاه
                <ChevronDown className={cn("size-3.5 transition-transform duration-300", megaOpen && "rotate-180")} />
              </button>
              <MegaMenu collections={collections} open={megaOpen} />
            </div>
            {NAV.slice(1).map((n) => (
              <button
                key={n.label}
                onClick={() => scrollToTarget(n.target as string)}
                className="maya-linkline text-sm font-bold"
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* end side: actions */}
          <div className="flex items-center gap-0.5">
            <button
              className={cn("maya-iconbtn", !scrolled && "hover:bg-white/10")}
              onClick={() => setSearchOpen(true)}
              aria-label="جستجو"
            >
              <Search className="size-[1.15rem]" />
            </button>
            <button
              className={cn("maya-iconbtn hidden sm:inline-grid", !scrolled && "hover:bg-white/10")}
              onClick={() => scrollToTarget("#maya-faq")}
              aria-label="حساب کاربری"
            >
              <User className="size-[1.15rem]" />
            </button>
            <button
              className={cn("maya-iconbtn hidden sm:inline-grid", !scrolled && "hover:bg-white/10")}
              aria-label="علاقه‌مندی‌ها"
            >
              <Heart className="size-[1.15rem]" />
              <span className="maya-badge">{fa(3)}</span>
            </button>
            <button
              className={cn("maya-iconbtn", !scrolled && "hover:bg-white/10")}
              onClick={() => setCartOpen(true)}
              aria-label="سبد خرید"
            >
              <ShoppingBag className="size-[1.15rem]" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="maya-badge"
                  >
                    {fa(cartCount)}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} collections={collections} />
    </div>
  );
}

/* --------------------------- mobile drawer --------------------------- */

function MobileMenu({
  open,
  onClose,
  collections,
}: {
  open: boolean;
  onClose: () => void;
  collections: MayaCollection[];
}) {
  const [shopOpen, setShopOpen] = useState(false);
  const go = (target: string | number) => {
    onClose();
    window.setTimeout(() => scrollToTarget(target), 250);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[92] bg-maya-ink/55 backdrop-blur-[2px] lg:hidden"
          />
          <motion.aside
            initial={{ x: "104%" }}
            animate={{ x: 0 }}
            exit={{ x: "104%" }}
            transition={{ duration: 0.5, ease: EASE_EXPO }}
            className="fixed inset-y-0 right-0 z-[93] flex w-[86%] max-w-sm flex-col bg-maya-cream lg:hidden"
            role="dialog"
            aria-label="منوی موبایل"
          >
            <div className="flex items-center justify-between border-b border-maya-line px-6 py-5">
              <span className="text-2xl font-black">مایا<span className="text-maya-clay">.</span></span>
              <button className="maya-iconbtn" onClick={onClose} aria-label="بستن منو">
                <X className="size-5" />
              </button>
            </div>

            <nav className="maya-nobar flex-1 overflow-y-auto px-6 py-6">
              <ul className="space-y-1">
                <motion.li initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}>
                  <button onClick={() => go(0)} className="w-full py-3 text-right text-xl font-extrabold">
                    خانه
                  </button>
                </motion.li>
                <motion.li initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.14 }}>
                  <button
                    onClick={() => setShopOpen((v) => !v)}
                    className="flex w-full items-center justify-between py-3 text-right text-xl font-extrabold"
                  >
                    فروشگاه
                    <ChevronDown className={cn("size-5 transition-transform duration-300", shopOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {shopOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE_EXPO }}
                        className="overflow-hidden pr-4"
                      >
                        {collections.map((c) => (
                          <li key={c.id}>
                            <button
                              onClick={() => go("#maya-collections")}
                              className="flex w-full items-center justify-between py-2.5 text-sm font-semibold text-maya-mute"
                            >
                              {c.title}
                              <span className="text-[10px]">{fa(c.count)} محصول</span>
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.li>
                {NAV.slice(1).map((n, i) => (
                  <motion.li
                    key={n.label}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                  >
                    <button
                      onClick={() => go(n.target as string)}
                      className="w-full py-3 text-right text-xl font-extrabold"
                    >
                      {n.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-maya-line px-6 py-5">
              <p className="mb-3 text-xs font-bold text-maya-mute">همراه ما باشید</p>
              <div className="flex gap-2">
                {[Camera, Send, Aperture].map((Icon, i) => (
                  <span key={i} className="maya-iconbtn border border-maya-line">
                    <Icon className="size-4" />
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
