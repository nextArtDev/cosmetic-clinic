export type Project = {
  slug: string
  name: string
  category: 'Beauté & bien-être' | 'Food & lifestyle' | 'Digital & culture'
  image: string
  services: string[]
  year: string
  description: string
  detail: string
  color: string
}

export const projects: Project[] = [
  {
    slug: 'ecole-aestech',
    name: 'École Aestech',
    category: 'Beauté & bien-être',
    image: '/v3/images/project-aestech.webp',
    services: ['Direction artistique', 'Web design UX', 'Développement web'],
    year: '2026',
    description: 'Révéler une nouvelle vision de la formation esthétique.',
    detail:
      'Une expérience digitale sur mesure qui conjugue l’exigence d’une école et la sensibilité de l’univers de la beauté. Une navigation claire, une identité affirmée et des parcours pensés pour les futurs talents.',
    color: '#e7e1d9',
  },
  {
    slug: 'la-nouvelle-garde',
    name: 'La Nouvelle Garde',
    category: 'Food & lifestyle',
    image: '/v3/images/project-nouvelle-garde.webp',
    services: ['Développement sur mesure', 'Responsive design', 'Optimisation'],
    year: '2025',
    description:
      'Toute l’énergie de la nouvelle brasserie française, en ligne.',
    detail:
      'Un univers généreux, vivant et résolument singulier. Nous avons donné vie à une expérience web immersive, fidèle à l’esprit des maisons de la Nouvelle Garde, avec une attention particulière portée aux détails et à la fluidité.',
    color: '#dbded2',
  },
  {
    slug: 'bendry',
    name: 'Bendry',
    category: 'Beauté & bien-être',
    image: '/v3/images/project-bendry.webp',
    services: ['Identité visuelle', 'Direction artistique', 'Web design', 'E-commerce'],
    year: '2026',
    description: 'Une nouvelle expression pour une beauté essentielle.',
    detail:
      'Repenser l’univers de marque et l’expérience digitale de Bendry Paris. Du langage visuel au parcours d’achat, chaque détail exprime la qualité des soins, révèle leur singularité et invite à une découverte sensible.',
    color: '#e7d7ca',
  },
  {
    slug: 'elle-be',
    name: 'ELLE.be',
    category: 'Digital & culture',
    image: '/v3/images/project-elle.webp',
    services: ['Web design UX', 'Refonte éditoriale', 'Intégration HTML'],
    year: '2025',
    description: 'Un nouveau regard sur une icône éditoriale.',
    detail:
      'Un design au service de l’inspiration. L’expérience de lecture a été repensée pour valoriser la richesse des contenus ELLE Belgique, sur tous les écrans, sans jamais perdre l’élégance et la personnalité du magazine.',
    color: '#e9e1d7',
  },
  {
    slug: 'darphin-estelle',
    name: 'Darphin x Estelle',
    category: 'Beauté & bien-être',
    image: '/v3/images/project-darphin.webp',
    services: ['Direction artistique digitale', 'Landing page', 'Développement HTML'],
    year: '2024',
    description: 'Quand l’expertise botanique rencontre la sensorialité.',
    detail:
      'Une rencontre entre la science, la nature et la beauté. Une expérience de campagne pensée pour raconter les bienfaits des soins Darphin et mettre en lumière cette collaboration singulière.',
    color: '#e6ded6',
  },
  {
    slug: 'atelier-chevre',
    name: 'Atelier Chèvre',
    category: 'Food & lifestyle',
    image: '/v3/images/project-atelier.webp',
    services: ['Web design UX', 'Développement web', 'Optimisation SEO'],
    year: '2025',
    description: 'Un lieu de vie, une expérience à part entière.',
    detail:
      'Traduire l’âme d’un lieu dans un univers digital. Une direction visuelle chaleureuse et une navigation intuitive invitent à explorer les espaces de l’Atelier Chèvre, comme on pousse la porte d’une adresse que l’on aime.',
    color: '#d8d1c6',
  },
]

export const offers = [
  {
    id: 'tremplin',
    label: 'Présence',
    name: 'Le Tremplin',
    description: 'Créer votre première impression digitale.',
    image: '/v3/images/offer-signature.webp',
    intro:
      'Pour les marques qui se lancent et veulent partir sur des bases solides.',
    features: [
      'Un atelier de cadrage stratégique',
      'Une direction artistique sur mesure',
      'Un site one-page, clair et impactant',
      'Un design responsive et un SEO essentiel',
      'Une prise en main accompagnée',
    ],
  },
  {
    id: 'vitrine',
    label: 'Conversion',
    name: 'La Vitrine',
    description: 'Incarner votre marque et convertir.',
    image: '/v3/images/offer-web.webp',
    intro:
      'Pour les marques qui veulent transformer leur image en un véritable levier de développement.',
    features: [
      'Stratégie et positionnement digital',
      'Architecture et parcours utilisateur',
      'Web design entièrement sur mesure',
      'Développement d’un site multi-pages',
      'SEO, performance et formation',
    ],
  },
  {
    id: 'boutique',
    label: 'Vente',
    name: 'La Boutique',
    description: 'Vendre et fidéliser votre clientèle.',
    image: '/v3/images/offer-ecommerce.webp',
    intro:
      'Pour les marques qui souhaitent une expérience d’achat aussi désirable que leurs produits.',
    features: [
      'Stratégie e-commerce et expérience client',
      'Design des pages et fiches produits',
      'Une boutique performante et évolutive',
      'Paiement et parcours d’achat optimisés',
      'Formation et accompagnement au lancement',
    ],
  },
]

export const expertise = [
  {
    title: 'Stratégie de marque',
    text: 'Poser des bases solides et définir ce qui vous rend unique. Nous clarifions votre vision, votre positionnement et votre discours pour construire une marque cohérente et différenciante.',
  },
  {
    title: 'Identité visuelle',
    text: 'Créer une identité singulière qui exprime votre valeur. Logo, couleurs, typographies et langage visuel : un univers cohérent, reconnaissable et pensé pour durer.',
  },
  {
    title: 'Direction artistique',
    text: 'Définir une direction créative qui raconte la bonne histoire. Nous orchestrons les images, les signes et les émotions pour rendre votre marque désirable.',
  },
  {
    title: 'Web design & UX',
    text: 'Concevoir des expériences digitales fluides, intuitives et engageantes. Chaque parcours est pensé pour valoriser votre marque, vos produits et accompagner vos visiteurs vers l’action.',
  },
  {
    title: 'Développement web / e-commerce',
    text: 'Créer des sites sur mesure, performants et évolutifs. Une plateforme fiable, responsive et simple à administrer, pensée pour accompagner votre croissance.',
  },
  {
    title: 'SEO & performance',
    text: 'Renforcer votre visibilité et construire une présence durable. Référencement naturel, vitesse et structure technique sont intégrés dès la conception.',
  },
  {
    title: 'Copywriting',
    text: 'Rédiger des contenus clairs, cohérents et impactants. Un discours aligné avec votre image, qui fait entendre votre différence et parle à votre audience.',
  },
  {
    title: 'Communication print & digitale',
    text: 'Déployer votre univers de marque sur tous vos points de contact. Supports imprimés, newsletters, landing pages et réseaux sociaux : une présence cohérente, partout.',
  },
]

export const methodSteps = [
  {
    title: 'Immersion',
    text: 'Comprendre votre marque, votre marché et votre ambition. Nous écoutons, questionnons et analysons pour identifier ce qui fera vraiment la différence.',
  },
  {
    title: 'Direction',
    text: 'Définir ce qui rend votre marque désirable, crédible et différenciante. Une stratégie claire et une direction artistique alignée avec vos objectifs.',
  },
  {
    title: 'Création',
    text: 'Transformer votre image en une expérience concrète et performante. Du premier concept au dernier détail, nous donnons vie à votre singularité.',
  },
  {
    title: 'Déploiement',
    text: 'Mettre votre marque en mouvement. Nous testons, optimisons et vous accompagnons dans la prise en main pour vous rendre autonome dès la livraison.',
  },
]

export const testimonials = [
  {
    quote:
      'Travailler avec Angélique fut une riche et belle expérience. Le site est beau, intuitif, fonctionnel. Angélique est hyper réactive, positive, force de propositions, et sait vraiment écouter mes besoins.',
    name: 'Un accompagnement sur mesure',
    company: 'Projet de création de site web',
  },
  {
    quote:
      'Le rendu de notre site internet correspond parfaitement au cahier des charges et le résultat est à la hauteur de nos attentes. On nous avait recommandé ses services, à notre tour de la mettre en avant.',
    name: 'Tania',
    company: 'Manine',
  },
  {
    quote:
      'C’était un vrai plaisir de travailler avec Angélique. Elle a parfaitement décliné la charte et l’univers web design que je voulais. La communication est simple, fluide et elle est très réactive.',
    name: 'Une collaboration fluide',
    company: 'Projet de startup studio',
  },
]

export const navItems = [
  { label: 'Nos offres', href: '/v3/offres' },
  { label: 'Réalisations', href: '/v3/projets' },
  { label: 'À propos', href: '/v3/a-propos' },
  { label: 'Contact', href: '/v3/contact' },
]

export const pageTitles: Record<string, string> = {
  offres: 'Nos offres',
  projets: 'Nos réalisations',
  'a-propos': 'À propos du studio',
  contact: 'Parlons de votre projet',
  methode: 'Notre méthode',
  expertises: 'Nos expertises',
  solutions: 'Nos solutions',
  manifeste: 'Notre manifeste',
  'mentions-legales': 'Mentions légales',
  'politique-de-confidentialite': 'Politique de confidentialité',
  cgv: 'Conditions générales',
}
