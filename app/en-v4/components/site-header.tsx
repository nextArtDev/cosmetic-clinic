"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, CalendarDays, ChevronDown, Menu, Search } from "lucide-react";
import { Dialog, Star, Instagram, Youtube } from "./ui";

export const navigation = [
  { label: "初めての方へ", en: "First visit", href: "#about" },
  { label: "ドクター紹介", en: "Our doctor", href: "#doctor" },
  { label: "施術メニュー", en: "Treatment menu", href: "#treatments" },
  { label: "料金案内", en: "Price list", href: "#price" },
  { label: "美容コラム", en: "Beauty journal", href: "#journal" },
  { label: "症例写真", en: "Case photos", href: "#cases" },
];

export function SiteHeader({ onSearch, onPrice, onMenu }: { onSearch: () => void; onPrice: () => void; onMenu: () => void }) {
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 90));
  return <>
    <motion.div className="page-progress" style={{ scaleX: scrollYProgress }} />
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <a href="#top" className="brand" aria-label="PEGASUS CLINIC ホーム"><img src="/v4/images/logo.svg" alt="PEGASUS CLINIC" width={210} height={39} /></a>
      <nav className="desktop-nav" aria-label="メインナビゲーション">{navigation.map((item, i) => <div className="nav-item" key={item.href}>
        {item.href === "#price" ? <button onClick={onPrice} className="nav-link">{item.label}</button> : <a className="nav-link" href={item.href}>{item.label}{i === 0 && <ChevronDown size={11} strokeWidth={1.4} />}</a>}
        {i === 0 && <div className="nav-dropdown"><a href="#about">クリニックについて<ArrowUpRight size={13} /></a><a href="#faq">よくあるご質問<ArrowUpRight size={13} /></a><a href="#access">アクセス<ArrowUpRight size={13} /></a></div>}
      </div>)}</nav>
      <div className="header-actions"><button className="header-search" onClick={onSearch} aria-label="サイト内検索"><span>search...</span><Search size={15} strokeWidth={1.8} /></button><a className="header-phone" href="tel:0534158081"><span className="serif"><small>tel.</small>053-415-8081</span><span>受付時間 9:00〜18:00</span></a><button className="mobile-menu-toggle icon-button" onClick={onMenu} aria-label="メニューを開く"><Menu size={24} strokeWidth={1.2} /></button></div>
    </header>
  </>;
}

export function ReservationRail({ onBook, onCalendar, onMenu }: { onBook: () => void; onCalendar: () => void; onMenu: () => void }) {
  return <>
    <motion.aside className="reservation-rail" aria-label="ご予約・お問い合わせ" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.8 }}>
      <a className="rail-action" href="https://lin.ee/zw4msSt" target="_blank" rel="noopener noreferrer"><img src="/v4/images/line.svg" alt="" /><span>LINEで<br />ご予約</span><ArrowUpRight className="rail-hover-arrow" size={14} /></a>
      <button className="rail-action" onClick={onBook}><img src="/v4/images/reserve.svg" alt="" /><span>WEBで<br />ご予約</span><ArrowUpRight className="rail-hover-arrow" size={14} /></button>
      <button className="rail-action rail-calendar" onClick={onCalendar}><img src="/v4/images/calendar.svg" alt="" /><span>診療日時</span><ArrowUpRight className="rail-hover-arrow" size={14} /></button>
      <div className="rail-socials"><a href="https://www.instagram.com/sohma_inoue.pegasus/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={17} strokeWidth={1.5} /></a><a href="https://www.youtube.com/@Dr.%E4%BA%95%E4%B8%8A%E7%A4%8E%E9%A6%AC%E3%81%AE%E7%BE%8E%E5%AE%B9%E5%A1%BE%E3%83%81%E3%83%A3%E3%83%B3" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={17} strokeWidth={1.5} /></a><a href="https://www.tiktok.com/@pegasus_s.inoue" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><img src="/v4/images/tiktok.svg" alt="" /></a></div>
    </motion.aside>
    <nav className="mobile-bottom-nav" aria-label="クイックメニュー"><a href="https://lin.ee/zw4msSt" target="_blank" rel="noopener noreferrer"><img src="/v4/images/line.svg" alt="" /><span>LINEでご予約</span></a><button onClick={onBook}><img src="/v4/images/reserve.svg" alt="" /><span>WEBでご予約</span></button><button onClick={onCalendar} aria-label="診療カレンダー"><CalendarDays size={20} strokeWidth={1.2} /><span>診療日時</span></button><button onClick={onMenu}><Star /><span>MENU</span></button></nav>
  </>;
}

export function NavigationDialog({ onClose, onPrice, onBook }: { onClose: () => void; onPrice: () => void; onBook: () => void }) {
  return <Dialog title="Explore Pegasus." eyebrow="MENU" onClose={onClose} className="navigation-dialog"><nav aria-label="サイトメニュー">{navigation.map((item, i) => <motion.div key={item.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
    {item.href === "#price" ? <button onClick={onPrice}><span>{item.label}<small>{item.en}</small></span><ArrowUpRight size={20} strokeWidth={1.2} /></button> : <a href={item.href} onClick={onClose}><span>{item.label}<small>{item.en}</small></span><ArrowUpRight size={20} strokeWidth={1.2} /></a>}
  </motion.div>)}<a href="#faq" onClick={onClose}><span>よくあるご質問<small>FAQ</small></span><ArrowUpRight size={20} strokeWidth={1.2} /></a></nav><button className="primary-button w-full" onClick={onBook}>カウンセリングのご予約<ArrowUpRight size={17} /></button></Dialog>;
}
