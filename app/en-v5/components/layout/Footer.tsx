"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Loader2, MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import Logo from "./Logo";
import { footerColumns, legalLinks, site } from "../../lib/site";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/v5/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Erreur");
      setState("done");
      setMsg(data.message ?? "Guide envoyé.");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  };

  const contacts = [
    { icon: Phone, label: site.phone, href: site.phoneHref, mark: "Tél" },
    { icon: MessageCircle, label: site.whatsapp, href: site.whatsappHref, mark: "WA" },
    { icon: Mail, label: "Par e-mail", href: `mailto:${site.email}`, mark: "@" },
    { icon: MapPin, label: site.address, href: site.mapsHref, mark: "Plan" },
  ];

  return (
    <footer id="contact" className="nc:relative nc:overflow-hidden nc:bg-ink nc:text-white">
      <div className="grain nc:absolute nc:inset-0" />
      {/* Ambient glow */}
      <div className="nc:pointer-events-none nc:absolute nc:-left-40 nc:top-0 nc:size-[520px] nc:rounded-full nc:bg-sage/25 nc:blur-[140px]" />
      <div className="nc:pointer-events-none nc:absolute nc:-right-40 nc:bottom-0 nc:size-[460px] nc:rounded-full nc:bg-azure/10 nc:blur-[140px]" />

      <div className="nc:relative nc:mx-auto nc:max-w-7xl nc:px-5 nc:pb-28 nc:pt-20 nc:sm:px-8 nc:sm:pb-12 nc:lg:pt-28">
        <div className="nc:grid nc:gap-14 nc:lg:grid-cols-12">
          {/* Brand */}
          <div className="nc:lg:col-span-5">
            <Logo dark withTooltip={false} />
            <h6 className="letterpress-light nc:mt-8 nc:max-w-md text-balance nc:text-[clamp(1.4rem,2.4vw,1.9rem)] nc:font-semibold nc:leading-[1.15] nc:tracking-[-0.02em]">
              Greffe de cheveux à Paris : une prise en charge sérieuse, des tarifs justes et une qualité
              sans compromis.
            </h6>

            <form onSubmit={submit} className="nc:mt-10 nc:max-w-md">
              <label htmlFor="guide-email" className="eyebrow nc:mb-3 nc:block nc:text-sage-soft/80">
                Recevoir le guide post-opératoire
              </label>
              <div className="nc:group nc:relative nc:flex nc:items-center nc:rounded-full nc:border nc:border-white/15 nc:bg-white/[0.04] nc:p-1.5 nc:transition-colors nc:focus-within:border-white/50 nc:focus-within:bg-white/[0.07]">
                <input
                  id="guide-email"
                  type="email"
                  required
                  disabled={state === "done"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  className="nc:h-11 nc:flex-1 nc:bg-transparent nc:px-4 nc:text-sm nc:text-white nc:placeholder:text-white/40 nc:focus:outline-none nc:disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={state === "loading" || state === "done"}
                  className="nc:relative nc:grid nc:size-11 nc:shrink-0 nc:place-items-center nc:overflow-hidden nc:rounded-full nc:bg-white nc:text-ink nc:transition-all nc:hover:bg-sage-soft nc:disabled:opacity-80"
                  aria-label="Envoyer"
                >
                  {state === "loading" ? (
                    <Loader2 className="nc:size-4 nc:animate-spin" />
                  ) : state === "done" ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                      <Check className="nc:size-4" />
                    </motion.span>
                  ) : (
                    <ArrowUpRight className="nc:size-4 nc:transition-transform nc:duration-500 nc:group-hover:rotate-45" />
                  )}
                </button>
              </div>
              <p
                aria-live="polite"
                className={`nc:mt-3 nc:min-h-5 nc:text-xs ${state === "error" ? "nc:text-blush" : "nc:text-sage-soft/80"}`}
              >
                {msg || "Un PDF de 12 pages : lavages, sommeil, sport, ce qui est normal (et ce qui ne l'est pas)."}
              </p>
            </form>
          </div>

          {/* Columns */}
          <div className="nc:grid nc:grid-cols-2 nc:gap-10 nc:sm:grid-cols-3 nc:lg:col-span-7">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h6 className="eyebrow nc:mb-5 nc:text-white/50">{col.title}</h6>
                <ul className="nc:space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="nc:group nc:inline-flex nc:items-center nc:gap-1.5 nc:text-[14.5px] nc:text-white/80 nc:transition-colors nc:hover:text-white"
                      >
                        <span className="nc:h-px nc:w-0 nc:bg-sage-soft nc:transition-all nc:duration-500 nc:ease-[cubic-bezier(.16,1,.3,1)] nc:group-hover:w-4" />
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="nc:col-span-2 nc:sm:col-span-1">
              <h6 className="eyebrow nc:mb-5 nc:text-white/50">Contact</h6>
              <ul className="nc:space-y-3">
                {contacts.map((c) => (
                  <li key={c.mark}>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noreferrer noopener" : undefined}
                      className="nc:group nc:flex nc:items-start nc:gap-3 nc:text-[14.5px] nc:text-white/80 nc:transition-colors nc:hover:text-white"
                    >
                      <span className="nc:mt-0.5 nc:grid nc:size-6 nc:shrink-0 nc:place-items-center nc:rounded-md nc:border nc:border-white/15 nc:text-[9px] nc:font-bold nc:tracking-wider nc:text-white/70 nc:transition-all nc:group-hover:border-sage-soft nc:group-hover:bg-sage-soft nc:group-hover:text-ink">
                        {c.mark}
                      </span>
                      <span className="nc:leading-snug">{c.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="nc:mt-7 nc:flex nc:flex-wrap nc:gap-2">
                {site.socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    aria-label={s.name}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="nc:grid nc:h-10 nc:min-w-10 nc:place-items-center nc:rounded-full nc:border nc:border-white/15 nc:px-3 nc:text-xs nc:font-bold nc:transition-all nc:duration-300 nc:hover:-translate-y-0.5 nc:hover:border-white nc:hover:bg-white nc:hover:text-ink"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Big wordmark */}
        <div className="nc:mt-20 nc:select-none nc:overflow-hidden nc:border-t nc:border-white/10 nc:pt-8" aria-hidden>
          <p className="nc:text-center nc:text-[clamp(3.4rem,15vw,15rem)] nc:font-extrabold nc:leading-[0.85] nc:tracking-[-0.05em] nc:text-white/[0.06]">
            NOVA
          </p>
        </div>

        <div className="nc:mt-8 nc:flex nc:flex-col nc:items-start nc:justify-between nc:gap-4 nc:border-t nc:border-white/10 nc:pt-6 nc:text-xs nc:text-white/45 nc:sm:flex-row nc:sm:items-center">
          <p>© {new Date().getFullYear()} {site.name}. Centre de greffe capillaire — Paris 14e.</p>
          <ul className="nc:flex nc:flex-wrap nc:gap-x-5 nc:gap-y-2">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline nc:hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/v5/plan-du-site" className="link-underline nc:hover:text-white">
                Plan du site
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
