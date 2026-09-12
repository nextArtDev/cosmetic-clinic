"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Dumbbell,
  Flame,
  HeartPulse,
  Sparkles,
  X,
} from "lucide-react";
import { scrollToSection } from "../lib/anim";
import { toFaDigits } from "../lib/fa";

/* ------------------------------------------------------------------ *
 * The original site's signature UX: a multi-step "introductory" quiz
 * (gender → age → height/weight → BMI → body shape → experience →
 * frequency → signup) rendered as chained Bootstrap modals.
 *
 * This is the same flow rebuilt as one animated modal with a progress
 * bar, Persian body-type vocabulary and an instant plan recommendation.
 * ------------------------------------------------------------------ */

type Gender = "female" | "male";

const STEPS = [
  "gender",
  "age",
  "body",
  "bmi",
  "shape",
  "level",
  "goal",
  "days",
  "contact",
  "done",
] as const;

type StepId = (typeof STEPS)[number];

const SHAPES: Record<Gender, { id: string; label: string; hint: string }[]> = {
  female: [
    { id: "hourglass", label: "ساعت‌شنی", hint: "شانه و باسن متعادل، کمر باریک" },
    { id: "pear", label: "گلابی", hint: "باسن پهن‌تر از شانه‌ها" },
    { id: "apple", label: "سیبی", hint: "تمرکز وزن روی شکم" },
    { id: "rectangle", label: "مستطیلی", hint: "شانه، کمر و باسن هم‌عرض" },
    { id: "diamond", label: "الماسی", hint: "میان‌تنه پُرتر از دیگر نقاط" },
  ],
  male: [
    { id: "hourglass", label: "ساعت‌شنی", hint: "تعادل شانه و باسن" },
    { id: "triangle", label: "مثلثی", hint: "باسن پهن‌تر از شانه‌ها" },
    { id: "inverted", label: "وارونه", hint: "شانه پهن، کمر باریک" },
    { id: "rectangle", label: "مستطیلی", hint: "بدن یکنواخت و کشیده" },
    { id: "oval", label: "بیضی", hint: "تمرکز وزن روی میان‌تنه" },
  ],
};

const LEVELS = [
  { id: "new", label: "تازه شروع می‌کنم", hint: "بدون سابقه تمرین منظم" },
  { id: "some", label: "چند ماه تجربه دارم", hint: "با حرکات پایه آشنام" },
  { id: "pro", label: "مستمر و حرفه‌ای", hint: "هفته‌ای چند جلسه تمرین می‌کنم" },
];

const GOALS = [
  { id: "fat", label: "کاهش وزن", hint: "چربی‌سوزی و سبک‌تر شدن", icon: Flame },
  { id: "muscle", label: "عضله‌سازی", hint: "حجم و قدرت", icon: Dumbbell },
  { id: "shape", label: "تناسب و فرم", hint: "فرم‌دهی و تعادل بدنی", icon: Sparkles },
  { id: "health", label: "سلامت و انرژی", hint: "انرژی روزانه و سلامت قلب", icon: HeartPulse },
];

const DAYS = [2, 3, 4, 5] as const;

interface QuizState {
  gender: Gender | null;
  age: number;
  height: number;
  weight: number;
  shape: string | null;
  level: string | null;
  goal: string | null;
  days: number | null;
  name: string;
  phone: string;
}

const INITIAL: QuizState = {
  gender: null,
  age: 32,
  height: 175,
  weight: 82,
  shape: null,
  level: null,
  goal: null,
  days: null,
  name: "",
  phone: "",
};

function bmiOf(h: number, w: number) {
  const m = h / 100;
  if (m <= 0) return 0;
  return w / (m * m);
}

function bmiBand(bmi: number) {
  if (bmi < 18.5) return { label: "کمبود وزن", note: "روی افزایش وزن سالم و عضله‌سازی تمرکز می‌کنیم." };
  if (bmi < 25) return { label: "وزن نرمال", note: "بدنه خوبه؛ می‌رویم سراغ فرم‌دهی و قدرت." };
  if (bmi < 30) return { label: "اضافه وزن", note: "با ترکیب تمرین قدرتی و هوازی پیش می‌رویم." };
  return { label: "چاقی", note: "شروع نرم، محافظت از مفاصل و چربی‌سوزی تدریجی." };
}

export default function QuizModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<QuizState>(INITIAL);
  const [phoneErr, setPhoneErr] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const stepId: StepId = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const bmi = useMemo(() => bmiOf(form.height, form.weight), [form.height, form.weight]);
  const band = useMemo(() => bmiBand(bmi), [bmi]);

  const set = useCallback(<K extends keyof QuizState>(key: K, value: QuizState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  /* lock scroll + Esc + initial focus while open.
     (Quiz state is reset by remounting the dialog — see the `key` in
     Landing — so no state is written inside this effect.) */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    const t = window.setTimeout(() => dialogRef.current?.focus(), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  const next = useCallback(() => {
    if (stepId === "contact") {
      const digits = form.phone.replace(/\D/g, "");
      if (digits.length < 10) {
        setPhoneErr("شماره موبایل را کامل وارد کن (مثلاً ۰۹۱۲۳۴۵۶۷۸۹).");
        return;
      }
      setPhoneErr("");
    }
    setDir(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, [stepId, form.phone]);

  const back = useCallback(() => {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const canNext = useMemo(() => {
    switch (stepId) {
      case "gender":
        return form.gender !== null;
      case "shape":
        return form.shape !== null;
      case "level":
        return form.level !== null;
      case "goal":
        return form.goal !== null;
      case "days":
        return form.days !== null;
      case "contact":
        return form.name.trim().length > 1;
      default:
        return true;
    }
  }, [stepId, form]);

  const shapes = form.gender ? SHAPES[form.gender] : SHAPES.female;

  const recommendation = useMemo(() => {
    if (form.goal === "muscle" || form.days === 5) return { name: "پلن قهرمان", why: "برای حجم و پیگیری اختصاصی مربی" };
    if (form.goal === "health") return { name: "پلن پایه", why: "شروع سبک، بدون فشار و کاملاً خانگی" };
    return { name: "پلن حرفه‌ای", why: "تعادل تمرین، تغذیه و پشتیبانی مربی" };
  }, [form.goal, form.days]);

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 46 : -46 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -46 : 46 }),
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="if-quiz-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            className="if-quiz"
            initial={{ scale: 0.92, y: 34, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 22, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="برنامه‌ساز هوشمند ایرون‌فیت"
          >
            <div className="if-quiz-top">
              <div className="if-quiz-brand">
                <span className="if-quiz-brand-mark">
                  <Dumbbell size={16} strokeWidth={2.6} />
                </span>
                برنامه‌ساز هوشمند
              </div>
              <button type="button" className="if-quiz-close" onClick={onClose} aria-label="بستن">
                <X size={18} />
              </button>
            </div>

            <div className="if-quiz-progress" aria-hidden>
              <span style={{ width: `${progress}%` }} />
            </div>
            <p className="if-quiz-stepno">
              گام {toFaDigits(step + 1)} از {toFaDigits(STEPS.length)}
            </p>

            <div className="if-quiz-body">
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.div
                  key={stepId}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                >
                  {stepId === "gender" && (
                    <fieldset className="if-quiz-field">
                      <legend className="if-quiz-q">برای کدام برنامه آماده می‌شوی؟</legend>
                      <p className="if-quiz-hint">برنامه، ویدیوها و نریشن هر مسیر جداگانه طراحی شده است.</p>
                      <div className="if-quiz-choices if-quiz-choices--2">
                        {(
                          [
                            { id: "female", label: "برنامه بانوان", hint: "فرم‌دهی و قدرت با مربی بانوان" },
                            { id: "male", label: "برنامه آقایان", hint: "حجم، قدرت و استقامت" },
                          ] as const
                        ).map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            className={`if-quiz-choice ${form.gender === o.id ? "is-on" : ""}`}
                            onClick={() => set("gender", o.id)}
                          >
                            <b>{o.label}</b>
                            <span>{o.hint}</span>
                            <i className="if-quiz-tick">
                              <Check size={13} strokeWidth={3} />
                            </i>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {stepId === "age" && (
                    <fieldset className="if-quiz-field">
                      <legend className="if-quiz-q">چند سالت است؟</legend>
                      <p className="if-quiz-hint">شدت و ریکاوری برنامه را با سنت تنظیم می‌کنیم.</p>
                      <div className="if-quiz-range">
                        <b>{toFaDigits(form.age)}</b>
                        <span>سال</span>
                        <input
                          type="range"
                          min={14}
                          max={80}
                          value={form.age}
                          onChange={(e) => set("age", Number(e.target.value))}
                          aria-label="سن"
                        />
                      </div>
                    </fieldset>
                  )}

                  {stepId === "body" && (
                    <fieldset className="if-quiz-field">
                      <legend className="if-quiz-q">قد و وزنت را بگو</legend>
                      <p className="if-quiz-hint">برای محاسبه شاخص توده بدنی و انتخاب شدت تمرین.</p>
                      <div className="if-quiz-range">
                        <b>{toFaDigits(form.height)}</b>
                        <span>سانتی‌متر</span>
                        <input
                          type="range"
                          min={130}
                          max={210}
                          value={form.height}
                          onChange={(e) => set("height", Number(e.target.value))}
                          aria-label="قد"
                        />
                      </div>
                      <div className="if-quiz-range">
                        <b>{toFaDigits(form.weight)}</b>
                        <span>کیلوگرم</span>
                        <input
                          type="range"
                          min={40}
                          max={160}
                          value={form.weight}
                          onChange={(e) => set("weight", Number(e.target.value))}
                          aria-label="وزن"
                        />
                      </div>
                    </fieldset>
                  )}

                  {stepId === "bmi" && (
                    <fieldset className="if-quiz-field">
                      <legend className="if-quiz-q">شاخص توده بدنی تو</legend>
                      <div className="if-quiz-bmi">
                        <b>{toFaDigits(bmi.toFixed(1))}</b>
                        <span className="if-quiz-bmi-band">{band.label}</span>
                        <p>{band.note}</p>
                      </div>
                    </fieldset>
                  )}

                  {stepId === "shape" && (
                    <fieldset className="if-quiz-field">
                      <legend className="if-quiz-q">فرم بدن‌ت به کدام نزدیک‌تر است؟</legend>
                      <p className="if-quiz-hint">بر اساس فرم بدنی، تمرین‌ها روی نقاط مؤثر متمرکز می‌شوند.</p>
                      <div className="if-quiz-choices">
                        {shapes.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            className={`if-quiz-choice ${form.shape === s.id ? "is-on" : ""}`}
                            onClick={() => set("shape", s.id)}
                          >
                            <b>{s.label}</b>
                            <span>{s.hint}</span>
                            <i className="if-quiz-tick">
                              <Check size={13} strokeWidth={3} />
                            </i>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {stepId === "level" && (
                    <fieldset className="if-quiz-field">
                      <legend className="if-quiz-q">سابقه تمرینت چطور است؟</legend>
                      <div className="if-quiz-choices">
                        {LEVELS.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            className={`if-quiz-choice ${form.level === l.id ? "is-on" : ""}`}
                            onClick={() => set("level", l.id)}
                          >
                            <b>{l.label}</b>
                            <span>{l.hint}</span>
                            <i className="if-quiz-tick">
                              <Check size={13} strokeWidth={3} />
                            </i>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {stepId === "goal" && (
                    <fieldset className="if-quiz-field">
                      <legend className="if-quiz-q">مهم‌ترین هدفت چیست؟</legend>
                      <div className="if-quiz-choices">
                        {GOALS.map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            className={`if-quiz-choice ${form.goal === g.id ? "is-on" : ""}`}
                            onClick={() => set("goal", g.id)}
                          >
                            <g.icon size={18} className="if-quiz-choice-ic" />
                            <b>{g.label}</b>
                            <span>{g.hint}</span>
                            <i className="if-quiz-tick">
                              <Check size={13} strokeWidth={3} />
                            </i>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {stepId === "days" && (
                    <fieldset className="if-quiz-field">
                      <legend className="if-quiz-q">هفته‌ای چند روز می‌توانی تمرین کنی؟</legend>
                      <div className="if-quiz-choices if-quiz-choices--4">
                        {DAYS.map((d) => (
                          <button
                            key={d}
                            type="button"
                            className={`if-quiz-choice if-quiz-choice--num ${form.days === d ? "is-on" : ""}`}
                            onClick={() => set("days", d)}
                          >
                            <b>{toFaDigits(d)}</b>
                            <span>روز در هفته</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {stepId === "contact" && (
                    <fieldset className="if-quiz-field">
                      <legend className="if-quiz-q">برنامه‌ات آماده است — کجا بفرستیم؟</legend>
                      <p className="if-quiz-hint">فقط برای ارسال برنامه و پیگیری مربی. هیچ پیام تبلیغاتی نمی‌فرستیم.</p>
                      <div className="if-quiz-inputs">
                        <label className="if-quiz-input">
                          <span>نام و نام خانوادگی</span>
                          <input
                            type="text"
                            value={form.name}
                            placeholder="مثلاً سارا محمدی"
                            onChange={(e) => set("name", e.target.value)}
                          />
                        </label>
                        <label className="if-quiz-input">
                          <span>شماره موبایل</span>
                          <input
                            type="tel"
                            inputMode="tel"
                            dir="ltr"
                            value={form.phone}
                            placeholder="0912 345 6789"
                            onChange={(e) => {
                              setPhoneErr("");
                              set("phone", e.target.value);
                            }}
                          />
                        </label>
                      </div>
                      {phoneErr && <p className="if-quiz-err">{phoneErr}</p>}
                    </fieldset>
                  )}

                  {stepId === "done" && (
                    <div className="if-quiz-field">
                      <div className="if-quiz-done">
                        <span className="if-quiz-done-badge">
                          <BadgeCheck size={26} />
                        </span>
                        <p className="if-quiz-q">
                          {form.name ? `${form.name} عزیز، ` : ""}برنامه‌ات آماده شد
                        </p>
                        <div className="if-quiz-summary">
                          <span>{form.gender === "male" ? "برنامه آقایان" : "برنامه بانوان"}</span>
                          <span>{toFaDigits(form.age)} سال</span>
                          <span>
                            {toFaDigits(form.height)} سانتی‌متر · {toFaDigits(form.weight)} کیلوگرم
                          </span>
                          <span>BMI {toFaDigits(bmi.toFixed(1))} — {band.label}</span>
                          <span>{shapes.find((s) => s.id === form.shape)?.label ?? "—"}</span>
                          <span>{GOALS.find((g) => g.id === form.goal)?.label ?? "—"}</span>
                          <span>{form.days ? `هفته‌ای ${toFaDigits(form.days)} روز` : "—"}</span>
                        </div>
                        <div className="if-quiz-reco">
                          <span>پیشنهاد ما</span>
                          <b>{recommendation.name}</b>
                          <p>{recommendation.why}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="if-quiz-foot">
              {step > 0 && stepId !== "done" ? (
                <button type="button" className="if-quiz-btn if-quiz-btn--ghost" onClick={back}>
                  <ArrowRight size={16} />
                  قبلی
                </button>
              ) : (
                <span />
              )}

              {stepId === "done" ? (
                <button
                  type="button"
                  className="if-quiz-btn if-quiz-btn--solid"
                  onClick={() => {
                    onClose();
                    window.setTimeout(() => scrollToSection("#pricing"), 220);
                  }}
                >
                  دیدن تعرفه‌ها
                  <ArrowLeft size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="if-quiz-btn if-quiz-btn--solid"
                  onClick={next}
                  disabled={!canNext}
                >
                  {stepId === "bmi" ? "ادامه" : stepId === "contact" ? "ساختن برنامه من" : "بعدی"}
                  <ArrowLeft size={16} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
