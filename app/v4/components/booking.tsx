"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCheck, ChevronLeft, ChevronRight, Clock3, LoaderCircle } from "lucide-react";
import { bookingTreatments, localDateString, timeSlots, weekdays, faDigits } from "../lib/clinic-data";
import { Dialog, ease } from "./ui";

/**
 * تبدیل تاریخ میلادی انتخابی به نمایش شمسی (جلالی) برای رابط فارسی.
 * الگوریتم جلالی ساده و بدون وابستگی خارجی.
 */
function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

const jalaliMonths = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

function formatJalali(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const [jy, jm, jd] = toJalali(y, m, d);
  return faDigits(`${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`);
}

export function DatePicker({ selected, onSelect, compact = false }: { selected: string; onSelect: (date: string) => void; compact?: boolean }) {
  const [month, setMonth] = useState(() => {
    const date = selected ? new Date(`${selected}T12:00:00`) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const today = useMemo(() => new Date(), []);
  const max = new Date(today);
  max.setDate(max.getDate() + 90);
  const startDay = month.getDay(); // 0=Sun; convert to Saturday-first grid
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const gridStart = (startDay + 1) % 7;
  const cells = Array.from({ length: Math.ceil((gridStart + dayCount) / 7) * 7 }, (_, i) => i - gridStart + 1);
  const atStart = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const atEnd = month.getFullYear() === max.getFullYear() && month.getMonth() === max.getMonth();
  const [jy, jm] = toJalali(month.getFullYear(), month.getMonth() + 1, 15);
  return <div className={`date-picker ${compact ? "compact" : ""}`}>
    <div className="calendar-top"><p><span className="serif">{faDigits(jy)}</span><strong>{jalaliMonths[jm - 1]}</strong></p><div className="flex gap-1"><button type="button" className="icon-button" aria-label="ماه قبل" disabled={atStart} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronRight size={18} /></button><button type="button" className="icon-button" aria-label="ماه بعد" disabled={atEnd} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronLeft size={18} /></button></div></div>
    <div className="calendar-grid">{weekdays.map((day) => <span key={day} className="calendar-weekday">{day}</span>)}
      {cells.map((day, index) => {
        if (day < 1 || day > dayCount) return <span key={`empty-${index}`} />;
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const value = localDateString(date);
        const closed = date.getDay() === 5; // جمعه
        const disabled = value <= localDateString(today) || value > localDateString(max) || closed;
        return <button type="button" key={day} disabled={disabled} className={`calendar-day ${selected === value ? "selected" : ""} ${closed ? "closed" : ""}`} aria-pressed={selected === value} aria-label={`${faDigits(day)} ${jalaliMonths[jm - 1]}${closed ? " تعطیل" : ""}`} onClick={() => onSelect(value)}>{faDigits(day)}{!disabled && <span className="availability-dot" />}</button>;
      })}
    </div>
    <div className="calendar-legend"><span><i className="available" />قابل رزرو</span><span><i className="unavailable" />تعطیل / تکمیل</span></div>
  </div>;
}

export function CalendarDialog({ onClose, onBook }: { onClose: () => void; onBook: (date: string) => void }) {
  const [selected, setSelected] = useState("");
  return <Dialog title="تقویم پذیرش" eyebrow="روزهای کاری کلینیک" onClose={onClose}>
    <div className="calendar-hours"><Clock3 size={18} strokeWidth={1.3} /><div><strong>۹:۰۰ – ۱۸:۰۰</strong><p>آخرین زمان مشاوره ۱۷:۰۰</p></div></div>
    <DatePicker selected={selected} onSelect={setSelected} />
    <p className="form-note">این تقویم نمونهٔ نمایشی است؛ روزهای تعطیل واقعی را از کلینیک استعلام کنید.</p>
    <button className="primary-button w-full" disabled={!selected} onClick={() => onBook(selected)}>{selected ? `مشاهدهٔ ظرفیت ${formatJalali(selected)}` : "لطفاً تاریخ را انتخاب کنید"}<ArrowLeft size={17} /></button>
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
    fetch(`/v4/api/appointments?date=${date}`, { signal: controller.signal }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSlots(data.slots);
    }).catch((err) => {
      if (err.name !== "AbortError") { setSlots([]); setSlotError(err.message || "دریافت ظرفیت ممکن نشد."); }
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
        throw new Error(data.error || "ارسال انجام نشد.");
      }
      setConfirmation(data);
    } catch (err) { setError(err instanceof Error ? err.message : "ارتباط برقرار نشد؛ دوباره تلاش کنید."); }
    finally { setSubmitting(false); }
  }

  function saveCalendar() {
    if (!confirmation) return;
    const start = `${confirmation.date.replaceAll("-", "")}T${confirmation.time.replace(":", "")}00`;
    const hour = Number(confirmation.time.split(":")[0]) + 1;
    const end = `${confirmation.date.replaceAll("-", "")}T${String(hour).padStart(2, "0")}${confirmation.time.split(":")[1]}00`;
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Fazli Demo//Appointment//FA", "BEGIN:VEVENT", `UID:${confirmation.reference}@fazli-demo.local`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`, `DTSTART;TZID=Asia/Tehran:${start}`, `DTEND;TZID=Asia/Tehran:${end}`, "SUMMARY:کلینیک دکتر شبنم فضلی — رزرو نمونه", "DESCRIPTION:این یک رزرو نمایشی است و به کلینیک واقعی ارسال نمی‌شود.", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "fazli-demo-appointment.ics"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <Dialog title={confirmation ? "سپاسگزاریم." : "زیبایی‌ات، انتخابِ تو."} eyebrow={confirmation ? "درخواست رزرو ثبت شد" : "رزرو مشاوره"} onClose={onClose} wide className="booking-dialog">
    {confirmation ? <motion.div className="booking-success" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <span className="success-mark"><CheckCheck size={30} strokeWidth={1.2} /></span>
      <h3>{name} عزیز، سپاسگزاریم.</h3>
      <p>درخواست رزرو شما ثبت شد.<br />به سمت نسخهٔ تازه‌ای از خودتان، همراهِ ما.</p>
      <div className="confirmation-card"><span className="eyebrow">شمارهٔ پیگیری</span><strong className="serif">{faDigits(confirmation.reference)}</strong><hr /><p>{formatJalali(confirmation.date)}　ساعت {faDigits(confirmation.time)}</p><p>{confirmation.treatment}</p></div>
      <p className="demo-notice">این یک رزرو نمایشی است؛ به کلینیک واقعی ارسال نمی‌شود و پیامک تأیید فرستاده نمی‌شود.</p>
      <button type="button" className="primary-button w-full" onClick={saveCalendar}><CalendarDays size={17} />افزودن به تقویم</button>
      <button className="quiet-button" onClick={onClose}>بازگشت به سایت<ArrowLeft size={16} /></button>
    </motion.div> : <>
      <div className="booking-steps">{["خدمت و زمان", "اطلاعات شما", "بازبینی نهایی"].map((label, index) => <div key={label} className={index <= step ? "active" : ""}><span>{index < step ? <Check size={13} /> : faDigits(index + 1)}</span><p>{label}</p>{index !== 2 && <i />}</div>)}</div>
      <form onSubmit={submit}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2, ease }}>
            {step === 0 && <div className="booking-step-content">
              <label className="field-label" htmlFor="booking-treatment">خدمت موردنظر<span>الزامی</span></label>
              <select id="booking-treatment" value={treatment} onChange={(event) => setTreatment(event.target.value)}>{bookingTreatments.map((item) => <option key={item}>{item}</option>)}</select>
              <div className="booking-date-layout"><div><label className="field-label">تاریخ<span>الزامی</span></label><DatePicker selected={date} onSelect={setDate} compact /></div><div className="time-picker"><label className="field-label">ساعت<span>الزامی</span></label>
                {!date ? <div className="time-empty"><CalendarDays size={27} strokeWidth={1} /><p>از تقویم،<br />تاریخ را انتخاب کنید.</p></div> : loadingSlots ? <div className="time-empty" role="status"><LoaderCircle className="animate-spin" size={25} /><p>بررسی ظرفیت...</p></div> : slotError ? <div className="slot-error" role="alert"><p>{slotError}</p><button type="button" className="quiet-button" onClick={() => setRetry((value) => value + 1)}>تلاش دوباره</button></div> : slots.length ? <div className="time-grid">{slots.map((slot) => <button type="button" key={slot} className={time === slot ? "selected" : ""} aria-pressed={time === slot} onClick={() => setTime(slot)}>{slot}{time === slot && <Check size={12} />}</button>)}</div> : <div className="time-empty"><Clock3 size={25} /><p>پذیرش این روز تکمیل شده است.<br />تاریخ دیگری انتخاب کنید.</p></div>}
              </div></div>
              <p className="demo-notice">این فرم نمایشی است و رزرو واقعی در کلینیک ثبت نمی‌کند؛ لطفاً از اطلاعات آزمایشی استفاده کنید.</p>
            </div>}
            {step === 1 && <div className="booking-step-content customer-fields">
              <div className="selected-summary"><CalendarDays size={17} />{formatJalali(date)}　ساعت {faDigits(time)}<span>{treatment}</span></div>
              <div><label htmlFor="booking-name" className="field-label">نام و نام خانوادگی<span>الزامی</span></label><input id="booking-name" autoComplete="name" placeholder="مثلاً سارا محمدی" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} /></div>
              <div className="field-grid"><div><label htmlFor="booking-email" className="field-label">ایمیل<span>الزامی</span></label><input id="booking-email" type="email" autoComplete="email" placeholder="hello@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /></div><div><label htmlFor="booking-phone" className="field-label">شمارهٔ تماس<span>الزامی</span></label><input id="booking-phone" type="tel" autoComplete="tel" placeholder="0912 000 0000" value={phone} onChange={(event) => setPhone(event.target.value)} required minLength={8} maxLength={30} pattern="[+0-9\s\(\)\-]{8,30}" /></div></div>
              <div><label htmlFor="booking-message" className="field-label">توضیحات<span className="optional">اختیاری</span></label><textarea id="booking-message" rows={3} maxLength={2000} placeholder="سؤال یا خواستهٔ خود را بنویسید." value={message} onChange={(event) => setMessage(event.target.value)} /></div>
              <p className="form-note">لطفاً از نام و ایمیل آزمایشی استفاده کنید.</p>
            </div>}
            {step === 2 && <div className="booking-step-content">
              <p className="mb-5 text-sm">با این مشخصات درخواست ارسال شود؟</p>
              <dl className="booking-review">{[["خدمت موردنظر", treatment], ["زمان", `${formatJalali(date)}　ساعت ${faDigits(time)}`], ["نام", name], ["ایمیل", email], ["شمارهٔ تماس", phone], ...(message ? [["توضیحات", message]] : [])].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
              <label className="consent-label"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>می‌دانم این فرم نمایشی است و اطلاعات واردشده در همین نمونه ذخیره می‌شود؛ به کلینیک واقعی ارسال نمی‌گردد.</span></label>
            </div>}
          </motion.div>
        </AnimatePresence>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="booking-actions">{step > 0 && <button type="button" className="quiet-button" disabled={submitting} onClick={() => { setStep(step - 1); setError(""); }}><ArrowRight size={15} />مرحلهٔ قبل</button>}<button type="submit" className="primary-button" disabled={(step === 0 && (!date || !time || loadingSlots)) || submitting}>{submitting ? <><LoaderCircle className="animate-spin" size={17} />در حال ارسال...</> : <>{step === 0 ? "اطلاعات شما" : step === 1 ? "بازبینی نهایی" : "ثبت درخواست رزرو"}<ArrowLeft size={17} /></>}</button></div>
      </form>
    </>}
  </Dialog>;
}
