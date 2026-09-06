"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCheck, ChevronLeft, ChevronRight, Clock3, LoaderCircle } from "lucide-react";
import { bookingTreatments, localDateString } from "../lib/clinic-data";
import { Dialog, ease } from "./ui";

export function DatePicker({ selected, onSelect, compact = false }: { selected: string; onSelect: (date: string) => void; compact?: boolean }) {
  const [month, setMonth] = useState(() => {
    const date = selected ? new Date(`${selected}T12:00:00`) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const today = useMemo(() => new Date(), []);
  const max = new Date(today);
  max.setDate(max.getDate() + 90);
  const startDay = month.getDay();
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((startDay + dayCount) / 7) * 7 }, (_, i) => i - startDay + 1);
  const atStart = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const atEnd = month.getFullYear() === max.getFullYear() && month.getMonth() === max.getMonth();
  return <div className={`date-picker ${compact ? "compact" : ""}`}>
    <div className="calendar-top"><p><span className="serif">{month.getFullYear()}</span><strong>{String(month.getMonth() + 1).padStart(2, "0")}</strong><span>月</span></p><div className="flex gap-1"><button type="button" className="icon-button" aria-label="前の月" disabled={atStart} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={18} /></button><button type="button" className="icon-button" aria-label="次の月" disabled={atEnd} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={18} /></button></div></div>
    <div className="calendar-grid">{["日", "月", "火", "水", "木", "金", "土"].map((day) => <span key={day} className="calendar-weekday">{day}</span>)}
      {cells.map((day, index) => {
        if (day < 1 || day > dayCount) return <span key={`empty-${index}`} />;
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const value = localDateString(date);
        const closed = date.getDay() === 3;
        const disabled = value <= localDateString(today) || value > localDateString(max) || closed;
        return <button type="button" key={day} disabled={disabled} className={`calendar-day ${selected === value ? "selected" : ""} ${closed ? "closed" : ""}`} aria-pressed={selected === value} aria-label={`${month.getMonth() + 1}月${day}日${closed ? " 休診" : ""}`} onClick={() => onSelect(value)}>{day}{!disabled && <span className="availability-dot" />}</button>;
      })}
    </div>
    <div className="calendar-legend"><span><i className="available" />予約可能</span><span><i className="unavailable" />休診・受付終了</span></div>
  </div>;
}

export function CalendarDialog({ onClose, onBook }: { onClose: () => void; onBook: (date: string) => void }) {
  const [selected, setSelected] = useState("");
  return <Dialog title="Clinic calendar" eyebrow="診療カレンダー" onClose={onClose}>
    <div className="calendar-hours"><Clock3 size={18} strokeWidth={1.3} /><div><strong>9:00 – 18:00</strong><p>カウンセリング最終受付 16:30</p></div></div>
    <DatePicker selected={selected} onSelect={setSelected} />
    <p className="form-note">デモ用の診療スケジュールです。実際の休診日はクリニック公式サイトをご確認ください。</p>
    <button className="primary-button w-full" disabled={!selected} onClick={() => onBook(selected)}>{selected ? `${selected.replaceAll("-", "/")} の空き状況を見る` : "ご希望の日付をお選びください"}<ArrowRight size={17} /></button>
  </Dialog>;
}

type Confirmation = { reference: string; date: string; time: string; treatment: string };

export function BookingDialog({ onClose, initialTreatment, initialDate }: { onClose: () => void; initialTreatment?: string; initialDate?: string }) {
  const [step, setStep] = useState(0);
  const [treatment, setTreatment] = useState(initialTreatment || bookingTreatments[0]);
  const [date, setDate] = useState(initialDate || "");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [retry, setRetry] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    // Deferred to a microtask: resets must not run synchronously in the
    // effect body (React set-state-in-effect rule) and setState calls are
    // batched, so this is a single render either way.
    queueMicrotask(() => { setLoadingSlots(true); setSlotError(""); setTime(""); });
    fetch(`/api/appointments?date=${date}`, { signal: controller.signal }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSlots(data.slots);
    }).catch((err) => {
      if (err.name !== "AbortError") { setSlots([]); setSlotError(err.message || "空き状況を取得できませんでした。"); }
    }).finally(() => { if (!controller.signal.aborted) setLoadingSlots(false); });
    return () => controller.abort();
  }, [date, retry]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    if (step === 0) { if (date && time) setStep(1); return; }
    if (step === 1) { setStep(2); return; }
    setSubmitting(true);
    try {
      const response = await fetch("/v4/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, phone, treatment, date, time, message, consent }) });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) { setStep(0); setRetry((value) => value + 1); }
        throw new Error(data.error || "送信できませんでした。");
      }
      setConfirmation(data);
    } catch (err) { setError(err instanceof Error ? err.message : "通信に失敗しました。再度お試しください。"); }
    finally { setSubmitting(false); }
  }

  function saveCalendar() {
    if (!confirmation) return;
    const start = `${confirmation.date.replaceAll("-", "")}T${confirmation.time.replace(":", "")}00`;
    const hour = Number(confirmation.time.split(":")[0]) + 1;
    const end = `${confirmation.date.replaceAll("-", "")}T${String(hour).padStart(2, "0")}${confirmation.time.split(":")[1]}00`;
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Pegasus Demo//Appointment//JA", "BEGIN:VEVENT", `UID:${confirmation.reference}@pegasus-demo.local`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`, `DTSTART;TZID=Asia/Tokyo:${start}`, `DTEND;TZID=Asia/Tokyo:${end}`, "SUMMARY:PEGASUS CLINIC — デモ予約", "DESCRIPTION:これはデモ予約です。実際のクリニックには送信されていません。", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "pegasus-demo-appointment.ics"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <Dialog title={confirmation ? "Thank you." : "Your beauty, your way."} eyebrow={confirmation ? "ご予約リクエストを受け付けました" : "カウンセリングのご予約"} onClose={onClose} wide className="booking-dialog">
    {confirmation ? <motion.div className="booking-success" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <span className="success-mark"><CheckCheck size={30} strokeWidth={1.2} /></span>
      <h3>{name} 様、ありがとうございます。</h3>
      <p>ご予約リクエストが保存されました。<br />新しいあなたへの一歩を、私たちと。</p>
      <div className="confirmation-card"><span className="eyebrow">RESERVATION NUMBER</span><strong className="serif">{confirmation.reference}</strong><hr /><p>{confirmation.date.replaceAll("-", "/")}　{confirmation.time}</p><p>{confirmation.treatment}</p></div>
      <p className="demo-notice">これはデモ予約です。実際のクリニックには送信されず、確認メールも送信されません。</p>
      <button type="button" className="primary-button w-full" onClick={saveCalendar}><CalendarDays size={17} />カレンダーに保存</button>
      <button className="quiet-button" onClick={onClose}>サイトに戻る<ArrowRight size={16} /></button>
    </motion.div> : <>
      <div className="booking-steps">{["施術・日時", "お客様情報", "内容の確認"].map((label, index) => <div key={label} className={index <= step ? "active" : ""}><span>{index < step ? <Check size={13} /> : String(index + 1).padStart(2, "0")}</span><p>{label}</p>{index !== 2 && <i />}</div>)}</div>
      <form onSubmit={submit}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2, ease }}>
            {step === 0 && <div className="booking-step-content">
              <label className="field-label" htmlFor="booking-treatment">ご希望の施術<span>必須</span></label>
              <select id="booking-treatment" value={treatment} onChange={(event) => setTreatment(event.target.value)}>{bookingTreatments.map((item) => <option key={item}>{item}</option>)}</select>
              <div className="booking-date-layout"><div><label className="field-label">ご希望日<span>必須</span></label><DatePicker selected={date} onSelect={setDate} compact /></div><div className="time-picker"><label className="field-label">ご希望時間<span>必須</span></label>
                {!date ? <div className="time-empty"><CalendarDays size={27} strokeWidth={1} /><p>カレンダーから<br />日付をお選びください。</p></div> : loadingSlots ? <div className="time-empty" role="status"><LoaderCircle className="animate-spin" size={25} /><p>空き状況を確認中...</p></div> : slotError ? <div className="slot-error" role="alert"><p>{slotError}</p><button type="button" className="quiet-button" onClick={() => setRetry((value) => value + 1)}>再読み込み</button></div> : slots.length ? <div className="time-grid">{slots.map((slot) => <button type="button" key={slot} className={time === slot ? "selected" : ""} aria-pressed={time === slot} onClick={() => setTime(slot)}>{slot}{time === slot && <Check size={12} />}</button>)}</div> : <div className="time-empty"><Clock3 size={25} /><p>この日は受付を終了しました。<br />別の日付をお選びください。</p></div>}
              </div></div>
              <p className="demo-notice">このフォームはデモです。実際のクリニックへの予約は行われません。個人情報ではなくテスト用の情報をご入力ください。</p>
            </div>}
            {step === 1 && <div className="booking-step-content customer-fields">
              <div className="selected-summary"><CalendarDays size={17} />{date.replaceAll("-", "/")}　{time}<span>{treatment}</span></div>
              <div><label htmlFor="booking-name" className="field-label">お名前<span>必須</span></label><input id="booking-name" autoComplete="name" placeholder="山田 花子" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} /></div>
              <div className="field-grid"><div><label htmlFor="booking-email" className="field-label">メールアドレス<span>必須</span></label><input id="booking-email" type="email" autoComplete="email" placeholder="hello@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /></div><div><label htmlFor="booking-phone" className="field-label">電話番号<span>必須</span></label><input id="booking-phone" type="tel" autoComplete="tel" placeholder="090-1234-5678" value={phone} onChange={(event) => setPhone(event.target.value)} required minLength={8} maxLength={30} pattern="[+0-9\s\(\)\-]{8,30}" /></div></div>
              <div><label htmlFor="booking-message" className="field-label">ご相談内容<span className="optional">任意</span></label><textarea id="booking-message" rows={3} maxLength={2000} placeholder="気になることやご希望をお聞かせください。" value={message} onChange={(event) => setMessage(event.target.value)} /></div>
              <p className="form-note">テスト用のお名前・メールアドレスをご入力ください。</p>
            </div>}
            {step === 2 && <div className="booking-step-content">
              <p className="mb-5 text-sm">以下の内容でリクエストをお送りしてよろしいですか？</p>
              <dl className="booking-review">{[["ご希望の施術", treatment], ["ご希望日時", `${date.replaceAll("-", "/")}　${time}`], ["お名前", name], ["メールアドレス", email], ["電話番号", phone], ...(message ? [["ご相談内容", message]] : [])].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
              <label className="consent-label"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>デモ予約であり、入力情報がこのサイトのデータベースに保存されることに同意します。実際のクリニックには送信されません。</span></label>
            </div>}
          </motion.div>
        </AnimatePresence>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="booking-actions">{step > 0 && <button type="button" className="quiet-button" disabled={submitting} onClick={() => { setStep(step - 1); setError(""); }}><ArrowLeft size={15} />戻る</button>}<button type="submit" className="primary-button" disabled={(step === 0 && (!date || !time || loadingSlots)) || submitting}>{submitting ? <><LoaderCircle className="animate-spin" size={17} />送信中...</> : <>{step === 0 ? "お客様情報へ" : step === 1 ? "入力内容を確認する" : "予約をリクエストする"}<ArrowRight size={17} /></>}</button></div>
      </form>
    </>}
  </Dialog>;
}
