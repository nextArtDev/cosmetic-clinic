'use client';

import { useEffect } from 'react';
import { about } from '../data';
import styles from './elitone.module.css';

/**
 * Upstream lightbox: a full-screen `swiper carousel main` plus a
 * `swiper carousel thumbnails` strip, closable with Escape / the X / the
 * backdrop, and arrow-key navigable.
 */
export default function Lightbox({
  open,
  index,
  onClose,
  onIndex,
}: {
  open: boolean;
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const images = about.quarryImages;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, images.length, onClose, onIndex]);

  const current = images[Math.min(index, images.length - 1)];
  if (!current) return null;

  return (
    <div
      className={`${styles.esLightbox} ${open ? styles.esLightboxOn : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="نگارخانهٔ معدن"
      onClick={onClose}
    >
      <button
        type="button"
        className={styles.esLightboxClose}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="بستن"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M4.65 4.65a.5.5 0 0 1 .7 0L8 7.29l2.65-2.64a.5.5 0 1 1 .7.7L8.71 8l2.64 2.65a.5.5 0 0 1-.7.7L8 8.71l-2.65 2.64a.5.5 0 0 1-.7-.7L7.29 8 4.65 5.35a.5.5 0 0 1 0-.7z" />
        </svg>
      </button>

      <div className={styles.esLightboxStage} onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <button
            type="button"
            className={`${styles.esLightboxArrow} ${styles.esLightboxNext}`}
            /* `data-arrow` swaps the custom cursor to a chevron; `data-prev`
               mirrors it. Upstream reads both off the same element. */
            data-arrow=""
            onClick={() => onIndex((index + 1) % images.length)}
            aria-label="بعدی"
          >
            <Chevron dir="next" />
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.esLightboxImg}
          src={current.image}
          alt={current.alt}
          key={current.image}
        />

        {images.length > 1 && (
          <button
            type="button"
            className={`${styles.esLightboxArrow} ${styles.esLightboxPrev}`}
            data-arrow=""
            data-prev=""
            onClick={() => onIndex((index - 1 + images.length) % images.length)}
            aria-label="قبلی"
          >
            <Chevron dir="prev" />
          </button>
        )}
      </div>

      <div
        className={styles.esLightboxThumbs}
        onClick={(e) => e.stopPropagation()}
        role="tablist"
        aria-label="تصاویر"
      >
        {images.map((img, i) => (
          <button
            key={img.image}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={`${styles.esLightboxThumb} ${i === index ? styles.esLightboxThumbOn : ''}`}
            onClick={() => onIndex(i)}
            aria-label={img.alt}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.image} alt="" />
          </button>
        ))}
      </div>

      <span className={styles.esLightboxCaption}>{current.alt}</span>
    </div>
  );
}

function Chevron({ dir }: { dir: 'next' | 'prev' }) {
  return (
    <svg
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="currentColor"
      aria-hidden="true"
      style={{ transform: dir === 'next' ? 'scaleX(-1)' : undefined }}
    >
      <path d="M0.32 0.95L6.1 6.93L0.32 13.05L0 12.9L4.01 6.93L0 1.1L0.32 0.95Z" />
      <path d="M5.14 0.95L11.07 6.93L5.14 13.05L4.81 12.9L8.83 6.93L4.81 1.1L5.14 0.95Z" />
    </svg>
  );
}
