"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useRef, type MouseEvent, type ReactNode } from "react";

type Variant = "primary" | "dark" | "ghost" | "outline" | "sage";
type Size = "sm" | "md" | "lg";

type ButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: "arrow" | "external" | "none";
  className?: string;
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  magnetic?: boolean;
};

const base =
  "nc:group nc:relative nc:inline-flex nc:items-center nc:justify-center nc:gap-2 nc:rounded-full nc:font-semibold nc:tracking-tight nc:transition-[background-color,color,box-shadow,transform] nc:duration-500 nc:ease-[cubic-bezier(.16,1,.3,1)] nc:overflow-hidden nc:select-none nc:disabled:opacity-50 nc:disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "nc:bg-ink nc:text-white nc:hover:bg-sage-deep nc:shadow-[0_10px_30px_-12px_rgba(12,13,14,.45)]",
  dark: "nc:bg-white nc:text-ink nc:hover:bg-sage-soft",
  ghost: "nc:bg-transparent nc:text-ink nc:hover:bg-fog",
  outline: "nc:bg-transparent nc:text-ink nc:ring-1 nc:ring-inset nc:ring-ink/20 nc:hover:ring-ink nc:hover:bg-white",
  sage: "nc:bg-sage nc:text-white nc:hover:bg-sage-deep nc:shadow-[0_10px_30px_-12px_rgba(47,83,46,.55)]",
};

const sizes: Record<Size, string> = {
  sm: "nc:h-10 nc:px-4 nc:text-[13px]",
  md: "nc:h-12 nc:px-6 nc:text-sm",
  lg: "nc:h-14 nc:px-7 nc:text-[15px]",
};

export default function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  icon = "arrow",
  className = "",
  external,
  onClick,
  type = "button",
  disabled,
  magnetic = true,
}: ButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.32);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Icon = icon === "external" ? ArrowUpRight : ArrowRight;

  const inner = (
    <>
      <span className="nc:relative nc:z-10 nc:flex nc:items-center nc:gap-2">
        <span className="nc:relative nc:block nc:overflow-hidden">
          <span className="nc:block nc:transition-transform nc:duration-500 nc:ease-[cubic-bezier(.16,1,.3,1)] nc:group-hover:-translate-y-full">
            {children}
          </span>
          <span
            aria-hidden
            className="nc:absolute nc:inset-0 nc:block nc:translate-y-full nc:transition-transform nc:duration-500 nc:ease-[cubic-bezier(.16,1,.3,1)] nc:group-hover:translate-y-0"
          >
            {children}
          </span>
        </span>
        {icon !== "none" && (
          <span className="nc:relative nc:grid nc:size-5 nc:place-items-center nc:overflow-hidden">
            <Icon
              className="nc:absolute nc:size-4 nc:transition-transform nc:duration-500 nc:ease-[cubic-bezier(.16,1,.3,1)] nc:group-hover:translate-x-5 nc:group-hover:-translate-y-0 nc:group-hover:opacity-0"
              strokeWidth={2.2}
            />
            <Icon
              className="nc:absolute nc:size-4 nc:-translate-x-5 nc:opacity-0 nc:transition-all nc:duration-500 nc:ease-[cubic-bezier(.16,1,.3,1)] nc:group-hover:translate-x-0 nc:group-hover:opacity-100"
              strokeWidth={2.2}
            />
          </span>
        )}
      </span>
    </>
  );

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = href ? (
    external || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel") ? (
      <a
        href={href}
        className={cls}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
        onClick={onClick}
      >
        {inner}
      </a>
    ) : (
      <Link href={href} className={cls} onClick={onClick}>
        {inner}
      </Link>
    )
  ) : (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="nc:inline-block"
    >
      {content}
    </motion.div>
  );
}
