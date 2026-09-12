"use client";

import { Play } from "lucide-react";
import Magnetic from "./Magnetic";

const STATS = [
  { count: 120, suffix: "هزار+", label: "کاربر فعال در سراسر ایران" },
  { count: 360, suffix: "+", label: "ویدیوی تمرینی با روایت فارسی" },
  { count: 4.9, suffix: "", label: "امتیاز کاربران از ۵", decimals: 1 },
] as const;

export default function Hero({ onPlay, onStart }: { onPlay: () => void; onStart: () => void }) {
  return (
    <section id="hero" data-if-spy="۱" className="if-hero">
      <div className="if-hero-bg" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v20/media/hero.webp" alt="" fetchPriority="high" />
      </div>

      <span className="if-hero-side">قدرت · انضباط · سبک زندگی</span>

      <div className="if-container">
        <div className="if-hero-content">
          <p className="if-kicker">باشگاهت، حالا تو جیبت — تهران تا هر کجای ایران</p>

          <h1>
            <span className="if-line">
              <span>بهترینِ نسخه‌ی</span>
            </span>
            <span className="if-line">
              <span>
                <em>بدنت</em> را بساز
              </span>
            </span>
          </h1>

          <p className="if-hero-sub">
            برنامه تمرینی هوشمند، ویدیوهای فارسی و برنامه غذاییِ سازگار با سفره
            ایرانی؛ در خانه یا باشگاه، با یک مربی که همیشه همراهت است. هیچ دو
            جلسه‌ای شبیه هم نیست.
          </p>

          <div className="if-hero-actions">
            <Magnetic>
              <button className="if-btn if-btn--solid" onClick={onStart}>
                شروع برنامه — ۷ روز رایگان
              </button>
            </Magnetic>

            <Magnetic strength={0.35}>
              <button className="if-play" onClick={onPlay} aria-label="پخش ویدیوی معرفی">
                <span className="if-play-disc">
                  <Play size={18} fill="currentColor" />
                </span>
                <span>
                  تماشای دمو تمرین
                  <small>۳۱ ثانیه — با صدای فارسی</small>
                </span>
              </button>
            </Magnetic>
          </div>

          <div className="if-hero-stats">
            {STATS.map((s) => (
              <div key={s.label} className="if-hero-stat">
                <b>
                  <i>{s.suffix}</i>
                  <span data-if-count={s.count} data-if-decimals={"decimals" in s ? s.decimals : 0}>
                    ۰
                  </span>
                </b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="if-scroll-cue" aria-hidden>
        <span className="if-track" />
        اسکرول
      </div>
    </section>
  );
}
