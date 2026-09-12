"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { toFaDigits } from "../lib/fa";
import type { IranfitGalleryItem } from "../data/types";

/**
 * "پشت صحنه" photo grid + zoom lightbox.
 *
 * The original site's `section_about_items` was an asymmetric photo wall opened
 * through magnific-popup with a zoom transition and gallery navigation. This is
 * the same interaction rebuilt on framer-motion: hover-zoom tiles, a spring
 * zoom-in lightbox, prev/next, keyboard nav, swipe and a caption counter.
 */
export default function Gallery({ items }: { items: IranfitGalleryItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const open = active !== null;
  const touchX = useRef<number | null>(null);

  const close = useCallback(() => setActive(null), []);

  const step = useCallback(
    (d: number) => {
      setActive((v) => (v === null ? v : (v + d + items.length) % items.length));
    },
    [items.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(1);
      else if (e.key === "ArrowRight") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, close, step]);

  const current = active === null ? null : items[active];

  return (
    <div className="if-gallery">
      <div className="if-container">
        <div className="if-gal-grid">
          {items.map((g, i) => (
            <button
              key={`${g.src}-${i}`}
              type="button"
              className={`if-gal-item${g.wide ? " is-wide" : ""}${g.tall ? " is-tall" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`بزرگ‌نمایی: ${g.caption}`}
              data-if-reveal
              data-if-delay={String(0.05 * (i % 4))}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.src} alt={g.caption} loading="lazy" />
              <span className="if-gal-veil" aria-hidden />
              <span className="if-gal-zoom" aria-hidden>
                <Maximize2 size={16} />
              </span>
              <span className="if-gal-cap">{g.caption}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && current && (
          <motion.div
            className="if-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="گالری تصاویر"
          >
            <motion.figure
              className="if-lightbox-stage"
              initial={{ scale: 0.9, opacity: 0, y: 26 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 18 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                touchX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 48) step(dx > 0 ? -1 : 1);
                touchX.current = null;
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.src} alt={current.caption} />
              <figcaption>
                <span>{current.caption}</span>
                <span className="if-lightbox-count">
                  {toFaDigits((active ?? 0) + 1)} / {toFaDigits(items.length)}
                </span>
              </figcaption>
            </motion.figure>

            <button type="button" className="if-lightbox-close" onClick={close} aria-label="بستن گالری">
              <X size={18} />
            </button>

            <button
              type="button"
              className="if-lightbox-nav if-lightbox-nav--prev"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label="تصویر قبلی"
            >
              <ArrowRight size={20} />
            </button>
            <button
              type="button"
              className="if-lightbox-nav if-lightbox-nav--next"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label="تصویر بعدی"
            >
              <ArrowLeft size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
