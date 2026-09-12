"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Sparkles } from "lucide-react";
import { scrollToSection } from "../lib/anim";
import { faIndex } from "../lib/fa";

const LINKS = [
  { id: "program", label: "برنامه تمرینی" },
  { id: "book", label: "کتاب" },
  { id: "coach", label: "مربی" },
  { id: "pricing", label: "تعرفه‌ها" },
  { id: "app", label: "اپلیکیشن" },
  { id: "stories", label: "نظرات" },
  { id: "news", label: "اخبار" },
];

export default function Nav({ onStart }: { onStart: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 6) {
        // hide on the way down, reveal on the way up (never while the menu is open)
        setHidden(y > last && y > 460);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    window.setTimeout(() => scrollToSection(`#${id}`), open ? 220 : 0);
  };

  const start = () => {
    setOpen(false);
    window.setTimeout(onStart, open ? 220 : 0);
  };

  return (
    <>
      <header
        className={`if-nav ${scrolled ? "is-scrolled" : ""} ${
          hidden && !open ? "is-hidden" : ""
        }`}
      >
        <div className="if-container if-nav-bar">
          <button
            className="if-logo"
            onClick={() => scrollToSection("#hero")}
            aria-label="ایرون‌فیت — بازگشت به بالا"
          >
            <span className="if-logo-mark">
              <Dumbbell size={20} strokeWidth={2.4} />
            </span>
            ایرون‌فیت
            <small>IRONFIT</small>
          </button>

          <nav className="if-nav-links" aria-label="ناوبری اصلی">
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                className="if-uline"
                onClick={(e) => {
                  e.preventDefault();
                  go(l.id);
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <button className="if-btn if-btn--solid if-nav-cta" onClick={start}>
            <Sparkles size={15} />
            برنامه‌ساز هوشمند
          </button>

          <button
            className={`if-burger ${open ? "is-open" : ""}`}
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="if-menu"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {LINKS.map((l, i) => (
              <motion.a
                key={l.id}
                href={`#${l.id}`}
                className="if-menu-link"
                initial={{ opacity: 0, x: 42 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => {
                  e.preventDefault();
                  go(l.id);
                }}
              >
                <i>{faIndex(i + 1)}</i>
                {l.label}
              </motion.a>
            ))}

            <motion.button
              type="button"
              className="if-menu-cta"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={start}
            >
              <Sparkles size={16} />
              برنامه‌ساز هوشمند — همین حالا امتحان کن
            </motion.button>

            <motion.div
              className="if-menu-foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span>پشتیبانی: ۰۲۱-۲۲۴۴۰۰۱۱</span>
              <span>هر روز از ۸ صبح تا ۱۰ شب</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
