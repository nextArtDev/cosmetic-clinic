"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, PartyPopper } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Profile = "homme" | "femme" | "afro";
type Concern = "golfes" | "tonsure" | "ligne" | "densite" | "traction" | "barbe" | "autre";
type Duration = "<1" | "1-3" | "3-5" | ">5";

type FormState = {
  profile: Profile | "";
  concern: Concern | "";
  duration: Duration | "";
  age: string;
  firstName: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
};

const profiles: { value: Profile; label: string; hint: string }[] = [
  { value: "homme", label: "Homme", hint: "Golfes, tonsure, ligne frontale" },
  { value: "femme", label: "Femme", hint: "Raréfaction diffuse, ligne, densité" },
  { value: "afro", label: "Cheveux afro / crépus", hint: "Follicules courbes, tempes, traction" },
];

const concerns: { value: Concern; label: string }[] = [
  { value: "golfes", label: "Golfes temporaux" },
  { value: "tonsure", label: "Tonsure / vertex" },
  { value: "ligne", label: "Ligne frontale" },
  { value: "densite", label: "Densité globale" },
  { value: "traction", label: "Alopécie de traction" },
  { value: "barbe", label: "Barbe / sourcils" },
  { value: "autre", label: "Autre" },
];

const durations: { value: Duration; label: string }[] = [
  { value: "<1", label: "Moins d'un an" },
  { value: "1-3", label: "1 à 3 ans" },
  { value: "3-5", label: "3 à 5 ans" },
  { value: ">5", label: "Plus de 5 ans" },
];

const steps = ["Profil", "Situation", "Coordonnées"];

export default function DiagnosticForm({
  initialProfile,
  compact,
}: {
  initialProfile?: Profile;
  compact?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    profile: initialProfile ?? "",
    concern: "",
    duration: "",
    age: "",
    firstName: "",
    email: "",
    phone: "",
    message: "",
    consent: false,
  });

  useEffect(() => {
    if (!initialProfile) return;
    const t = window.setTimeout(() => setForm((f) => ({ ...f, profile: initialProfile })), 0);
    return () => window.clearTimeout(t);
  }, [initialProfile]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canNext = useMemo(() => {
    if (step === 0) return !!form.profile;
    if (step === 1) return !!form.concern && !!form.duration;
    return form.firstName.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.email) && form.consent;
  }, [step, form]);

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    setError(null);
  };

  const submit = async () => {
    if (!canNext || status === "loading") return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/v5/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: form.age ? Number(form.age) : null,
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; reference?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Une erreur est survenue.");
      setReference(data.reference ?? null);
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d * 40, opacity: 0, filter: "blur(4px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (d: number) => ({ x: d * -40, opacity: 0, filter: "blur(4px)" }),
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="nc:flex nc:flex-col nc:items-center nc:py-10 nc:text-center"
      >
        <motion.span
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
          className="nc:grid nc:size-16 nc:place-items-center nc:rounded-full nc:bg-sage nc:text-white nc:shadow-[0_16px_40px_-14px_rgba(47,83,46,.6)]"
        >
          <Check className="nc:size-7" strokeWidth={2.5} />
        </motion.span>
        <h3 className="nc:mt-6 nc:text-2xl nc:font-semibold nc:tracking-[-0.03em]">Demande enregistrée</h3>
        <p className="nc:mt-3 nc:max-w-md nc:text-[15px] nc:leading-relaxed nc:text-graphite">
          Merci {form.firstName}. Un membre de l&apos;équipe médicale analyse votre situation et vous répond
          sous 72 h à <span className="nc:font-semibold nc:text-ink">{form.email}</span>.
        </p>
        {reference && (
          <p className="nc:mt-5 nc:inline-flex nc:items-center nc:gap-2 nc:rounded-full nc:bg-fog nc:px-4 nc:py-2 nc:text-[13px] nc:font-semibold nc:tabular-nums">
            <PartyPopper className="nc:size-4 nc:text-sage" /> Référence {reference}
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div className={compact ? "" : ""}>
      {/* Stepper */}
      <ol className="nc:mb-8 nc:flex nc:items-center nc:gap-2">
        {steps.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s} className="nc:flex nc:flex-1 nc:items-center nc:gap-2">
              <button
                type="button"
                onClick={() => i < step && go(i)}
                disabled={i > step}
                className={`nc:flex nc:items-center nc:gap-2 nc:text-[12px] nc:font-semibold nc:tracking-tight nc:transition-colors ${
                  active ? "nc:text-ink" : done ? "nc:text-sage" : "nc:text-mist"
                }`}
              >
                <span
                  className={`nc:grid nc:size-6 nc:place-items-center nc:rounded-full nc:text-[11px] nc:transition-all nc:duration-500 ${
                    active
                      ? "nc:bg-ink nc:text-white"
                      : done
                        ? "nc:bg-sage nc:text-white"
                        : "nc:bg-fog nc:text-mist"
                  }`}
                >
                  {done ? <Check className="nc:size-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className="nc:hidden nc:sm:inline">{s}</span>
              </button>
              {i < steps.length - 1 && (
                <span className="nc:relative nc:h-px nc:flex-1 nc:bg-line">
                  <motion.span
                    className="nc:absolute nc:inset-y-0 nc:left-0 nc:bg-sage"
                    animate={{ width: done ? "100%" : "0%" }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="nc:relative nc:min-h-[300px]">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          {step === 0 && (
            <motion.fieldset
              key="s0"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: EASE }}
            >
              <legend className="nc:mb-5 nc:text-lg nc:font-semibold nc:tracking-tight">Quel est votre profil ?</legend>
              <div className="nc:grid nc:gap-3 nc:sm:grid-cols-3">
                {profiles.map((p) => {
                  const on = form.profile === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => set("profile", p.value)}
                      aria-pressed={on}
                      className={`nc:group nc:relative nc:rounded-2xl nc:border nc:p-4 nc:text-left nc:transition-all nc:duration-300 ${
                        on
                          ? "nc:border-ink nc:bg-ink nc:text-white nc:shadow-lift"
                          : "nc:border-ink/10 nc:bg-white nc:hover:-translate-y-0.5 nc:hover:border-ink/40"
                      }`}
                    >
                      <span className="nc:block nc:text-[15px] nc:font-semibold">{p.label}</span>
                      <span className={`nc:mt-1 nc:block nc:text-[12.5px] ${on ? "nc:text-white/65" : "nc:text-graphite"}`}>
                        {p.hint}
                      </span>
                      <span
                        className={`nc:absolute nc:right-3 nc:top-3 nc:grid nc:size-5 nc:place-items-center nc:rounded-full nc:border nc:transition-all nc:duration-300 ${
                          on ? "nc:border-sage-soft nc:bg-sage-soft nc:text-ink" : "nc:border-ink/15"
                        }`}
                      >
                        {on && <Check className="nc:size-3" strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.fieldset>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: EASE }}
              className="nc:space-y-7"
            >
              <fieldset>
                <legend className="nc:mb-4 nc:text-lg nc:font-semibold nc:tracking-tight">Quelle zone vous préoccupe ?</legend>
                <div className="nc:flex nc:flex-wrap nc:gap-2">
                  {concerns.map((c) => {
                    const on = form.concern === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => set("concern", c.value)}
                        aria-pressed={on}
                        className={`nc:rounded-full nc:border nc:px-4 nc:py-2 nc:text-[13.5px] nc:font-medium nc:transition-all nc:duration-300 ${
                          on
                            ? "nc:border-ink nc:bg-ink nc:text-white"
                            : "nc:border-ink/12 nc:bg-white nc:text-ink nc:hover:border-ink/50"
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <fieldset>
                <legend className="nc:mb-4 nc:text-lg nc:font-semibold nc:tracking-tight">Depuis combien de temps ?</legend>
                <div className="nc:grid nc:grid-cols-2 nc:gap-2 nc:sm:grid-cols-4">
                  {durations.map((d) => {
                    const on = form.duration === d.value;
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => set("duration", d.value)}
                        aria-pressed={on}
                        className={`nc:rounded-xl nc:border nc:px-3 nc:py-3 nc:text-[13.5px] nc:font-medium nc:transition-all nc:duration-300 ${
                          on
                            ? "nc:border-sage nc:bg-sage-mist nc:text-sage-deep"
                            : "nc:border-ink/12 nc:bg-white nc:hover:border-ink/50"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="nc:max-w-[200px]">
                <label htmlFor="age" className="nc:mb-2 nc:block nc:text-[13px] nc:font-semibold nc:text-graphite">
                  Votre âge <span className="nc:font-normal">(facultatif)</span>
                </label>
                <input
                  id="age"
                  type="number"
                  min={18}
                  max={90}
                  inputMode="numeric"
                  value={form.age}
                  onChange={(e) => set("age", e.target.value)}
                  className="nc:h-12 nc:w-full nc:rounded-xl nc:border nc:border-ink/12 nc:bg-white nc:px-4 nc:text-[15px] nc:transition-colors nc:focus:border-ink nc:focus:outline-none"
                  placeholder="34"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: EASE }}
              className="nc:space-y-4"
            >
              <p className="nc:text-lg nc:font-semibold nc:tracking-tight">Où vous envoyer l&apos;analyse ?</p>
              <div className="nc:grid nc:gap-4 nc:sm:grid-cols-2">
                <Field
                  id="firstName"
                  label="Prénom"
                  value={form.firstName}
                  onChange={(v) => set("firstName", v)}
                  autoComplete="given-name"
                  required
                />
                <Field
                  id="email"
                  label="E-mail"
                  type="email"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  autoComplete="email"
                  required
                />
                <Field
                  id="phone"
                  label="Téléphone (facultatif)"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="message" className="nc:mb-2 nc:block nc:text-[13px] nc:font-semibold nc:text-graphite">
                  Précisions (facultatif)
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Traitements déjà essayés, antécédents familiaux, attentes…"
                  className="nc:w-full nc:resize-none nc:rounded-xl nc:border nc:border-ink/12 nc:bg-white nc:px-4 nc:py-3 nc:text-[15px] nc:transition-colors nc:focus:border-ink nc:focus:outline-none"
                />
              </div>
              <label className="nc:flex nc:cursor-pointer nc:items-start nc:gap-3 nc:text-[13px] nc:leading-relaxed nc:text-graphite">
                <span className="nc:relative nc:mt-0.5 nc:shrink-0">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                    className="nc:peer nc:sr-only"
                  />
                  <span className="nc:grid nc:size-5 nc:place-items-center nc:rounded-md nc:border nc:border-ink/25 nc:bg-white nc:transition-all nc:peer-checked:border-sage nc:peer-checked:bg-sage nc:peer-focus-visible:ring-2 nc:peer-focus-visible:ring-azure">
                    <Check className={`nc:size-3 nc:text-white nc:transition-opacity ${form.consent ? "nc:opacity-100" : "nc:opacity-0"}`} strokeWidth={3} />
                  </span>
                </span>
                J&apos;accepte que mes informations soient utilisées pour être recontacté(e) par le centre dans le
                cadre de ma demande. Aucune revente, aucune prospection tierce.
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="nc:mt-8 nc:flex nc:items-center nc:justify-between nc:gap-4 nc:border-t nc:border-ink/8 nc:pt-6">
        <button
          type="button"
          onClick={() => step > 0 && go(step - 1)}
          disabled={step === 0}
          className="nc:inline-flex nc:h-11 nc:items-center nc:gap-2 nc:rounded-full nc:px-4 nc:text-sm nc:font-semibold nc:text-ink nc:transition-colors nc:hover:bg-fog nc:disabled:invisible"
        >
          <ArrowLeft className="nc:size-4" /> Retour
        </button>

        <div className="nc:flex nc:items-center nc:gap-4">
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="nc:text-[13px] nc:font-medium nc:text-wine"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => go(step + 1)}
              disabled={!canNext}
              className="nc:group nc:inline-flex nc:h-12 nc:items-center nc:gap-2 nc:rounded-full nc:bg-ink nc:px-6 nc:text-sm nc:font-semibold nc:text-white nc:transition-all nc:duration-300 nc:hover:bg-sage-deep nc:disabled:cursor-not-allowed nc:disabled:opacity-40"
            >
              Continuer
              <ArrowRight className="nc:size-4 nc:transition-transform nc:duration-300 nc:group-hover:translate-x-1" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canNext || status === "loading"}
              className="nc:group nc:inline-flex nc:h-12 nc:items-center nc:gap-2 nc:rounded-full nc:bg-sage nc:px-6 nc:text-sm nc:font-semibold nc:text-white nc:shadow-[0_12px_30px_-12px_rgba(47,83,46,.6)] nc:transition-all nc:duration-300 nc:hover:bg-sage-deep nc:disabled:cursor-not-allowed nc:disabled:opacity-40"
            >
              {status === "loading" ? <Loader2 className="nc:size-4 nc:animate-spin" /> : null}
              {status === "loading" ? "Envoi…" : "Envoyer ma demande"}
              {status !== "loading" && (
                <ArrowRight className="nc:size-4 nc:transition-transform nc:duration-300 nc:group-hover:translate-x-1" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const float = focused || value.length > 0;
  return (
    <div className="nc:relative">
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="nc:peer nc:h-14 nc:w-full nc:rounded-xl nc:border nc:border-ink/12 nc:bg-white nc:px-4 nc:pt-4 nc:text-[15px] nc:transition-colors nc:focus:border-ink nc:focus:outline-none"
      />
      <label
        htmlFor={id}
        className={`nc:pointer-events-none nc:absolute nc:left-4 nc:transition-all nc:duration-300 nc:ease-[cubic-bezier(.16,1,.3,1)] ${
          float ? "nc:top-2 nc:text-[11px] nc:font-semibold nc:text-sage" : "nc:top-1/2 nc:-translate-y-1/2 nc:text-[14px] nc:text-mist"
        }`}
      >
        {label}
      </label>
    </div>
  );
}
