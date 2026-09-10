'use client';

import { useRef, type ReactNode } from 'react';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { V15_EASE } from './Preloader';

/* ── word mask reveal (Persian-safe: splits on words, not glyphs) ──────── */
export function WordsReveal({
  text,
  className = '',
  as: Tag = 'p',
  delay = 0,
  stagger = 0.045,
}: {
  text: string;
  className?: string;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span';
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(' ');
  const Container = motion[Tag];
  return (
    <Container
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="inline-block overflow-hidden pb-1 align-bottom"
        >
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              hidden: { y: '115%', rotate: 2 },
              show: { y: '0%', rotate: 0, transition: { duration: 0.9, ease: V15_EASE } },
            }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Container>
  );
}

/* ── editorial image reveal: masking panel slides off, image settles ───── */
export function ImageReveal({
  src,
  alt,
  ratio = 'aspect-[4/5]',
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  className = '',
  parallax = true,
  children,
}: {
  src: string;
  alt: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  parallax?: boolean;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <div ref={ref} className={`relative overflow-hidden ${ratio} ${className}`}>
      <motion.div
        className="absolute -inset-y-[9%] inset-x-0"
        style={parallax ? { y } : undefined}
      >
        <motion.div
          className="relative h-full w-full"
          initial={{ scale: 1.18 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: V15_EASE }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        </motion.div>
      </motion.div>

      {/* masking curtain */}
      <motion.div
        className="absolute inset-0 z-10 bg-[color:var(--v15-paper)]"
        initial={{ y: 0 }}
        whileInView={{ y: '-101%' }}
        viewport={{ once: true, margin: '-8% 0px' }}
        transition={{ duration: 1.1, ease: V15_EASE, delay: 0.1 }}
      />
      {children}
    </div>
  );
}

/* ── simple fade-up block ──────────────────────────────────────────────── */
export function FadeUp({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1, ease: V15_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── hairline that draws itself ────────────────────────────────────────── */
export function DrawnLine({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`h-px w-full bg-[color:var(--v15-line)] ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      style={{ transformOrigin: 'right' }}
      transition={{ duration: 1.3, ease: V15_EASE }}
    />
  );
}

/* ── scroll-linked opacity for a single word (manifesto) ───────────────── */
export function ScrollWord({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: ReactNode;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [10, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block will-change-transform">
      {children}
    </motion.span>
  );
}
