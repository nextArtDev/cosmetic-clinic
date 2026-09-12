"use client";

import { Play } from "lucide-react";
import ScrollCue from "./ScrollCue";
import type { IranfitProgram } from "../data/types";

/**
 * "برنامه بانوان / برنامه آقایان" — the cinematic two-up split from the
 * original site's `section_programs` (Women's Fitness / Men's Fitness with a
 * PLAY button that opened a video lightbox). Each half is a full-bleed photo
 * card: hover lifts + zooms the photo, the play disc pulses, and clicking it
 * opens the shared video modal.
 */
export default function Programs({
  programs,
  onPlay,
}: {
  programs: IranfitProgram[];
  onPlay: (p: IranfitProgram) => void;
}) {
  return (
    <section id="programs" data-if-spy="۵" className="if-section if-programs">
      <span className="if-ghost" data-if-parallax>
        ۰۵
      </span>

      <div className="if-container if-programs-head">
        <p className="if-kicker" data-if-reveal>
          ۰۵ · مسیر تخصصی
        </p>
        <h2 className="if-title" data-if-reveal data-if-delay="0.08">
          برنامه‌ات را بر اساس
          <br />
          <em>خودت</em> انتخاب کن
        </h2>
        <p className="if-lead" data-if-reveal data-if-delay="0.16">
          دو مسیر جداگانه با دوره‌بندی، تمرین‌ها و نریشن اختصاصی؛ هر دو با
          تجهیزات ساده و قابل اجرا در خانه یا باشگاه.
        </p>
      </div>

      <div className="if-programs-split" data-if-reveal data-if-delay="0.2">
        {programs.map((p, i) => (
          <article key={p.slug} className={`if-program if-program--${p.slug}`}>
            <div className="if-program-media" aria-hidden>
              {/* wrapper carries the GSAP parallax so the <img> keeps its own
                  CSS hover-zoom transform (they would otherwise collide) */}
              <div className="if-program-parallax" data-if-parallax>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" loading="lazy" />
              </div>
            </div>
            <span className="if-program-veil" aria-hidden />

            <div className="if-program-body">
              <span className="if-program-index">{`۰${i + 1}`}</span>
              <h3 className="if-program-title">{p.title}</h3>
              <p className="if-program-sub">{p.subtitle}</p>
              <span className="if-program-meta">{p.meta}</span>

              <button
                type="button"
                className="if-program-play"
                onClick={() => onPlay(p)}
                aria-label={`پخش ویدیوی ${p.title}`}
              >
                <span className="if-program-disc">
                  <Play size={17} fill="currentColor" strokeWidth={0} />
                </span>
                تماشای نمونه تمرین
              </button>
            </div>
          </article>
        ))}
      </div>

      <ScrollCue target="#pricing" label="تعرفه‌ها" />
    </section>
  );
}
