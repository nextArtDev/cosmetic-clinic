"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { CalendarCheck, Stethoscope, MessageCircle } from "lucide-react";
import { site } from "../../lib/site";

/**
 * Bottom quick-navigation bar, visible on mobile only, that appears
 * once the hero has been scrolled past.
 */
export default function MobileQuickNav() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 420));

  return (
    <motion.nav
      aria-label="دسترسی سریع"
      initial={false}
      animate={{ y: visible ? 0 : 120, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="nc:fixed   nc:inset-x-3   nc:bottom-3   nc:z-40   nc:sm:hidden"
    >
      <div className="frosted   nc:flex   nc:items-stretch   nc:gap-1   nc:rounded-full   nc:p-1.5   nc:shadow-[0_18px_40px_-16px_rgba(12,13,14,.45)]   nc:ring-1   nc:ring-ink/10">
        <Link
          href="/v5/diagnostic"
          className="nc:flex   nc:flex-1   nc:items-center   nc:justify-center   nc:gap-2   nc:rounded-full   nc:bg-ink   nc:py-3   nc:text-[13px]   nc:font-semibold   nc:text-white   nc:active:scale-[0.98]"
        >
          <Stethoscope className="nc:size-4" />
          مشاوره
        </Link>
        <a
          href="/v5/#contact"
          className="nc:flex   nc:flex-1   nc:items-center   nc:justify-center   nc:gap-2   nc:rounded-full   nc:py-3   nc:text-[13px]   nc:font-semibold   nc:text-ink   nc:active:scale-[0.98]"
        >
          <CalendarCheck className="nc:size-4" />
          رزرو نوبت
        </a>
        <a
          href={site.whatsappHref}
          aria-label="واتساپ"
          target="_blank"
          rel="noreferrer noopener"
          className="nc:grid   nc:size-11   nc:place-items-center   nc:rounded-full   nc:bg-sage   nc:text-white   nc:active:scale-[0.96]"
        >
          <MessageCircle className="nc:size-4" />
        </a>
      </div>
    </motion.nav>
  );
}
