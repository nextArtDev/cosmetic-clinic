"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Short intro curtain: shows once per session, lifts after ~1s.
 */
export default function Preloader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("nova-intro")) return;
    const start = window.setTimeout(() => setShow(true), 0);
    document.documentElement.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      setShow(false);
      window.sessionStorage.setItem("nova-intro", "1");
      document.documentElement.style.overflow = "";
    }, 1400);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="curtain"
          className="nc:fixed nc:inset-0 nc:z-[100] nc:grid nc:place-items-center nc:bg-ink nc:text-white"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
        >
          <div className="grain nc:absolute nc:inset-0" />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.35 } }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="nc:relative nc:flex nc:flex-col nc:items-center"
          >
            <span className="nc:text-[clamp(2.6rem,9vw,5rem)] nc:font-extrabold nc:leading-none nc:tracking-[0.18em]">
              NOVA
            </span>
            <span className="nc:mt-2 nc:text-[11px] nc:font-semibold nc:tracking-[0.42em] nc:text-white/60">CAPILLAIRE</span>
            <span className="nc:relative nc:mt-6 nc:h-px nc:w-40 nc:overflow-hidden nc:bg-white/15">
              <motion.span
                className="nc:absolute nc:inset-y-0 nc:left-0 nc:bg-sage-soft"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              />
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
