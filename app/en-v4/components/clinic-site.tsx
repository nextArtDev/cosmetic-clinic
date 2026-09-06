"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { ArrowRight, Info } from "lucide-react";
import { caseExamples, treatments } from "../lib/clinic-data";
import { AmbientBackground, Hero } from "./hero";
import { NavigationDialog, ReservationRail, SiteHeader } from "./site-header";
import { CasesSection, ClinicReveal, ContactFooter, DoctorSection, FAQSection, Introduction, JournalSection, NewsStrip, ReasonsSection, Recommended, TreatmentMenu } from "./home-sections";
import { BookingDialog, CalendarDialog } from "./booking";
import { ArticleDialog, PriceDialog, PrivacyDialog, SearchDialog, TreatmentDialog } from "./content-dialogs";
import { Dialog } from "./ui";

type Overlay =
  | { kind: "search" | "price" | "privacy" | "calendar" | "navigation" }
  | { kind: "booking"; treatment?: string; date?: string }
  | { kind: "treatment" | "article" | "case"; id: string };

export default function ClinicSite() {
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const close = useCallback(() => setOverlay(null), []);
  const openBooking = useCallback((treatment?: string, date?: string) => setOverlay({ kind: "booking", treatment, date }), []);
  const openTreatment = useCallback((id: string) => setOverlay({ kind: "treatment", id }), []);
  const openArticle = useCallback((id: string) => setOverlay({ kind: "article", id }), []);
  const openPrice = useCallback(() => setOverlay({ kind: "price" }), []);
  const openCalendar = useCallback(() => setOverlay({ kind: "calendar" }), []);
  const selectedTreatment = overlay?.kind === "treatment" ? treatments.find((item) => item.id === overlay.id) : null;
  const selectedCase = overlay?.kind === "case" ? caseExamples.find((item) => item.id === overlay.id) : null;

  return <MotionConfig reducedMotion="user">
    <div className="clinic-site" id="top">
      <a href="#main-content" className="skip-link">メインコンテンツへ移動</a>
      <AmbientBackground />
      <SiteHeader onSearch={() => setOverlay({ kind: "search" })} onPrice={openPrice} onMenu={() => setOverlay({ kind: "navigation" })} />
      <ReservationRail onBook={() => openBooking()} onCalendar={openCalendar} onMenu={() => setOverlay({ kind: "navigation" })} />
      <main id="main-content">
        <Hero />
        <NewsStrip onArticle={openArticle} />
        <Introduction />
        <ClinicReveal />
        <ReasonsSection />
        <Recommended onTreatment={openTreatment} />
        <TreatmentMenu onTreatment={openTreatment} onPrice={openPrice} onBook={openBooking} />
        <DoctorSection onBook={() => openBooking()} />
        <CasesSection onCase={(id) => setOverlay({ kind: "case", id })} />
        <JournalSection onArticle={openArticle} />
        <FAQSection />
      </main>
      <ContactFooter onBook={() => openBooking()} onCalendar={openCalendar} onPrice={openPrice} onPrivacy={() => setOverlay({ kind: "privacy" })} />
      <AnimatePresence mode="wait">
        {overlay?.kind === "search" && <SearchDialog key="search" onClose={close} onTreatment={openTreatment} onArticle={openArticle} />}
        {overlay?.kind === "booking" && <BookingDialog key="booking" onClose={close} initialTreatment={overlay.treatment} initialDate={overlay.date} />}
        {overlay?.kind === "calendar" && <CalendarDialog key="calendar" onClose={close} onBook={(date) => openBooking(undefined, date)} />}
        {overlay?.kind === "price" && <PriceDialog key="price" onClose={close} onTreatment={openTreatment} />}
        {overlay?.kind === "privacy" && <PrivacyDialog key="privacy" onClose={close} />}
        {overlay?.kind === "navigation" && <NavigationDialog key="navigation" onClose={close} onPrice={openPrice} onBook={() => openBooking()} />}
        {selectedTreatment && <TreatmentDialog key={`treatment-${selectedTreatment.id}`} treatment={selectedTreatment} onClose={close} onBook={openBooking} />}
        {overlay?.kind === "article" && <ArticleDialog key={`article-${overlay.id}`} id={overlay.id} onClose={close} />}
        {selectedCase && <Dialog key={`case-${selectedCase.id}`} title={selectedCase.title} eyebrow={`${selectedCase.number} / CASE STUDY`} onClose={close} wide className="case-dialog"><img className="case-dialog-image" src={selectedCase.image} alt={`${selectedCase.title}の施術前後の症例写真`} /><p className="detail-description">{selectedCase.description}</p><div className="case-detail-price"><span>掲載症例の施術費用</span><strong>{selectedCase.price}</strong></div><div className="medical-note"><Info size={18} strokeWidth={1.3} /><div><h4>施術のリスク・副反応</h4><p>{selectedCase.risks}</p><p>施術の効果や回復には個人差があります。自由診療です。</p></div></div><p className="form-note">症例写真・説明は参考サイトの掲載情報です。最新の料金・施術内容は公式サイトまたは医師の診察時にご確認ください。</p><button className="primary-button w-full" onClick={() => openBooking(selectedCase.treatment)}>この施術について相談する<ArrowRight size={17} /></button></Dialog>}
      </AnimatePresence>
    </div>
  </MotionConfig>;
}
