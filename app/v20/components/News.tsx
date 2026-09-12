'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Newspaper } from 'lucide-react'
import { gsap } from '../lib/anim'
import type { IranfitPost } from '../data/types'

export default function News({ posts }: { posts: IranfitPost[] }) {
  const [idx, setIdx] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragX = useRef<number | null>(null)

  const step = useCallback(() => {
    const track = trackRef.current
    if (!track) return 0
    const card = track.querySelector<HTMLElement>('.if-news-card')
    if (!card) return 0
    const gap = parseFloat(getComputedStyle(track).columnGap || '22') || 22
    return card.offsetWidth + gap
  }, [])

  const maxIdx = useCallback(() => {
    const track = trackRef.current
    const viewport = viewportRef.current
    if (!track || !viewport) return 0
    const s = step()
    if (!s) return 0
    const visible = Math.max(1, Math.floor(viewport.offsetWidth / s))
    return Math.max(0, posts.length - visible)
  }, [posts.length, step])

  const [max, setMax] = useState(0)

  const measure = useCallback(() => setMax(maxIdx()), [maxIdx])

  useEffect(() => {
    const track = trackRef.current
    // ResizeObserver fires once immediately after observe, so initial
    // measurement and every later card/image resize re-derives the bounds
    // (no render-time ref reads, no setState directly in the effect body).
    const ro = track
      ? new ResizeObserver(() => {
          measure()
          setIdx((v) => Math.min(v, maxIdx()))
        })
      : null
    if (track && ro) ro.observe(track)
    const onResize = () => {
      measure()
      setIdx((v) => Math.min(v, maxIdx()))
    }
    window.addEventListener('resize', onResize)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [measure, maxIdx])

  const go = useCallback(
    (next: number) => setIdx(Math.min(Math.max(0, next), max)),
    [max],
  )

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    // RTL track: translate in the *positive* X direction to move left-forward
    gsap.to(track, { x: idx * step(), duration: 0.8, ease: 'power3.inOut' })
  }, [idx, step, posts.length])

  return (
    <section
      id="news"
      data-if-spy="۱۰"
      className="if-section"
      style={{ paddingBottom: 0 }}
    >
      <span className="if-ghost" data-if-parallax>
        ۱۰
      </span>
      <div className="if-container">
        <div className="if-news-head">
          <div>
            <p className="if-kicker" data-if-reveal>
              ۱۰ · اخبار و رویدادها
            </p>
            <h2 className="if-title" data-if-reveal data-if-delay="0.08">
              می‌دانیم که توانایی‌های تو
              <br />
              <em>بی‌پایان است</em>
            </h2>
          </div>
          <div className="if-news-actions" data-if-reveal data-if-delay="0.15">
            <div className="if-slider-btns">
              <button
                type="button"
                className="if-arrow"
                aria-label="خبر قبلی"
                onClick={() => go(idx - 1)}
                disabled={idx === 0}
              >
                <ArrowRight size={19} />
              </button>
              <button
                type="button"
                className="if-arrow"
                aria-label="خبر بعدی"
                onClick={() => go(idx + 1)}
                disabled={idx >= max}
              >
                <ArrowLeft size={19} />
              </button>
            </div>
            <a className="if-news-all" href="#news" onClick={(e) => e.preventDefault()}>
              <Newspaper size={15} />
              همه اخبار
            </a>
          </div>
        </div>
      </div>

      <div
        className="if-news-viewport"
        ref={viewportRef}
        data-if-reveal
        data-if-delay="0.2"
        onTouchStart={(e) => {
          dragX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (dragX.current === null) return
          const dx = e.changedTouches[0].clientX - dragX.current
          if (Math.abs(dx) > 46) go(dx > 0 ? idx - 1 : idx + 1)
          dragX.current = null
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') go(idx + 1)
          else if (e.key === 'ArrowRight') go(idx - 1)
        }}
        tabIndex={0}
        aria-roledescription="کاروسل"
        aria-label="اخبار و رویدادها"
      >
        <div className="if-news-track" ref={trackRef}>
          {posts.map((p) => (
            <article key={p.slug} className="if-news-card">
              <div className="if-news-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.title} loading="lazy" />
                <i>{p.tag}</i>
              </div>
              <div className="if-news-body">
                <h3>{p.title}</h3>
                <p>{p.excerpt}</p>
                <time>
                  <CalendarDays size={13} />
                  {p.dateLabel}
                </time>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
