// ---------------------------------------------------------------------------
// Mock data layer.
//
// Shapes here intentionally mirror the Prisma schema (DoctorProfile,
// Specialization, Illness, Personnel, Department, Review) so that swapping
// this module for real `prisma.*.findMany()` calls later is a drop-in
// replacement — components consume the exported types, not Prisma's.
// ---------------------------------------------------------------------------

export interface Department {
  id: string;
  name: string;
  iconName: string;
}

export interface Specialization {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  order: number;
}

export interface Illness {
  id: string;
  slug: string;
  name: string;
  description: string;
  symptoms: string[];
  specializationSlugs: string[];
  doctorSlugs: string[];
}

export interface DoctorScheduleBlock {
  dayOfWeek: number; // 0 Sun .. 6 Sat
  startTime: string;
  endTime: string;
}

export interface Doctor {
  profileId: string;
  slug: string;
  name: string;
  title: string;
  credentials: string;
  brief: string;
  bio: string;
  departmentSlug: string;
  specializationSlugs: string[];
  primarySpecializationSlug: string;
  illnessSlugs: string[];
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  languages: string[];
  slotDurationMinutes: number;
  consultFee: number;
  schedule: DoctorScheduleBlock[];
  nextAvailable: string;
  imageQuery: string;
}

export interface Personnel {
  id: string;
  fullName: string;
  position: string;
  department: string;
  bio: string;
  order: number;
}

export interface Testimonial {
  id: string;
  patientName: string;
  doctorSlug: string;
  rating: number;
  text: string;
  visitReason: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------
export const departments: Department[] = [
  { id: "dep-cardio", name: "Cardiology", iconName: "HeartPulse" },
  { id: "dep-derma", name: "Dermatology", iconName: "Sparkles" },
  { id: "dep-peds", name: "Pediatrics", iconName: "Baby" },
  { id: "dep-ortho", name: "Orthopedics", iconName: "Bone" },
  { id: "dep-intmed", name: "Internal Medicine", iconName: "Stethoscope" },
];

// ---------------------------------------------------------------------------
// Specializations
// ---------------------------------------------------------------------------
export const specializations: Specialization[] = [
  {
    id: "spec-cardiology",
    slug: "cardiology",
    name: "Cardiology",
    shortName: "Heart & Vascular",
    description:
      "Diagnosis and long-term management of heart rhythm, blood pressure, and vascular conditions, from first consultation through ongoing care.",
    iconName: "HeartPulse",
    order: 1,
  },
  {
    id: "spec-dermatology",
    slug: "dermatology",
    name: "Dermatology",
    shortName: "Skin & Aesthetics",
    description:
      "Medical and cosmetic dermatology covering chronic skin conditions, acne, and preventative skin health.",
    iconName: "Sparkles",
    order: 2,
  },
  {
    id: "spec-pediatrics",
    slug: "pediatrics",
    name: "Pediatrics",
    shortName: "Child Health",
    description:
      "Attentive, unhurried care for infants through adolescents, including growth monitoring and chronic condition management.",
    iconName: "Baby",
    order: 3,
  },
  {
    id: "spec-orthopedics",
    slug: "orthopedics",
    name: "Orthopedics",
    shortName: "Joint & Mobility",
    description:
      "Non-surgical and pre/post-surgical care for joints, bones, and mobility, with a focus on returning patients to full movement.",
    iconName: "Bone",
    order: 4,
  },
  {
    id: "spec-internal-medicine",
    slug: "internal-medicine",
    name: "Internal Medicine",
    shortName: "Whole-Body Care",
    description:
      "Comprehensive adult primary care — the coordinating discipline for complex or overlapping conditions.",
    iconName: "Stethoscope",
    order: 5,
  },
  {
    id: "spec-neurology",
    slug: "neurology",
    name: "Neurology",
    shortName: "Brain & Nerve",
    description:
      "Evaluation and treatment of headache disorders, nerve conditions, and cognitive health concerns.",
    iconName: "BrainCircuit",
    order: 6,
  },
];

// ---------------------------------------------------------------------------
// Doctors (5)
// ---------------------------------------------------------------------------
export const doctors: Doctor[] = [
  {
    profileId: "doc-elena-voss",
    slug: "dr-elena-voss",
    name: "Dr. Elena Voss",
    title: "Senior Cardiologist",
    credentials: "MD, FACC — Board Certified in Cardiovascular Disease",
    brief:
      "Specializes in preventive cardiology and long-term hypertension management with a calm, data-driven approach.",
    bio: "Dr. Voss trained at Heidelberg and completed her cardiovascular fellowship in Boston before joining Meridian. She believes the best cardiology is quiet cardiology — catching risk years before it becomes an event. Her patients describe her as unhurried, precise, and reassuring.",
    departmentSlug: "dep-cardio",
    specializationSlugs: ["cardiology", "internal-medicine"],
    primarySpecializationSlug: "cardiology",
    illnessSlugs: ["hypertension", "type-2-diabetes", "gerd"],
    rating: 4.9,
    reviewCount: 214,
    yearsExperience: 17,
    languages: ["English", "German"],
    slotDurationMinutes: 30,
    consultFee: 240,
    schedule: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "13:00" },
      { dayOfWeek: 3, startTime: "08:00", endTime: "13:00" },
      { dayOfWeek: 4, startTime: "14:00", endTime: "18:00" },
    ],
    nextAvailable: "Tomorrow, 9:30 AM",
    imageQuery: "professional female cardiologist portrait studio",
  },
  {
    profileId: "doc-marcus-webb",
    slug: "dr-marcus-webb",
    name: "Dr. Marcus Webb",
    title: "Orthopedic Specialist",
    credentials: "MD, FAAOS — Board Certified in Orthopedic Surgery",
    brief:
      "Focuses on non-surgical joint care, sports injuries, and post-operative rehabilitation planning.",
    bio: "Formerly the attending physician for a national athletics program, Dr. Webb brings a movement-first philosophy to every consult — surgery is the last option, not the first. He works closely with physiotherapy to build recovery plans patients can actually follow.",
    departmentSlug: "dep-ortho",
    specializationSlugs: ["orthopedics"],
    primarySpecializationSlug: "orthopedics",
    illnessSlugs: ["osteoarthritis", "migraine"],
    rating: 4.8,
    reviewCount: 176,
    yearsExperience: 14,
    languages: ["English"],
    slotDurationMinutes: 30,
    consultFee: 220,
    schedule: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "12:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "14:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "12:00" },
    ],
    nextAvailable: "Today, 4:00 PM",
    imageQuery: "professional male orthopedic doctor portrait studio",
  },
  {
    profileId: "doc-priya-anand",
    slug: "dr-priya-anand",
    name: "Dr. Priya Anand",
    title: "Consultant Dermatologist",
    credentials: "MD, DipDerm — Board Certified in Dermatology",
    brief:
      "Treats chronic skin conditions and adult acne with an emphasis on minimal, sustainable regimens.",
    bio: "Dr. Anand's practice sits at the intersection of medical and cosmetic dermatology, but her approach is deliberately restrained — she prescribes the smallest regimen that will work, and explains exactly why. Patients return for the clarity as much as the results.",
    departmentSlug: "dep-derma",
    specializationSlugs: ["dermatology"],
    primarySpecializationSlug: "dermatology",
    illnessSlugs: ["eczema", "acne", "seasonal-allergies"],
    rating: 5.0,
    reviewCount: 302,
    yearsExperience: 11,
    languages: ["English", "Hindi"],
    slotDurationMinutes: 20,
    consultFee: 190,
    schedule: [
      { dayOfWeek: 1, startTime: "10:00", endTime: "16:00" },
      { dayOfWeek: 2, startTime: "10:00", endTime: "16:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "12:00" },
    ],
    nextAvailable: "Tomorrow, 11:20 AM",
    imageQuery: "professional female dermatologist portrait studio",
  },
  {
    profileId: "doc-sofia-marin",
    slug: "dr-sofia-marin",
    name: "Dr. Sofia Marín",
    title: "Pediatric Specialist",
    credentials: "MD, FAAP — Board Certified in Pediatrics",
    brief:
      "Provides attentive, unhurried care for infants through teens, including asthma and allergy management.",
    bio: "Dr. Marín spends the first minutes of every appointment on the floor, not behind a desk — she believes trust with a child determines the quality of every exam that follows. Parents consistently note how much time she takes to explain, not just treat.",
    departmentSlug: "dep-peds",
    specializationSlugs: ["pediatrics"],
    primarySpecializationSlug: "pediatrics",
    illnessSlugs: ["asthma", "seasonal-allergies", "eczema"],
    rating: 4.9,
    reviewCount: 258,
    yearsExperience: 9,
    languages: ["English", "Spanish"],
    slotDurationMinutes: 25,
    consultFee: 180,
    schedule: [
      { dayOfWeek: 0, startTime: "08:30", endTime: "13:00" },
      { dayOfWeek: 1, startTime: "13:00", endTime: "18:00" },
      { dayOfWeek: 3, startTime: "08:30", endTime: "13:00" },
    ],
    nextAvailable: "Today, 2:45 PM",
    imageQuery: "professional female pediatrician portrait studio",
  },
  {
    profileId: "doc-daniel-osei",
    slug: "dr-daniel-osei",
    name: "Dr. Daniel Osei",
    title: "Internal Medicine & Neurology",
    credentials: "MD, PhD — Board Certified in Internal Medicine",
    brief:
      "Coordinates complex, overlapping conditions and manages chronic headache and nerve disorders.",
    bio: "With a PhD in neurophysiology alongside his clinical degree, Dr. Osei is often the physician other doctors refer their hardest diagnostic puzzles to. He is known for reading every page of a patient's history before the first appointment even begins.",
    departmentSlug: "dep-intmed",
    specializationSlugs: ["internal-medicine", "neurology"],
    primarySpecializationSlug: "internal-medicine",
    illnessSlugs: ["migraine", "anxiety-disorder", "gerd", "type-2-diabetes"],
    rating: 4.9,
    reviewCount: 189,
    yearsExperience: 20,
    languages: ["English", "French", "Twi"],
    slotDurationMinutes: 40,
    consultFee: 260,
    schedule: [
      { dayOfWeek: 2, startTime: "08:00", endTime: "12:00" },
      { dayOfWeek: 3, startTime: "13:00", endTime: "17:00" },
      { dayOfWeek: 5, startTime: "08:00", endTime: "11:00" },
    ],
    nextAvailable: "In 2 days, 8:20 AM",
    imageQuery: "professional male doctor portrait studio confident",
  },
];

// ---------------------------------------------------------------------------
// Illnesses (10)
// ---------------------------------------------------------------------------
export const illnesses: Illness[] = [
  {
    id: "ill-hypertension",
    slug: "hypertension",
    name: "Hypertension",
    description:
      "A chronic condition where blood pressure against artery walls stays persistently elevated, raising long-term risk to the heart and vessels if left unmanaged.",
    symptoms: ["Often symptomless", "Headaches", "Shortness of breath", "Nosebleeds"],
    specializationSlugs: ["cardiology", "internal-medicine"],
    doctorSlugs: ["dr-elena-voss"],
  },
  {
    id: "ill-type-2-diabetes",
    slug: "type-2-diabetes",
    name: "Type 2 Diabetes",
    description:
      "A metabolic condition in which the body becomes resistant to insulin or doesn't produce enough, leading to elevated blood sugar over time.",
    symptoms: ["Increased thirst", "Fatigue", "Frequent urination", "Slow-healing wounds"],
    specializationSlugs: ["internal-medicine", "cardiology"],
    doctorSlugs: ["dr-elena-voss", "dr-daniel-osei"],
  },
  {
    id: "ill-migraine",
    slug: "migraine",
    name: "Migraine",
    description:
      "A neurological condition causing recurring, often severe headaches, frequently paired with light sensitivity, nausea, or visual disturbance.",
    symptoms: ["Throbbing pain", "Light and sound sensitivity", "Nausea", "Visual aura"],
    specializationSlugs: ["neurology", "orthopedics"],
    doctorSlugs: ["dr-daniel-osei", "dr-marcus-webb"],
  },
  {
    id: "ill-eczema",
    slug: "eczema",
    name: "Eczema",
    description:
      "A chronic inflammatory skin condition causing dry, itchy, and irritated patches, often flaring in response to environment or stress.",
    symptoms: ["Dry, scaly patches", "Intense itching", "Redness", "Skin thickening"],
    specializationSlugs: ["dermatology", "pediatrics"],
    doctorSlugs: ["dr-priya-anand", "dr-sofia-marin"],
  },
  {
    id: "ill-asthma",
    slug: "asthma",
    name: "Asthma",
    description:
      "A respiratory condition in which airways narrow and swell, making breathing difficult — commonly triggered by allergens, exercise, or cold air.",
    symptoms: ["Wheezing", "Chest tightness", "Shortness of breath", "Persistent cough"],
    specializationSlugs: ["pediatrics", "internal-medicine"],
    doctorSlugs: ["dr-sofia-marin"],
  },
  {
    id: "ill-osteoarthritis",
    slug: "osteoarthritis",
    name: "Osteoarthritis",
    description:
      "The gradual breakdown of joint cartilage, leading to stiffness and pain that typically worsens with age or repetitive strain.",
    symptoms: ["Joint stiffness", "Swelling", "Reduced range of motion", "Grinding sensation"],
    specializationSlugs: ["orthopedics"],
    doctorSlugs: ["dr-marcus-webb"],
  },
  {
    id: "ill-seasonal-allergies",
    slug: "seasonal-allergies",
    name: "Seasonal Allergies",
    description:
      "An immune response to airborne allergens such as pollen, causing recurring symptoms tied to specific times of year.",
    symptoms: ["Sneezing", "Itchy eyes", "Congestion", "Postnasal drip"],
    specializationSlugs: ["dermatology", "pediatrics"],
    doctorSlugs: ["dr-priya-anand", "dr-sofia-marin"],
  },
  {
    id: "ill-anxiety-disorder",
    slug: "anxiety-disorder",
    name: "Anxiety Disorder",
    description:
      "A persistent pattern of excessive worry or physical tension that interferes with daily functioning, treatable through a combined care approach.",
    symptoms: ["Restlessness", "Racing heartbeat", "Difficulty concentrating", "Sleep disruption"],
    specializationSlugs: ["internal-medicine", "neurology"],
    doctorSlugs: ["dr-daniel-osei"],
  },
  {
    id: "ill-acne",
    slug: "acne",
    name: "Acne",
    description:
      "A common skin condition caused by clogged hair follicles, resulting in breakouts that can affect confidence as much as skin health.",
    symptoms: ["Whiteheads and blackheads", "Papules and pustules", "Oily skin", "Scarring"],
    specializationSlugs: ["dermatology"],
    doctorSlugs: ["dr-priya-anand"],
  },
  {
    id: "ill-gerd",
    slug: "gerd",
    name: "Acid Reflux (GERD)",
    description:
      "A digestive condition where stomach acid regularly flows back into the esophagus, causing irritation and discomfort after eating.",
    symptoms: ["Heartburn", "Regurgitation", "Chest discomfort", "Difficulty swallowing"],
    specializationSlugs: ["internal-medicine"],
    doctorSlugs: ["dr-elena-voss", "dr-daniel-osei"],
  },
];

// ---------------------------------------------------------------------------
// Personnel (12)
// ---------------------------------------------------------------------------
export const personnel: Personnel[] = [
  { id: "per-1", fullName: "Rosalind Achebe", position: "Practice Manager", department: "Administration", bio: "Oversees day-to-day clinic operations and quality standards.", order: 1 },
  { id: "per-2", fullName: "Tomasz Kaczmarek", position: "Head Nurse", department: "Nursing", bio: "Leads the nursing team across all departments.", order: 2 },
  { id: "per-3", fullName: "Amara Chukwu", position: "Registered Nurse", department: "Cardiology", bio: "Supports cardiology consults and monitoring.", order: 3 },
  { id: "per-4", fullName: "Liesel Brandt", position: "Registered Nurse", department: "Pediatrics", bio: "Specializes in pediatric patient comfort and care.", order: 4 },
  { id: "per-5", fullName: "Hana Fujimori", position: "Front Desk Lead", department: "Reception", bio: "First point of contact for every patient visit.", order: 5 },
  { id: "per-6", fullName: "Idris Malik", position: "Patient Coordinator", department: "Reception", bio: "Manages scheduling and appointment logistics.", order: 6 },
  { id: "per-7", fullName: "Camille Dubois", position: "Lab Technician", department: "Diagnostics", bio: "Runs bloodwork and diagnostic panels on-site.", order: 7 },
  { id: "per-8", fullName: "Nathaniel Rhee", position: "Radiology Technician", department: "Diagnostics", bio: "Operates imaging equipment and supports scans.", order: 8 },
  { id: "per-9", fullName: "Ingrid Solberg", position: "Clinical Pharmacist", department: "Pharmacy", bio: "Reviews prescriptions and advises on interactions.", order: 9 },
  { id: "per-10", fullName: "Rafael Ortega", position: "Physiotherapist", department: "Orthopedics", bio: "Builds recovery plans alongside orthopedic care.", order: 10 },
  { id: "per-11", fullName: "Beatrix Adeyemi", position: "Clinical Nutritionist", department: "Wellness", bio: "Advises on diet plans for chronic condition management.", order: 11 },
  { id: "per-12", fullName: "Soren Lindqvist", position: "Patient Concierge", department: "Guest Services", bio: "Coordinates the private-suite patient experience.", order: 12 },
];

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------
export const testimonials: Testimonial[] = [
  {
    id: "test-1",
    patientName: "Margaret H.",
    doctorSlug: "dr-elena-voss",
    rating: 5,
    text: "Dr. Voss caught a pattern in my readings my previous doctor had missed for years. I've never felt more informed about my own health.",
    visitReason: "Hypertension follow-up",
  },
  {
    id: "test-2",
    patientName: "James O.",
    doctorSlug: "dr-marcus-webb",
    rating: 5,
    text: "I expected to be told I needed surgery. Instead I got a plan, a physiotherapist, and my knee back within three months.",
    visitReason: "Knee pain consultation",
  },
  {
    id: "test-3",
    patientName: "Priyanka S.",
    doctorSlug: "dr-priya-anand",
    rating: 5,
    text: "The most straightforward dermatologist I've seen — no upsell, just a routine that actually worked within weeks.",
    visitReason: "Adult acne treatment",
  },
  {
    id: "test-4",
    patientName: "Aiden & Lucy R.",
    doctorSlug: "dr-sofia-marin",
    rating: 5,
    text: "Our son used to dread appointments. Now he asks when he gets to see Dr. Marín again.",
    visitReason: "Pediatric asthma management",
  },
  {
    id: "test-5",
    patientName: "Wei C.",
    doctorSlug: "dr-daniel-osei",
    rating: 5,
    text: "Three specialists before him couldn't connect the dots. Dr. Osei did in one appointment.",
    visitReason: "Chronic migraine evaluation",
  },
  {
    id: "test-6",
    patientName: "Fatima N.",
    doctorSlug: "dr-elena-voss",
    rating: 4,
    text: "Booking online took two minutes and the reminder texts meant I never had to think about it again.",
    visitReason: "Annual cardiac screening",
  },
];

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------
export const faqs: Faq[] = [
  {
    id: "faq-1",
    question: "How quickly can I get an appointment?",
    answer:
      "Most patients are seen within 48 hours. Same-day slots open daily at 7 AM for urgent concerns.",
  },
  {
    id: "faq-2",
    question: "Do I need a referral to book a specialist?",
    answer:
      "No referral is required. You can book directly with any of our specialists through the doctor's profile page.",
  },
  {
    id: "faq-3",
    question: "What happens after I book online?",
    answer:
      "You'll receive an instant confirmation and a reminder 24 hours before your visit, with the option to reschedule freely up to 12 hours ahead.",
  },
  {
    id: "faq-4",
    question: "Is telehealth available?",
    answer:
      "Select consultations, particularly follow-ups, can be conducted virtually — this option appears automatically at booking when eligible.",
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------
export const getDoctorBySlug = (slug: string) => doctors.find((d) => d.slug === slug);
export const getSpecializationBySlug = (slug: string) => specializations.find((s) => s.slug === slug);
export const getIllnessBySlug = (slug: string) => illnesses.find((i) => i.slug === slug);
export const getDoctorsBySpecialization = (slug: string) =>
  doctors.filter((d) => d.specializationSlugs.includes(slug));
export const getDoctorsByIllness = (slug: string) => doctors.filter((d) => d.illnessSlugs.includes(slug));
export const getIllnessesBySpecialization = (slug: string) =>
  illnesses.filter((i) => i.specializationSlugs.includes(slug));
export const getTestimonialsByDoctor = (slug: string) =>
  testimonials.filter((t) => t.doctorSlug === slug);
export const getDepartmentBySlug = (id: string) => departments.find((d) => d.id === id);
