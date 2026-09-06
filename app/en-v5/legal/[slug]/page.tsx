import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionHeading from "../../components/ui/SectionHeading";
import Reveal from "../../components/ui/Reveal";
import NovaSite from "../../components/nova-site";
import { V5Shell } from "../../components/v5-shell";
import { site } from "../../lib/site";

const pages: Record<
  string,
  { title: string; eyebrow: string; intro: string; sections: { h: string; p: string }[] }
> = {
  "mentions-legales": {
    title: "Mentions *légales*",
    eyebrow: "Informations",
    intro: "Informations relatives à l'éditeur et à l'hébergement de ce site.",
    sections: [
      { h: "Éditeur", p: `${site.name} — ${site.address}. Téléphone : ${site.phone}. E-mail : ${site.email}.` },
      { h: "Directeur de la publication", p: "La direction du centre." },
      { h: "Hébergement", p: "Ce site est hébergé sur une infrastructure située dans l'Union européenne." },
      { h: "Propriété intellectuelle", p: "L'ensemble des contenus (textes, visuels, marques) est protégé. Toute reproduction non autorisée est interdite." },
    ],
  },
  confidentialite: {
    title: "Politique de *confidentialité*",
    eyebrow: "Vos données",
    intro: "Comment nous collectons, utilisons et protégeons vos informations personnelles.",
    sections: [
      { h: "Données collectées", p: "Formulaire de diagnostic (profil, situation, coordonnées) et inscription au guide (adresse e-mail). Aucune donnée n'est revendue." },
      { h: "Finalités", p: "Répondre à votre demande, organiser une consultation, vous envoyer le guide demandé." },
      { h: "Durée de conservation", p: "Trois ans à compter du dernier contact, sauf obligation légale contraire." },
      { h: "Vos droits", p: `Accès, rectification, effacement et opposition : écrivez à ${site.email}.` },
    ],
  },
  cookies: {
    title: "Politique relative aux *cookies*",
    eyebrow: "Cookies",
    intro: "Les traceurs utilisés sur ce site et la manière de les paramétrer.",
    sections: [
      { h: "Cookies nécessaires", p: "Indispensables au fonctionnement du site et à la mémorisation de vos choix de consentement." },
      { h: "Mesure d'audience", p: "Statistiques anonymisées de fréquentation, déposées uniquement avec votre accord." },
      { h: "Marketing", p: "Personnalisation des campagnes, déposés uniquement avec votre accord." },
      { h: "Modifier vos choix", p: "Supprimez les données du site dans votre navigateur pour faire réapparaître le bandeau de consentement." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug];
  return { title: page ? page.title.replace(/\*/g, "") : "Page", robots: { index: false, follow: false } };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();

  return (
    <V5Shell>
      <NovaSite>
        <section className="nc:bg-paper nc:pb-24 nc:pt-[120px] nc:sm:pb-32 nc:sm:pt-[150px]">
          <div className="nc:mx-auto nc:max-w-3xl nc:px-5 nc:sm:px-8">
            <SectionHeading as="h1" eyebrow={page.eyebrow} title={page.title} description={page.intro} />
            <div className="nc:mt-12 nc:space-y-4">
              {page.sections.map((s, i) => (
                <Reveal key={s.h} delay={i} className="nc:rounded-2xl nc:bg-white nc:p-6 nc:ring-1 nc:ring-ink/5">
                  <h2 className="nc:text-[1.1rem] nc:font-semibold nc:tracking-[-0.02em]">{s.h}</h2>
                  <p className="nc:mt-2 nc:text-[15px] nc:leading-relaxed nc:text-graphite">{s.p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </NovaSite>
    </V5Shell>
  );
}
