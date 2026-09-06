"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, CalendarDays, ChevronDown, Menu, Search } from "lucide-react";
import { Dialog, Star, Instagram, Whatsapp } from "./ui";

export const navigation = [
  { label: "دربارهٔ کلینیک", en: "First visit", href: "#about" },
  { label: "دکتر فضلی", en: "Your doctor", href: "#doctor" },
  { label: "خدمات", en: "Treatments", href: "#treatments" },
  { label: "تعرفه‌ها", en: "Price list", href: "#price" },
  { label: "مجلهٔ زیبایی", en: "Journal", href: "#journal" },
  { label: "نمونه‌کارها", en: "Cases", href: "#cases" },
];

export function SiteHeader({ onSearch, onPrice, onMenu }: { onSearch: () => void; onPrice: () => void; onMenu: () => void }) {
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 90));
  return <>
    <motion.div className="page-progress" style={{ scaleX: scrollYProgress }} />
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <a href="#top" className="brand" aria-label="کلینیک دکتر شبنم فضلی"><span className="brand-text">دکتر شبنم فضلی<small>فوق تخصص جراحی پلاستیک، زیبایی و ترمیمی</small></span></a>
      <nav className="desktop-nav" aria-label="ناوبری اصلی">{navigation.map((item, i) => <div className="nav-item" key={item.href}>
        {item.href === "#price" ? <button onClick={onPrice} className="nav-link">{item.label}</button> : <a className="nav-link" href={item.href}>{item.label}{i === 0 && <ChevronDown size={11} strokeWidth={1.4} />}</a>}
        {i === 0 && <div className="nav-dropdown"><a href="#about">دربارهٔ کلینیک<ArrowUpRight size={13} /></a><a href="#faq">سوالات متداول<ArrowUpRight size={13} /></a><a href="#access">آدرس و دسترسی<ArrowUpRight size={13} /></a></div>}
      </div>)}</nav>
      <div className="header-actions"><button className="header-search" onClick={onSearch} aria-label="جستجو در سایت"><span>جستجو...</span><Search size={15} strokeWidth={1.8} /></button><a className="header-phone" href="tel:0935121212"><span className="serif"><small>tel.</small>0935 121 212</span><span>پاسخگویی ۹ تا ۱۸</span></a><button className="mobile-menu-toggle icon-button" onClick={onMenu} aria-label="باز کردن منو"><Menu size={24} strokeWidth={1.2} /></button></div>
    </header>
  </>;
}

export function ReservationRail({ onBook, onCalendar, onMenu }: { onBook: () => void; onCalendar: () => void; onMenu: () => void }) {
  return <>
    <motion.aside className="reservation-rail" aria-label="رزرو و ارتباط" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.8 }}>
      <a className="rail-action" href="#" aria-label="ارتباط در واتس‌اپ"><Whatsapp size={26} strokeWidth={1.3} /><span>گفتگو در<br />واتس‌اپ</span><ArrowUpRight className="rail-hover-arrow" size={14} /></a>
      <button className="rail-action" onClick={onBook}><img src="/v4/images/reserve.svg" alt="" /><span>رزرو<br />آنلاین</span><ArrowUpRight className="rail-hover-arrow" size={14} /></button>
      <button className="rail-action rail-calendar" onClick={onCalendar}><img src="/v4/images/calendar.svg" alt="" /><span>روزهای<br />پذیرش</span><ArrowUpRight className="rail-hover-arrow" size={14} /></button>
      <div className="rail-socials"><a href="#" aria-label="اینستاگرام"><Instagram size={17} strokeWidth={1.5} /></a><a href="#" aria-label="واتس‌اپ"><Whatsapp size={17} strokeWidth={1.5} /></a><a href="#" aria-label="تلگرام"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m21.5 4.5-19 7.5 6 2 2 6 3.5-4.5 5 3.5 2.5-14.5Z" /></svg></a></div>
    </motion.aside>
    <nav className="mobile-bottom-nav" aria-label="منوی سریع"><a href="#"><Whatsapp size={22} strokeWidth={1.3} /><span>واتس‌اپ</span></a><button onClick={onBook}><img src="/v4/images/reserve.svg" alt="" /><span>رزرو آنلاین</span></button><button onClick={onCalendar} aria-label="تقویم پذیرش"><CalendarDays size={20} strokeWidth={1.2} /><span>روزهای پذیرش</span></button><button onClick={onMenu}><Star /><span>منو</span></button></nav>
  </>;
}

export function NavigationDialog({ onClose, onPrice, onBook }: { onClose: () => void; onPrice: () => void; onBook: () => void }) {
  return <Dialog title="کلینیک دکتر شبنم فضلی" eyebrow="منو" onClose={onClose} className="navigation-dialog"><nav aria-label="منوی سایت">{navigation.map((item, i) => <motion.div key={item.href} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
    {item.href === "#price" ? <button onClick={onPrice}><span>{item.label}<small>{item.en}</small></span><ArrowUpRight size={20} strokeWidth={1.2} /></button> : <a href={item.href} onClick={onClose}><span>{item.label}<small>{item.en}</small></span><ArrowUpRight size={20} strokeWidth={1.2} /></a>}
  </motion.div>)}<a href="#faq" onClick={onClose}><span>سوالات متداول<small>FAQ</small></span><ArrowUpRight size={20} strokeWidth={1.2} /></a></nav><button className="primary-button w-full" onClick={onBook}>رزرو مشاوره<ArrowUpRight size={17} /></button></Dialog>;
}
