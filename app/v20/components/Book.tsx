"use client";

import { BadgeCheck, ArrowLeft } from "lucide-react";
import Magnetic from "./Magnetic";

const POINTS = [
  "سفره ایرانی، نه رژیم خارجی — برنامه با همون غذاهای خونه",
  "راهنمای کامل رستوران و دورهمی؛ بدون حس گناه",
  "جداول کالری و پروتئین غذاهای رایج ایرانی",
  "پروتکل ۹۰ روز برای ساختن عادت غذایی دائمی",
];

export default function Book() {
  return (
    <section id="book" data-if-spy="۳" className="if-section if-book-section">
      <span className="if-ghost" data-if-parallax>
        ۰۳
      </span>
      <div className="if-container">
        <div className="if-book-grid">
          <div>
            <p className="if-kicker" data-if-reveal>
              ۰۳ · کتاب ایرون‌فیت
            </p>
            <h2 className="if-title" data-if-reveal data-if-delay="0.08">
              <em>تغذیه قهرمانان</em>
              <br />
              سفره‌ات جای جنگ نیست
            </h2>
            <p className="if-lead" data-if-reveal data-if-delay="0.16">
              بعد از سال‌ها کار با ورزشکاران، فهمیدیم کدام راهبردهای تغذیه
              واقعا جواب می‌دهند: آن‌هایی که با زندگی واقعی و سفره ایرانی سازگار
              باشند. این کتاب همان مسیر کوتاه و قابل‌اجراست.
            </p>
            <ul className="if-book-list">
              {POINTS.map((p, i) => (
                <li key={p} data-if-reveal data-if-delay={String(0.2 + i * 0.07)}>
                  <BadgeCheck size={17} />
                  {p}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "2.2rem" }} data-if-reveal data-if-delay="0.45">
              <Magnetic>
                <a className="if-btn if-btn--ghost" href="#pricing" onClick={(e) => e.preventDefault()}>
                  پیش‌خرید نسخه چاپی
                  <ArrowLeft className="if-btn-ic" size={16} />
                </a>
              </Magnetic>
            </div>
          </div>

          <div className="if-book-stage" data-if-reveal data-if-delay="0.2">
            <span className="if-book-glow" aria-hidden />
            <div className="if-book-photo" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v20/media/nutrition.jpg" alt="" loading="lazy" />
            </div>
            <div className="if-book" aria-label="جلد کتاب تغذیه قهرمانان">
              <div className="if-book-cover">
                <span>IRONFIT PRESS</span>
                <h3>
                  تغذیه
                  <br />
                  <i>قهرمانان</i>
                </h3>
                <footer>آرش کیانی · نسخه فارسی</footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
