"use client";

import { useEffect, useId, useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";

export const ease = [0.22, 1, 0.36, 1] as const;

export function Instagram({ size = 20, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" /></svg>;
}

export function Youtube({ size = 20, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" /></svg>;
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: 0, y: reduced ? 0 : 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -40px 0px" }} transition={{ duration: reduced ? 0 : 0.9, delay, ease }}>{children}</motion.div>;
}

export function Star({ className = "", stroke = false }: { className?: string; stroke?: boolean }) {
  return <svg className={className} viewBox="0 0 64 64" fill={stroke ? "none" : "currentColor"} stroke={stroke ? "currentColor" : "none"} strokeWidth="0.8" aria-hidden="true"><path d="M32 0 36.8 21.6 54.6 9.4 42.4 27.2 64 32 42.4 36.8 54.6 54.6 36.8 42.4 32 64 27.2 42.4 9.4 54.6 21.6 36.8 0 32 21.6 27.2 9.4 9.4 27.2 21.6Z" /></svg>;
}

export function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 16 });
  const springY = useSpring(y, { stiffness: 180, damping: 16 });
  function move(event: MouseEvent<HTMLDivElement>) {
    if (reduced || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.16);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.16);
  }
  return <motion.div className={className} onMouseMove={move} onMouseLeave={() => { x.set(0); y.set(0); }} style={{ x: springX, y: springY }}>{children}</motion.div>;
}

export function TextButton({ children, onClick, className = "", light = false }: { children: ReactNode; onClick?: () => void; className?: string; light?: boolean }) {
  return <button className={`text-button ${light ? "is-light" : ""} ${className}`} onClick={onClick}><span>{children}</span><span className="button-arrow"><ArrowUpRight size={18} strokeWidth={1.4} /></span></button>;
}

export function SectionHeading({ en, jp, className = "" }: { en: string; jp: string; className?: string }) {
  return <div className={`section-heading ${className}`}><span className="eyebrow"><span className="tiny-dot" />{jp}</span><h2 className="serif">{en}</h2></div>;
}

export function Dialog({ title, eyebrow, children, onClose, wide = false, className = "" }: { title: string; eyebrow?: string; children: ReactNode; onClose: () => void; wide?: boolean; className?: string }) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>("[data-autofocus]") || panelRef.current;
      target?.focus();
    }, 100);
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const elements = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]');
      const focusables = elements ? Array.from(elements).filter((el) => el.getClientRects().length > 0) : [];
      if (!focusables.length) { event.preventDefault(); return; }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panelRef.current)) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keydown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [onClose]);
  return <motion.div className="dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={id} className={`dialog-panel ${wide ? "dialog-wide" : ""} ${className}`} initial={{ opacity: 0, y: reduced ? 0 : 36, scale: reduced ? 1 : 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : 20, scale: reduced ? 1 : 0.98 }} transition={{ duration: 0.45, ease }}>
      <button className="dialog-close icon-button" onClick={onClose} aria-label="閉じる"><X size={23} strokeWidth={1.3} /></button>
      <div className="dialog-heading">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 id={id} className="serif">{title}</h2></div>
      {children}
    </motion.div>
  </motion.div>;
}
