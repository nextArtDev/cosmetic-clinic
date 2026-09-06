import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import NovaSite from "../components/nova-site";
import { V5Shell } from "../components/v5-shell";
import { footerColumns, legalLinks } from "../lib/site";

export const metadata: Metadata = { title: "Plan du site", robots: { index: false, follow: false } };

export default function SitemapPage() {
  const groups = [
    ...footerColumns,
    { title: "Outils", links: [{ label: "Diagnostic en ligne", href: "/v5/diagnostic" }] },
    { title: "Légal", links: legalLinks },
  ];
  return (
    <V5Shell>
      <NovaSite>
        <section className="nc:bg-paper nc:pb-24 nc:pt-[120px] nc:sm:pb-32 nc:sm:pt-[150px]">
          <div className="nc:mx-auto nc:max-w-5xl nc:px-5 nc:sm:px-8">
            <SectionHeading as="h1" eyebrow="Navigation" title={"Plan du *site*"} />
            <div className="nc:mt-12 nc:grid nc:gap-6 nc:sm:grid-cols-2">
              {groups.map((g, i) => (
                <Reveal key={g.title} delay={i} className="nc:rounded-2xl nc:bg-white nc:p-6 nc:ring-1 nc:ring-ink/5">
                  <h2 className="eyebrow nc:mb-4 nc:text-sage">{g.title}</h2>
                  <ul className="nc:space-y-2.5">
                    {g.links.map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} className="nc:group nc:inline-flex nc:items-center nc:gap-1.5 nc:text-[15px] nc:font-medium">
                          {l.label}
                          <ArrowUpRight className="nc:size-3.5 nc:opacity-0 nc:transition-all nc:group-hover:translate-x-0.5 nc:group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </NovaSite>
    </V5Shell>
  );
}
