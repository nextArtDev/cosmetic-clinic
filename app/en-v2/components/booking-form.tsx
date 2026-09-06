"use client";

import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { consultationTypes } from "../lib/site-content";

export function BookingForm({ selectedType, onTypeChange, onPrivacy }: { selectedType: string; onTypeChange: (value: string) => void; onPrivacy: () => void }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [firstName, setFirstName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const newErrors: Record<string, string> = {};
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    if (name.length < 2) newErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email address.";
    if (!data.get("consent")) newErrors.consent = "Please agree to the privacy notice.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      setStatus("error");
      setMessage("Please check the highlighted fields.");
      form.querySelector<HTMLElement>(`[name="${Object.keys(newErrors)[0]}"]`)?.focus();
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/en-v2/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(data.entries()), consultationType: selectedType, consent: data.get("consent") === "on" }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.errors || {});
        throw new Error(result.error || "Please try again in a moment.");
      }
      setReference(result.reference);
      setFirstName(name.split(" ")[0]);
      setStatus("success");
      window.setTimeout(() => resultRef.current?.focus(), 100);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  const errorFor = (field: string) => errors[field] ? <span className="field-error" id={`${field}-error`}>{errors[field]}</span> : null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "success" ? (
        <motion.div ref={resultRef} tabIndex={-1} key="success" className="booking-success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} role="status">
          <span className="success-mark"><Check size={32} strokeWidth={1.3} /></span>
          <span className="eyebrow">Your next chapter starts here</span>
          <h3>Thank you,<br />{firstName}.</h3>
          <p>Your consultation request has been saved. Your preferred session is <strong>{consultationTypes.find(type => type.id === selectedType)?.title.toLowerCase()}</strong>.</p>
          <div className="request-reference"><span>Request reference</span><strong>{reference}</strong></div>
          <p className="success-note">This is a website demonstration. No appointment has been scheduled, no email has been sent, and no payment has been taken.</p>
          <button className="text-link" type="button" onClick={() => { setStatus("idle"); setErrors({}); setMessage(""); }}>Back to the form <ArrowUpRight size={18} /></button>
        </motion.div>
      ) : (
        <motion.form key="form" ref={formRef} onSubmit={submit} className="booking-form" noValidate exit={{ opacity: 0, y: -15 }} aria-label="Book a consultation">
          <div className="form-heading"><span className="eyebrow">A little about you</span><span>( 01 — 03 )</span></div>
          <div className="form-grid">
            <label className={`form-field ${errors.name ? "invalid" : ""}`}><span>Your name <i>*</i></span><input name="name" autoComplete="name" placeholder="How should I call you?" maxLength={120} required aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />{errorFor("name")}</label>
            <label className={`form-field ${errors.email ? "invalid" : ""}`}><span>Email address <i>*</i></span><input name="email" type="email" autoComplete="email" placeholder="Your email address" maxLength={254} required aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />{errorFor("email")}</label>
            <label className={`form-field ${errors.phone ? "invalid" : ""}`}><span>Phone <small>(optional)</small></span><input name="phone" type="tel" autoComplete="tel" placeholder="+1 000 000 0000" maxLength={40} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} />{errorFor("phone")}</label>
            <label className="form-field"><span>Where are you based?</span><input name="country" autoComplete="country-name" placeholder="Country / time zone" maxLength={120} />{errorFor("country")}</label>
          </div>
          <label className="form-field select-field"><span>Type of consultation <i>*</i></span><select name="consultationType" value={selectedType} onChange={(event) => onTypeChange(event.target.value)}>{consultationTypes.map(type => <option value={type.id} key={type.id}>{type.title}</option>)}</select>{errorFor("consultationType")}</label>
          <label className="form-field message-field"><span>What brings you here? <small>(optional)</small></span><textarea name="message" placeholder="Tell me a little about your skincare goals…" rows={2} maxLength={3000} aria-describedby="message-help" />{errorFor("message")}</label>
          <span id="message-help" className="form-hint">Please don’t include sensitive medical information in this initial request.</span>
          <div className="form-honeypot" aria-hidden="true"><label>Website<input name="website" autoComplete="off" tabIndex={-1} /></label></div>
          <div className="consent-wrap"><label className="consent"><input name="consent" type="checkbox" required aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-error" : undefined} /><span>I agree to the processing of my information as described in the <button type="button" onClick={onPrivacy}>privacy notice</button>.</span></label>{errorFor("consent")}</div>
          {message && <p className="form-alert" role="alert">{message}</p>}
          <motion.button className="submit-button" type="submit" disabled={status === "sending"} whileHover={{ backgroundColor: "#ffd387" }} whileTap={{ scale: 0.985 }}>
            <span>{status === "sending" ? "Sending your request" : "Book a consultation"}</span>{status === "sending" ? <LoaderCircle className="animate-spin" size={25} /> : <ArrowUpRight size={28} strokeWidth={1.4} />}
          </motion.button>
          <p className="form-footnote">A personal approach. A thoughtful plan. No payment required to enquire.</p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
