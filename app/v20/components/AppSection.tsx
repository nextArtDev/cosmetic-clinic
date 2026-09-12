"use client";

import { CloudDownload as DownloadCloud, MonitorSmartphone, Bell, WifiOff, ShoppingBag } from "lucide-react";

const FEATS = [
  {
    icon: WifiOff,
    title: "تماشای آفلاین",
    text: "ویدیوها را دانلود کن و بدون اینترنت، تو ورزشگاه یا سفر تمرین کن.",
  },
  {
    icon: MonitorSmartphone,
    title: "همه‌جا پخش می‌شود",
    text: "گوشی، تبلت، لپ‌تاپ و تلویزیون‌های هوشمند — با یک حساب، همه‌جا.",
  },
  {
    icon: Bell,
    title: "یادآور هوشمند",
    text: "بر اساس برنامه هفتگی‌ات، سر ساعت تمرین بیدارت می‌کند؛ حتی در تقویم شمسی.",
  },
];

export default function AppSection() {
  return (
    <section id="app" data-if-spy="۸" className="if-section if-app-section">
      <span className="if-ghost" data-if-parallax>
        ۰۸
      </span>
      <div className="if-container">
        <div className="if-app-grid">
          <div>
            <p className="if-kicker" data-if-reveal>
              ۰۸ · اپلیکیشن
            </p>
            <h2 className="if-title" data-if-reveal data-if-delay="0.08">
              تمرینت را <em>هر جا که رفتی</em>
              <br />
              با خودت ببر
            </h2>
            <p className="if-lead" data-if-reveal data-if-delay="0.16">
              هتل سفر کاری، خانه مادربزرگ یا پارک محله — برنامه‌ات همیشه همراهت
              است؛ با کیفیت پخش تطبیقی برای اینترنت ایران.
            </p>

            <div className="if-app-feats">
              {FEATS.map((f, i) => (
                <div key={f.title} className="if-app-feat" data-if-reveal data-if-delay={String(0.18 + i * 0.09)}>
                  <span className="if-ic">
                    <f.icon size={20} />
                  </span>
                  <div>
                    <b>{f.title}</b>
                    <p>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="if-store-badges" data-if-reveal data-if-delay="0.5">
              <a className="if-store" href="#" onClick={(e) => e.preventDefault()}>
                <ShoppingBag size={22} />
                <span>
                  <small>دانلود از</small>
                  <b>کافه‌بازار</b>
                </span>
              </a>
              <a className="if-store" href="#" onClick={(e) => e.preventDefault()}>
                <DownloadCloud size={22} />
                <span>
                  <small>دانلود از</small>
                  <b>مایکت</b>
                </span>
              </a>
            </div>
          </div>

          <div className="if-phone-stage" data-if-reveal data-if-delay="0.22">
            <span className="if-phone-ring" aria-hidden />
            <div className="if-phone" data-if-parallax>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.pexels.com/photos/31028213/pexels-photo-31028213.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                alt="پیش‌نمایش اپلیکیشن ایرون‌فیت"
                loading="lazy"
              />
              <div className="if-phone-ui" aria-hidden>
                <b>جلسه امروز · بالاتنه</b>
                <span className="if-bar"><i /></span>
                <small style={{ fontSize: "0.62rem", color: "var(--if-faint)" }}>
                  ۱۲ از ۱۸ حرکت — ۲۲ دقیقه مانده
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
