"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";

type Prefs = { analytics: boolean; marketing: boolean };
const KEY = "nova-consent-v1";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, marketing: false });

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (!stored) {
      const t = window.setTimeout(() => setVisible(true), 1600);
      return () => window.clearTimeout(t);
    }
  }, []);

  const save = (p: Prefs) => {
    window.localStorage.setItem(KEY, JSON.stringify({ ...p, at: Date.now() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="dialog"
          aria-label="Gestion des cookies"
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="nc:fixed nc:bottom-[84px] nc:left-3 nc:right-3 nc:z-[60] nc:sm:bottom-5 nc:sm:left-5 nc:sm:right-auto nc:sm:w-[420px]"
        >
          <div className="frosted nc:relative nc:overflow-hidden nc:rounded-[22px] nc:p-5 nc:shadow-lift nc:ring-1 nc:ring-ink/10">
            <div className="nc:flex nc:items-start nc:gap-3">
              <span className="nc:grid nc:size-10 nc:shrink-0 nc:place-items-center nc:rounded-full nc:bg-sage-soft nc:text-sage-deep">
                <ShieldCheck className="nc:size-5" />
              </span>
              <div className="nc:flex-1">
                <h2 className="nc:text-[15px] nc:font-semibold nc:tracking-tight">
                  Votre confidentialité, notre priorité
                </h2>
                <p className="nc:mt-1.5 nc:text-[13px] nc:leading-relaxed nc:text-graphite">
                  Nous utilisons des cookies pour mesurer l&apos;audience du site et améliorer votre parcours.
                  Vous choisissez ce que vous acceptez.
                </p>
              </div>
              <button
                type="button"
                onClick={() => save({ analytics: false, marketing: false })}
                aria-label="Fermer"
                className="nc:grid nc:size-8 nc:place-items-center nc:rounded-full nc:text-graphite nc:transition-colors nc:hover:bg-ink/5 nc:hover:text-ink"
              >
                <X className="nc:size-4" />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {prefsOpen && (
                <motion.div
                  key="prefs"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="nc:overflow-hidden"
                >
                  <ul className="nc:mt-4 nc:space-y-2 nc:border-t nc:border-ink/10 nc:pt-4">
                    {[
                      { key: "necessary", label: "Nécessaires", desc: "Sécurité et fonctionnement du site.", locked: true },
                      { key: "analytics", label: "Mesure d'audience", desc: "Statistiques anonymisées de fréquentation." },
                      { key: "marketing", label: "Marketing", desc: "Personnalisation des campagnes." },
                    ].map((row) => {
                      const on = row.locked ? true : prefs[row.key as keyof Prefs];
                      return (
                        <li key={row.key} className="nc:flex nc:items-center nc:justify-between nc:gap-4 nc:rounded-xl nc:bg-ink/[0.03] nc:px-3 nc:py-2.5">
                          <div>
                            <p className="nc:text-[13px] nc:font-semibold">{row.label}</p>
                            <p className="nc:text-[12px] nc:text-graphite">{row.desc}</p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={on}
                            disabled={row.locked}
                            onClick={() =>
                              !row.locked &&
                              setPrefs((p) => ({ ...p, [row.key]: !p[row.key as keyof Prefs] }))
                            }
                            className={`nc:relative nc:h-6 nc:w-11 nc:shrink-0 nc:rounded-full nc:transition-colors nc:duration-300 ${
                              on ? "nc:bg-sage" : "nc:bg-ink/15"
                            } ${row.locked ? "nc:opacity-60" : ""}`}
                          >
                            <motion.span
                              layout
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className={`nc:absolute nc:top-0.5 nc:size-5 nc:rounded-full nc:bg-white nc:shadow ${on ? "nc:left-[22px]" : "nc:left-0.5"}`}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="nc:mt-4 nc:flex nc:flex-wrap nc:items-center nc:gap-2">
              <button
                type="button"
                onClick={() => (prefsOpen ? save(prefs) : setPrefsOpen(true))}
                className="nc:h-10 nc:rounded-full nc:px-4 nc:text-[13px] nc:font-semibold nc:text-ink nc:transition-colors nc:hover:bg-ink/5"
              >
                {prefsOpen ? "Enregistrer" : "Préférences"}
              </button>
              <button
                type="button"
                onClick={() => save({ analytics: false, marketing: false })}
                className="nc:h-10 nc:rounded-full nc:px-4 nc:text-[13px] nc:font-semibold nc:text-ink nc:ring-1 nc:ring-inset nc:ring-ink/15 nc:transition-colors nc:hover:bg-white"
              >
                Refuser
              </button>
              <button
                type="button"
                onClick={() => save({ analytics: true, marketing: true })}
                className="shine nc:h-10 nc:rounded-full nc:bg-ink nc:px-5 nc:text-[13px] nc:font-semibold nc:text-white nc:transition-colors nc:hover:bg-sage-deep"
              >
                Accepter
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
