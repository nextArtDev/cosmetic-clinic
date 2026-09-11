"use client";

import { Dumbbell, AtSign, Send, Clapperboard, MapPin, Phone, Mail } from "lucide-react";
import { scrollToSection } from "../lib/anim";

const QUICK = [
  { id: "program", label: "برنامه تمرینی" },
  { id: "book", label: "کتاب تغذیه قهرمانان" },
  { id: "pricing", label: "تعرفه‌ها" },
  { id: "stories", label: "داستان قهرمانان" },
];

const SUPPORT = [
  { label: "سوالات متداول", href: "#" },
  { label: "راهنمای شروع", href: "#" },
  { label: "قوانین حریم خصوصی", href: "#" },
  { label: "شرایط استفاده", href: "#" },
];

export default function Footer() {
  return (
    <footer className="if-footer">
      <div className="if-footer-word" data-if-reveal aria-hidden>
        IRONFIT
      </div>

      <div className="if-container">
        <div className="if-footer-grid">
          <div className="if-footer-about">
            <span className="if-logo">
              <span className="if-logo-mark">
                <Dumbbell size={20} strokeWidth={2.4} />
              </span>
              ایرون‌فیت
            </span>
            <p>
              پلتفرم فارسی تناسب‌اندام خانگی؛ ساخته‌شده برای زندگی واقعی، سفره
              واقعی و آدم‌های واقعی ایران.
            </p>
            <div className="if-socials" style={{ marginTop: "1.4rem" }}>
              <a href="#" aria-label="اینستاگرام" onClick={(e) => e.preventDefault()}>
                <AtSign size={17} />
              </a>
              <a href="#" aria-label="تلگرام" onClick={(e) => e.preventDefault()}>
                <Send size={17} />
              </a>
              <a href="#" aria-label="آپارات" onClick={(e) => e.preventDefault()}>
                <Clapperboard size={17} />
              </a>
            </div>
          </div>

          <div>
            <h4>دسترسی سریع</h4>
            <ul>
              {QUICK.map((q) => (
                <li key={q.id}>
                  <a
                    href={`#${q.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(`#${q.id}`);
                    }}
                  >
                    {q.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>پشتیبانی</h4>
            <ul>
              {SUPPORT.map((s) => (
                <li key={s.label}>
                  <a href={s.href} onClick={(e) => e.preventDefault()}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>تماس با ما</h4>
            <ul className="if-footer-contact">
              <li>
                <MapPin size={16} />
                تهران، خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۱۲
              </li>
              <li>
                <Phone size={16} />
                <span dir="ltr">۰۲۱ - ۲۲ ۴۴ ۰۰ ۱۱</span>
              </li>
              <li>
                <Mail size={16} />
                salam@ironfit.example
              </li>
            </ul>
          </div>
        </div>

        <div className="if-footer-bottom">
          <span>© ۱۴۰۵ ایرون‌فیت — همه حقوق برای ورزشکاران محفوظ است.</span>
          <span>طراحی و توسعه در تهران · نسخه نمایشی Mock</span>
        </div>
      </div>
    </footer>
  );
}
