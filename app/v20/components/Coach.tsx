"use client";

import { Medal, ArrowLeft } from "lucide-react";
import Magnetic from "./Magnetic";
import Gallery from "./Gallery";
import ScrollCue from "./ScrollCue";
import { scrollToSection } from "../lib/anim";
import type { IranfitGalleryItem } from "../data/types";

const COUNTERS = [
  { count: 18, label: "سال سابقه مربی‌گری" },
  { count: 960, label: "شاگرد آنلاین و حضوری" },
  { count: 24, label: "مدال تیمی ملی و آسیایی" },
];

export default function Coach({ gallery }: { gallery: IranfitGalleryItem[] }) {
  return (
    <section id="coach" data-if-spy="۴" className="if-section">
      <span className="if-ghost" data-if-parallax>
        ۰۴
      </span>
      <div className="if-container">
        <div className="if-coach-grid">
          <div className="if-coach-photo" data-if-reveal>
            <div className="if-img" data-if-parallax>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v20/media/coach.webp" alt="آرش کیانی — سرمربی ایرون‌فیت" loading="lazy" />
            </div>
            <span className="if-exp">
              <b>+۱۸</b>
              <span>سال تجربه مربی‌گری</span>
            </span>
          </div>

          <div>
            <p className="if-kicker" data-if-reveal>
              ۰۴ · سرمربی تیم
            </p>
            <h2 className="if-title" data-if-reveal data-if-delay="0.08">
              با <em>آرش کیانی</em> تمرین کن؛
              <br />
              مثل ورزشکاران ملی
            </h2>
            <p className="if-lead" data-if-reveal data-if-delay="0.16">
              سرمربی سابق تیم‌های ملی و طراح برنامه ده‌ها ورزشکار مدال‌آور،
              حالا دقیقا همان متد را برای آدم‌های واقعی با زندگی واقعی
              بازطراحی کرده است: کم‌وسیله، فارسی و قابل‌اجرا.
            </p>
            <p className="if-lead" data-if-reveal data-if-delay="0.24">
              هر ویدیو با جزئیات فرم حرکت، خطاهای رایج و جایگزین‌های ساده‌تر
              روایت می‌شود تا بدون مربی حضوری هم خیالت راحت باشد.
            </p>

            <div className="if-coach-counters">
              {COUNTERS.map((c, i) => (
                <div key={c.label} data-if-reveal data-if-delay={String(0.28 + i * 0.08)}>
                  <b data-if-count={c.count}>۰</b>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "2.2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }} data-if-reveal data-if-delay="0.5">
              <Magnetic>
                <button className="if-btn if-btn--ghost" onClick={() => scrollToSection("#stories")}>
                  <Medal size={16} />
                  داستان شاگردها
                  <ArrowLeft className="if-btn-ic" size={15} />
                </button>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* Behind-the-scenes photo wall — the original's "MEET STEVE ZIM"
            gallery, now a zoomable lightbox. */}
        <div className="if-gallery-head" data-if-reveal>
          <p className="if-kicker">پشت صحنه سالن</p>
          <p className="if-gallery-note">
            روی هر عکس بزن تا بزرگ ببینی — با کلیدهای جهت‌دار بین تصاویر جابه‌جا شو.
          </p>
        </div>
      </div>
      <Gallery items={gallery} />

      <ScrollCue target="#programs" label="برنامه‌های تخصصی" />
    </section>
  );
}
