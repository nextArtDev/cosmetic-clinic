"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Search, Clock3, Info, Check, X } from "lucide-react";
import { articles, treatments, type Treatment } from "../lib/clinic-data";
import { Dialog, Star, TextButton } from "./ui";

export function SearchDialog({ onClose, onTreatment, onArticle }: { onClose: () => void; onTreatment: (id: string) => void; onArticle: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const results = [
    ...treatments.map((item) => ({ id: item.id, title: item.title, category: "خدمات", text: `${item.title} ${item.english} ${item.tags.join(" ")} ${item.description}`, image: item.image, type: "treatment" })),
    ...articles.map((item) => ({ id: item.id, title: item.title, category: "مجلهٔ زیبایی", text: `${item.title} ${item.body}`, image: item.image, type: "article" })),
  ].filter((item) => !term || item.text.toLowerCase().includes(term));
  return <Dialog title="زیبایی‌ات را پیدا کن." eyebrow="جستجو در سایت" onClose={onClose} wide>
    <div className="search-input-wrap"><Search size={21} strokeWidth={1.3} /><input data-autofocus aria-label="کلیدواژهٔ جستجو" placeholder="خدمت یا دغدغهٔ خود را جستجو کنید..." value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button className="icon-button" onClick={() => setQuery("")} aria-label="پاک کردن جستجو"><X size={18} /></button>}</div>
    <div className="search-suggestions"><span>جستجوهای پرطرفدار</span>{["بینی", "لیپوساکشن", "تزریق ژل"].map((tag) => <button key={tag} onClick={() => setQuery(tag)}>{tag}</button>)}</div>
    <p className="search-count" aria-live="polite">{term ? `نتیجهٔ جستجو برای «${query}»` : "پیشنهاد ما"}<span>{results.length} مورد</span></p>
    <div className="search-results"><AnimatePresence mode="popLayout">{results.map((item) => <motion.button layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={item.id} onClick={() => item.type === "treatment" ? onTreatment(item.id) : onArticle(item.id)}><img src={item.image} alt="" /><div><span>{item.category}</span><h3>{item.title}</h3></div><ArrowUpRight size={20} strokeWidth={1.2} /></motion.button>)}</AnimatePresence>
      {!results.length && <div className="empty-search"><Search size={32} strokeWidth={1} /><p>موردی مطابق جستجوی شما پیدا نشد.</p><span>با کلیدواژهٔ دیگری امتحان کنید.</span><button className="quiet-button" onClick={() => setQuery("")}>مشاهدهٔ همهٔ محتوا<ArrowLeft size={15} /></button></div>}
    </div>
  </Dialog>;
}

export function TreatmentDialog({ treatment, onClose, onBook }: { treatment: Treatment; onClose: () => void; onBook: (title: string) => void }) {
  return <Dialog title={treatment.title} eyebrow={treatment.english.toUpperCase()} onClose={onClose} wide className="treatment-dialog">
    <img className="treatment-dialog-image" src={treatment.image} alt={treatment.title} />
    <div className="tag-list">{treatment.tags.map((tag) => <span key={tag}># {tag}</span>)}</div>
    <p className="detail-description">{treatment.detail}</p>
    <div className="treatment-facts"><div><Clock3 size={18} strokeWidth={1.3} /><span>مدت خدمت</span><strong>{treatment.duration}</strong></div><div><span>تعرفهٔ تقریبی</span><strong className="serif">{treatment.price}</strong></div></div>
    <div className="medical-note"><Info size={18} strokeWidth={1.3} /><div><h4>دورهٔ بهبودی و ریسک‌ها</h4><p>{treatment.downtime}</p><p>{treatment.risks}</p></div></div>
    <p className="form-note">※ ارزیابی دقیق فقط پس از معاینهٔ پزشک ممکن است؛ تعرفهٔ نهایی در جلسهٔ مشاوره اعلام می‌شود.</p>
    <button className="primary-button w-full" onClick={() => onBook(treatment.title)}>مشورت دربارهٔ این خدمت<ArrowLeft size={17} /></button>
  </Dialog>;
}

export function PriceDialog({ onClose, onTreatment }: { onClose: () => void; onTreatment: (id: string) => void }) {
  const [category, setCategory] = useState<"all" | "surgery" | "skin">("all");
  return <Dialog title="تعرفهٔ خدمات" eyebrow="راهنمای هزینه‌ها" onClose={onClose} wide>
    <p className="detail-description">خدمتی متناسب با شما، با تعرفه‌ای شفاف.<br />پیشنهاد ما: نخست یک جلسهٔ مشاوره.</p>
    <div className="filter-tabs" role="tablist" aria-label="دسته‌بندی خدمات">{([{ id: "all", label: "همه" }, { id: "surgery", label: "جراحی" }, { id: "skin", label: "تزریقی و پوست" }] as const).map((tab) => <button role="tab" aria-selected={category === tab.id} className={category === tab.id ? "active" : ""} key={tab.id} onClick={() => setCategory(tab.id)}>{tab.label}</button>)}</div>
    <div className="price-list">{treatments.filter((item) => category === "all" || item.category === category).map((item) => <motion.button layout key={item.id} onClick={() => onTreatment(item.id)}><div><h3>{item.title}</h3><span>{item.english}</span></div><p className="serif">{item.price}</p><ArrowUpRight size={18} /></motion.button>)}</div>
    <div className="payment-note"><Check size={16} /><span>پرداخت حضوری و آنلاین</span></div><p className="form-note">تعرفه‌های نمایش‌داده‌شده تقریبی و مربوط به این نمونهٔ طراحی است. هزینهٔ نهایی پس از معاینه و بر اساس طرح درمان اعلام می‌شود.</p>
  </Dialog>;
}

export function ArticleDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const article = articles.find((item) => item.id === id) || articles[0];
  return <Dialog title="مجلهٔ زیبایی" eyebrow={`${article.date}　/　${article.category}`} onClose={onClose} wide><img className="article-hero" src={article.image} alt="" /><h3 className="article-title">{article.title}</h3><div className="article-body">{article.body.split("۔").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}.</p>)}</div><div className="article-signature"><Star /><span>کلینیک دکتر شبنم فضلی<br /><small>زیبایی، همراهِ شما</small></span></div><TextButton onClick={onClose}>بازگشت به فهرست</TextButton></Dialog>;
}

export function PrivacyDialog({ onClose }: { onClose: () => void }) {
  return <Dialog title="حریم خصوصی" eyebrow="سیاست حفظ اطلاعات" onClose={onClose}><div className="privacy-content"><p>این صفحه یک نمونهٔ طراحی آزمایشی برای کلینیک دکتر شبنم فضلی است و به سامانهٔ واقعی کلینیک متصل نیست.</p><h3>دربارهٔ اطلاعات ورودی</h3><p>نام، ایمیل، شماره تماس، توضیحات و زمان انتخابی فرم رزرو، فقط در همین نمونهٔ نمایشی ذخیره می‌شود. لطفاً اطلاعات واقعی وارد نکنید.</p><h3>نحوهٔ استفاده</h3><p>اطلاعات ذخیره‌شده تنها برای بررسی عملکرد فرم رزرو به‌کار می‌رود؛ هیچ پیامی ارسال و هیچ نوبت واقعی ثبت نمی‌شود.</p><h3>لینک‌های خارجی</h3><p>برای پیوندهای بیرونی مثل نقشه و شبکه‌های اجتماعی، سیاست حریم خصوصی همان سرویس‌ها معتبر است.</p><h3>اطلاعات پزشکی</h3><p>محتوای سایت و تعرفه‌ها نمایشی است و توصیهٔ پزشکی محسوب نمی‌شود. نتیجهٔ هر خدمت در افراد مختلف متفاوت است و معاینهٔ پزشک لازم است.</p></div></Dialog>;
}
