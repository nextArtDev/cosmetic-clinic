export const site = {
  name: "NOVA Capillaire",
  shortName: "NOVA",
  tagline: "Greffe de cheveux premium à Paris",
  phone: "01 41 50 00 07",
  phoneHref: "tel:+33141500007",
  whatsapp: "+33 7 71 66 03 65",
  whatsappHref: "https://wa.me/33771660365",
  email: "contact@novacapillaire.fr",
  address: "108 Bd du Montparnasse, 75014 Paris",
  mapsHref: "https://maps.app.goo.gl/",
  socials: [
    { label: "IG", name: "Instagram", href: "https://instagram.com" },
    { label: "f", name: "Facebook", href: "https://facebook.com" },
    { label: "WA", name: "WhatsApp", href: "https://wa.me/33771660365" },
    { label: "@", name: "E-mail", href: "mailto:contact@novacapillaire.fr" },
    { label: "X", name: "X", href: "https://x.com" },
  ],
};

export const nav = {
  primary: [
    { label: "Tarifs", href: "/v5/#tarifs" },
    { label: "Avant-après", href: "/v5/#resultats" },
    { label: "FUE Saphir", href: "/v5/#fue-saphir" },
    { label: "Le centre", href: "/v5/#centre" },
    { label: "FAQ", href: "/v5/#faq" },
  ],
  secondary: [
    { label: "Greffe de cheveux homme", href: "/v5/#profils" },
    { label: "Greffe de cheveux femme", href: "/v5/#profils" },
    { label: "Greffe de cheveux afro", href: "/v5/#profils" },
    { label: "Contact et accès", href: "/v5/#contact" },
  ],
  cta: { label: "Diagnostic", href: "/v5/diagnostic" },
};

export const heroStats = [
  { value: 72, suffix: "h", label: "pour recevoir votre analyse" },
  { value: 12, suffix: " mois", label: "de suivi post-opératoire inclus" },
  { value: 6500, suffix: "", label: "greffons max. par session", format: true },
];

export const profiles = [
  {
    index: "01",
    title: "Cheveux homme",
    eyebrow: "Profil",
    description:
      "Golfes, tonsure, ligne frontale qui recule : une stratégie d'implantation pensée pour rester crédible dans dix ans.",
    image: "/v5/images/profile-homme.webp",
    href: "/v5/diagnostic?profil=homme",
  },
  {
    index: "02",
    title: "Cheveux femme",
    eyebrow: "Profil",
    description:
      "Densification sans rasage complet, redessin de la ligne frontale ou correction post-traction : une approche discrète.",
    image: "/v5/images/profile-femme.webp",
    href: "/v5/diagnostic?profil=femme",
  },
  {
    index: "03",
    title: "Cheveux afro",
    eyebrow: "Profil",
    description:
      "Follicules courbes, densité visuelle différente : une expertise spécifique du prélèvement et de l'angle d'implantation.",
    image: "/v5/images/profile-afro.webp",
    href: "/v5/diagnostic?profil=afro",
  },
];

export const advantages = [
  {
    index: "01",
    title: "Précision optimale",
    text: "Les lames en saphir ouvrent des micro-canaux plus fins et plus nets, ce qui permet de placer chaque greffon exactement là où il doit vivre.",
  },
  {
    index: "02",
    title: "Rendu naturel",
    text: "Angle, direction et densité sont décidés greffon par greffon, en suivant l'implantation que la nature vous avait donnée.",
  },
  {
    index: "03",
    title: "Confort amélioré",
    text: "Des incisions plus petites : moins de saignement pendant l'acte, moins d'œdème après, et un retour à l'écran ou au bureau plus rapide.",
  },
  {
    index: "04",
    title: "Résultats durables",
    text: "Les greffons prélevés dans la couronne sont génétiquement résistants à la chute. Une fois pris, ils poussent pour de bon.",
  },
];

export type PriceTier = {
  name: string;
  range: string;
  price: string;
  perGraft: string;
  note: string;
  highlight?: boolean;
};

export const pricing: Record<
  "classique" | "afro",
  { label: string; hint: string; tiers: PriceTier[] }
> = {
  classique: {
    label: "Cheveux lisses, ondulés ou bouclés",
    hint: "Sessions de 3 500 à 6 500 greffons, le plus souvent sur deux jours consécutifs.",
    tiers: [
      {
        name: "Essentiel",
        range: "Jusqu'à 3 500 greffons",
        price: "à partir de 4 900 €",
        perGraft: "≈ 1,40 € / greffon",
        note: "Golfes ou ligne frontale, correction ciblée.",
      },
      {
        name: "Équilibre",
        range: "3 500 à 4 500 greffons",
        price: "à partir de 5 900 €",
        perGraft: "≈ 1,31 € / greffon",
        note: "Zone frontale complète + début de tonsure.",
        highlight: true,
      },
      {
        name: "Signature",
        range: "4 500 à 5 500 greffons",
        price: "à partir de 6 900 €",
        perGraft: "≈ 1,25 € / greffon",
        note: "Reconstruction étendue, deux journées.",
      },
      {
        name: "Sur mesure",
        range: "5 500 greffons et plus",
        price: "sur devis",
        perGraft: "tarif dégressif",
        note: "Cas complexes, reprises, très grandes surfaces.",
      },
    ],
  },
  afro: {
    label: "Cheveux afro ou crépus",
    hint: "Le prélèvement de follicules courbes demande plus de temps : les sessions sont dimensionnées en conséquence.",
    tiers: [
      {
        name: "Essentiel",
        range: "Jusqu'à 2 500 greffons",
        price: "à partir de 5 400 €",
        perGraft: "≈ 2,16 € / greffon",
        note: "Ligne frontale, tempes ou alopécie de traction localisée.",
      },
      {
        name: "Signature",
        range: "2 500 à 4 000 greffons",
        price: "à partir de 7 400 €",
        perGraft: "≈ 1,85 € / greffon",
        note: "Zone frontale complète et densification du vertex.",
        highlight: true,
      },
      {
        name: "Sur mesure",
        range: "4 000 greffons et plus",
        price: "sur devis",
        perGraft: "tarif dégressif",
        note: "Grandes surfaces ou interventions en plusieurs temps.",
      },
    ],
  },
};

export const pricingIncluded = [
  "Consultation médicale et plan d'implantation",
  "Bloc, matériel et équipe dédiée sur toute la durée",
  "Trousse de soins et protocole de lavage",
  "Une séance de photothérapie LED",
  "Une séance de mésothérapie",
  "Contrôles à J+1, J+10, 3 mois, 6 mois et 12 mois",
];

export const resultPoints = [
  {
    index: "01",
    title: "Ligne frontale naturelle",
    text: "Légèrement irrégulière, jamais tirée au cordeau : c'est ce micro-désordre qui rend une ligne crédible de face comme de profil.",
  },
  {
    index: "02",
    title: "Densité harmonieuse",
    text: "Nous répartissons les greffons selon les zones visibles en priorité, pour un effet de masse là où l'œil se pose.",
  },
  {
    index: "03",
    title: "Vision à long terme",
    text: "Le plan tient compte de l'évolution probable de la chute pour ne pas créer d'îlot isolé dans dix ans.",
  },
  {
    index: "04",
    title: "Implantation sur mesure",
    text: "Angles de sortie, orientation des épis, transition de calibre : chaque zone reçoit le greffon qui lui correspond.",
  },
];

export const resultCases = [
  {
    id: 1,
    title: "Cas 01 — Golfes & ligne frontale",
    grafts: "3 200 greffons",
    months: "12 mois",
    image: "/v5/images/case-1.webp",
    alt: "Portrait d'un homme à la chevelure dense, résultat à 12 mois",
  },
  {
    id: 2,
    title: "Cas 02 — Vertex",
    grafts: "2 600 greffons",
    months: "10 mois",
    image: "/v5/images/case-2.webp",
    alt: "Profil d'un jeune homme aux cheveux bouclés denses",
  },
  {
    id: 3,
    title: "Cas 03 — Cheveux afro, tempes",
    grafts: "2 100 greffons",
    months: "12 mois",
    image: "/v5/images/case-3.webp",
    alt: "Homme à la coupe afro dense se coiffant",
  },
  {
    id: 4,
    title: "Cas 04 — Reconstruction étendue",
    grafts: "5 400 greffons",
    months: "14 mois",
    image: "/v5/images/case-4.webp",
    alt: "Portrait d'un homme aux cheveux longs et épais",
  },
  {
    id: 5,
    title: "Cas 05 — Densification",
    grafts: "1 800 greffons",
    months: "9 mois",
    image: "/v5/images/case-5.webp",
    alt: "Profil d'un homme aux longues locks",
  },
];

export const faq = [
  {
    q: "Quand puis-je reprendre le travail après l'intervention ?",
    a: "La plupart de nos patients reprennent une activité de bureau au bout de 3 à 5 jours. Les rougeurs de la zone receveuse s'estompent en une dizaine de jours ; si votre métier est physique ou exposé au public, prévoyez plutôt une semaine.",
  },
  {
    q: "Comment se passent les premiers lavages ?",
    a: "Le premier lavage est réalisé au centre le lendemain de l'intervention, avec vous, pour que vous repartiez en sachant exactement quoi faire. Ensuite, un shampoing doux et une mousse émolliente suffisent, sans frotter, pendant deux semaines.",
  },
  {
    q: "Est-il normal que les cheveux greffés tombent ?",
    a: "Oui, et c'est même attendu. Entre la 2e et la 6e semaine, les tiges greffées tombent : c'est la phase de repos du follicule. La repousse définitive démarre vers le 3e ou 4e mois et se densifie jusqu'au 12e.",
  },
  {
    q: "Quand voit-on le résultat final ?",
    a: "On considère le résultat comme stabilisé entre 12 et 18 mois selon la zone. Le vertex est toujours la zone la plus lente. Vos contrôles à 6 et 12 mois permettent de suivre la progression avec des photos standardisées.",
  },
  {
    q: "Le sport, le soleil, la piscine : quels délais ?",
    a: "Marche dès le lendemain, sport doux sans transpiration excessive à J+7, sport intense à J+14. Pas d'exposition solaire directe du cuir chevelu pendant un mois ; piscine et mer après trois semaines.",
  },
  {
    q: "Que comprend le suivi pendant 12 mois ?",
    a: "Cinq rendez-vous de contrôle, une ligne WhatsApp dédiée pour les questions du quotidien, une séance de LED et une séance de mésothérapie pour stimuler la repousse, ainsi qu'un ajustement des soins si nécessaire.",
  },
];

export const footerColumns = [
  {
    title: "Centre",
    links: [
      { label: "Accueil", href: "/v5" },
      { label: "Le centre", href: "/v5/#centre" },
      { label: "Avant-après", href: "/v5/#resultats" },
      { label: "Foire aux questions", href: "/v5/#faq" },
      { label: "Contact et accès", href: "/v5/#contact" },
    ],
  },
  {
    title: "Greffes",
    links: [
      { label: "Greffe de cheveux homme", href: "/v5/#profils" },
      { label: "Greffe de cheveux femme", href: "/v5/#profils" },
      { label: "Greffe de cheveux afro", href: "/v5/#profils" },
      { label: "FUE Saphir", href: "/v5/#fue-saphir" },
      { label: "Nos tarifs", href: "/v5/#tarifs" },
    ],
  },
];

export const legalLinks = [
  { label: "Confidentialité", href: "/v5/legal/confidentialite" },
  { label: "Mentions légales", href: "/v5/legal/mentions-legales" },
  { label: "Cookies", href: "/v5/legal/cookies" },
];
