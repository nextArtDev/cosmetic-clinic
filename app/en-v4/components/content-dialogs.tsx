"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Search, Clock3, Info, Check, X } from "lucide-react";
import { articles, treatments, type Treatment } from "../lib/clinic-data";
import { Dialog, TextButton } from "./ui";

export function SearchDialog({ onClose, onTreatment, onArticle }: { onClose: () => void; onTreatment: (id: string) => void; onArticle: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const results = [
    ...treatments.map((item) => ({ id: item.id, title: item.title, category: "施術メニュー", text: `${item.title} ${item.english} ${item.tags.join(" ")} ${item.description}`, image: item.image, type: "treatment" })),
    ...articles.map((item) => ({ id: item.id, title: item.title, category: "美容コラム", text: `${item.title} ${item.body}`, image: item.image, type: "article" })),
  ].filter((item) => !term || item.text.toLowerCase().includes(term));
  return <Dialog title="Find your beauty." eyebrow="サイト内検索" onClose={onClose} wide>
    <div className="search-input-wrap"><Search size={21} strokeWidth={1.3} /><input data-autofocus aria-label="検索キーワード" placeholder="気になる施術やお悩みを検索..." value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button className="icon-button" onClick={() => setQuery("")} aria-label="検索をクリア"><X size={18} /></button>}</div>
    <div className="search-suggestions"><span>人気のキーワード</span>{["二重", "シミ", "ヒアルロン酸"].map((tag) => <button key={tag} onClick={() => setQuery(tag)}>{tag}</button>)}</div>
    <p className="search-count" aria-live="polite">{term ? `「${query}」の検索結果` : "おすすめのコンテンツ"}<span>{results.length} 件</span></p>
    <div className="search-results"><AnimatePresence mode="popLayout">{results.map((item) => <motion.button layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={item.id} onClick={() => item.type === "treatment" ? onTreatment(item.id) : onArticle(item.id)}><img src={item.image} alt="" /><div><span>{item.category}</span><h3>{item.title}</h3></div><ArrowUpRight size={20} strokeWidth={1.2} /></motion.button>)}</AnimatePresence>
      {!results.length && <div className="empty-search"><Search size={32} strokeWidth={1} /><p>該当するコンテンツが見つかりませんでした。</p><span>別のキーワードでお試しください。</span><button className="quiet-button" onClick={() => setQuery("")}>すべてのコンテンツを見る<ArrowRight size={15} /></button></div>}
    </div>
  </Dialog>;
}

export function TreatmentDialog({ treatment, onClose, onBook }: { treatment: Treatment; onClose: () => void; onBook: (title: string) => void }) {
  return <Dialog title={treatment.title} eyebrow={treatment.english.toUpperCase()} onClose={onClose} wide className="treatment-dialog">
    <img className="treatment-dialog-image" src={treatment.image} alt={treatment.title} />
    <div className="tag-list">{treatment.tags.map((tag) => <span key={tag}># {tag}</span>)}</div>
    <p className="detail-description">{treatment.detail}</p>
    <div className="treatment-facts"><div><Clock3 size={18} strokeWidth={1.3} /><span>施術時間</span><strong>{treatment.duration}</strong></div><div><span>参考価格（税込）</span><strong className="serif">¥{treatment.price}<small>〜</small></strong></div></div>
    <div className="medical-note"><Info size={18} strokeWidth={1.3} /><div><h4>ダウンタイム・リスクについて</h4><p>{treatment.downtime}</p><p>{treatment.risks}</p></div></div>
    <p className="form-note">※ 自由診療です。価格は再現デモ用の参考表示であり、実際の料金・適応は公式サイトまたは診察時にご確認ください。</p>
    <button className="primary-button w-full" onClick={() => onBook(treatment.title)}>この施術について相談する<ArrowRight size={17} /></button>
  </Dialog>;
}

export function PriceDialog({ onClose, onTreatment }: { onClose: () => void; onTreatment: (id: string) => void }) {
  const [category, setCategory] = useState<"all" | "surgery" | "skin">("all");
  return <Dialog title="Price list" eyebrow="料金のご案内" onClose={onClose} wide>
    <p className="detail-description">あなたに合った施術を、明確な料金で。<br />まずはカウンセリングでご相談ください。</p>
    <div className="filter-tabs" role="tablist" aria-label="施術カテゴリ">{([{ id: "all", label: "すべて" }, { id: "surgery", label: "美容外科" }, { id: "skin", label: "美容皮膚科" }] as const).map((tab) => <button role="tab" aria-selected={category === tab.id} className={category === tab.id ? "active" : ""} key={tab.id} onClick={() => setCategory(tab.id)}>{tab.label}</button>)}</div>
    <div className="price-list">{treatments.filter((item) => category === "all" || item.category === category).map((item) => <motion.button layout key={item.id} onClick={() => onTreatment(item.id)}><div><h3>{item.title}</h3><span>{item.english}</span></div><p className="serif">¥{item.price}<small>〜</small></p><ArrowUpRight size={18} /></motion.button>)}</div>
    <div className="payment-note"><Check size={16} /><span>現金・各種クレジットカード・医療ローン</span></div><p className="form-note">表示価格は税込・自由診療のデモ用参考価格です。実際の料金はクリニック公式サイトをご確認ください。診察により施術内容・回数・費用が異なります。</p>
  </Dialog>;
}

export function ArticleDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const article = articles.find((item) => item.id === id) || articles[0];
  return <Dialog title="Beauty journal" eyebrow={`${article.date}　/　${article.category}`} onClose={onClose} wide><img className="article-hero" src={article.image} alt="" /><h3 className="article-title">{article.title}</h3><div className="article-body">{article.body.split("。").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}。</p>)}</div><div className="article-signature"><img src="/v4/images/pegasus.svg" alt="" /><span>PEGASUS CLINIC<br /><small>あなたらしい美しさを、一緒に。</small></span></div><TextButton onClick={onClose}>一覧に戻る</TextButton></Dialog>;
}

export function PrivacyDialog({ onClose }: { onClose: () => void }) {
  return <Dialog title="Privacy policy" eyebrow="プライバシーポリシー" onClose={onClose}><div className="privacy-content"><p>このサイトはPEGASUS CLINICのデザインを再現した非公式の開発デモです。実際のクリニックとは接続されていません。</p><h3>入力情報について</h3><p>予約フォームに入力された名前、メールアドレス、電話番号、ご相談内容、希望日時は、このデモのデータベースに保存されます。実際の個人情報は入力せず、テスト用の情報をご利用ください。</p><h3>情報の利用</h3><p>保存された情報は、予約機能の動作確認のみに使用します。メールの送信や実際の診療予約は行われません。</p><h3>外部リンクについて</h3><p>LINE、SNS、地図などの外部リンク先では、各サービスのプライバシーポリシーが適用されます。</p><h3>医療情報について</h3><p>掲載内容や参考価格はデモ表示です。施術の効果には個人差があり、医師による診察が必要です。最新の情報はクリニック公式サイトをご確認ください。</p></div></Dialog>;
}
