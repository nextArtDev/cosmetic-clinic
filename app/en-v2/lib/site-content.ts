export const navigation = [
  { label: "About me", href: "#about" },
  { label: "Health view", href: "#health" },
  { label: "Process", href: "#process" },
  { label: "Type of consultation", href: "#online" },
  { label: "Clients", href: "#clients" },
  { label: "Availability", href: "#availability" },
];

export const services = [
  { label: "Facial and body skin", title: "Personalized advice on selecting products and treatments for healthy, glowing skin.", image: 1 },
  { label: "Selection of creams", title: "Personalized recommendations for cosmetics that are perfect for your skin type.", image: 2 },
  { label: "Anti-age", title: "Modern methods and approaches to fighting age-related skin changes and slowing down the aging process.", image: 3 },
  { label: "Nutrition", title: "Nutritional tips for maintaining inner harmony and a beautiful appearance.", image: 4 },
  { label: "Body care", title: "Comprehensive advice on how to care for your body skin to keep it healthy and supple.", image: 5 },
];

export const processSteps = [
  { title: "Request submission", text: "You fill out a short form providing basic details about yourself and your skincare concerns." },
  { title: "Payment", text: "After your request is reviewed, choose a convenient payment method to confirm your consultation." },
  { title: "Questionnaire", text: "Complete a detailed pre-consultation form to help personalize your skincare recommendations." },
  { title: "Consultation", text: "We begin by discussing your needs and goals. Then, I analyze your skin condition and recommend the most suitable products and treatments. All recommendations consider your location, budget, and specific concerns.", note: "Up to 1 hour. Pre-consultation preparation is based on your request and questionnaire." },
  { title: "Follow-up support", text: "Stay in touch! If needed, we can schedule additional consultations for further adjustments." },
];

export const consultationTypes = [
  {
    id: "general", title: "General long-term counseling", duration: "Up to 60 minutes", price: "From $150",
    description: "A complete picture of your skin, your health, and a routine that works for you.",
    details: [
      { title: "Product analysis", text: "I evaluate your current skincare and cosmetic products, analyzing their suitability for your skin type and concerns. We decide what to keep, adjust, or replace." },
      { title: "Skin assessment", text: "A professional analysis of your skin type and its current condition, considering hydration, sensitivity, and specific concerns." },
      { title: "Cosmetic history", text: "We discuss previous products and treatments, and their effects, to understand what really works best for you." },
      { title: "Personalized routine", text: "A customized skincare and treatment plan, including new product recommendations and adjustments to your existing routine." },
      { title: "Health background", text: "Your overall health, allergies, environment, and lifestyle all help shape recommendations that are right for you." },
      { title: "Final recommendations", text: "I research products available in your area. Your detailed written recommendations follow within 24 hours of the consultation." },
    ],
  },
  {
    id: "targeted", title: "Consultation on specific issues", duration: "Focused online session", price: "Personalized care",
    description: "Clear, targeted guidance for a specific concern, without starting from scratch.",
    details: [
      { title: "Identifying the issue", text: "An assessment of your specific skin concern—dryness, hypersensitivity, sun exposure, or pigmentation—to understand its possible causes." },
      { title: "Personalized solution", text: "Targeted product and treatment recommendations, with an explanation of ingredients, frequency of use, and duration." },
      { title: "Adjustment & optimization", text: "Choose a new solution or refine your existing skincare routine by adjusting how and when you use your products." },
    ],
  },
  {
    id: "follow-up", title: "Interim consultation", duration: "Follow-up online session", price: "Ongoing support",
    description: "A thoughtful check-in to keep your skincare journey moving in the right direction.",
    details: [
      { title: "Interim consultation", text: "We assess progress and refine previous recommendations so your skincare and wellness plan evolves with your needs." },
      { title: "Assessment & adjustment", text: "Review your results, discuss changes, and make thoughtful adjustments with a stronger focus on your overall well-being." },
      { title: "Personalized optimization", text: "I refine product usage, adjust treatments, and consider dietary changes to enhance long-term effectiveness while maintaining balance." },
    ],
  },
];

export const testimonials = [
  { name: "Olya", concern: "Chin breakout", image: "olya.png", quote: "I found a specialist who first identifies the root cause—and only then gives a solution.", text: "I woke up one morning and noticed a breakout on my chin. After searching for answers online, I wrote to Anna. She asked just one simple question and told me exactly what to do. To my surprise, everything cleared up in less than a day. The treatment she prescribed was both effective and affordable.", video: "https://player.vimeo.com/video/1073973293?h=b98c24f0fc" },
  { name: "Nikolai", concern: "Irritated skin", image: "nikolai.png", quote: "After just two uses, the redness, dryness, and itching went away.", text: "After using the cosmetic set Anna recommended, his face looks so much better. Even the irritation in the beard area seems to be fading. Thank you so much for such attentive and effective care!" },
  { name: "Valentina", concern: "Skin confidence", image: "valentina.png", quote: "I’m 38 and absolutely happy with the quality of my skin.", text: "Anna has been my favorite cosmetologist for over five years. She knows how to combine affordable and professional products to achieve an excellent result. Her medical background and understanding of ingredients give me a very high level of trust.", video: "https://player.vimeo.com/video/1073970042?h=3cf8a242a7" },
  { name: "Masha", concern: "Remote results", image: "masha.png", quote: "Wherever I am in the world, I know I can turn to Anna.", text: "Our consultations have moved online, and they are truly amazing. We regularly update my skincare routine for my location, climate, and weather. With each passing day, my skin looks better and better.", video: "https://player.vimeo.com/video/1073968811?h=9af2e809b9" },
  { name: "Daria", concern: "Sensitive skin", image: "daria.png", quote: "You take an individual approach and pay attention to every little detail.", text: "With my sensitive skin, I am cautious about trying anything new. Anna explains everything so thoroughly and clearly, taking all the nuances into account. I’m very happy to have met her and would love to stay in touch." },
  { name: "Tetyana", concern: "Skin recovery", image: "tetyana.png", quote: "Your guidance helped me finally feel comfortable in my skin.", text: "I want to thank you for the consultation and the advice that helped me with a major issue. With your guidance on nutrition and cosmetic products, everything improved. I continue to follow your recommendations.", video: "https://player.vimeo.com/video/1073971047?h=3f17ee734c" },
  { name: "Anna", concern: "Rosacea flare-up", image: "anna.png", quote: "The result exceeded all expectations. It was a true game changer.", text: "Living in the UK, I needed a routine with products that were actually available here. Anna carefully reviewed all the options and treated my case with great attention. My skin has significantly improved since our first consultation." },
  { name: "Oleg", concern: "Energy & well-being", image: "oleg.png", quote: "A kind, responsive professional who looks at the whole picture.", text: "Anna clearly explained my condition and gave specific recommendations for my diet, exercise, and lifestyle. A comprehensive approach made a real difference to how I feel each day." },
  { name: "Kateryna", concern: "Postpartum skin recovery", image: "kateryna.png", quote: "Thorough, detailed care—in a format that worked for a new mom.", text: "Anna evaluated the products I already had at home and suggested some thoughtful additions. It was both economical and environmentally conscious. I easily found the recommended products and am extremely happy with the results.", video: "https://player.vimeo.com/video/1073963009?h=e6bb3fa3c2" },
  { name: "Maria", concern: "Holistic care", image: "maria.png", quote: "A fascinating journey into your skin and the way your body works.", text: "Professionalism, a science-based approach, and extensive experience. Anna’s fully holistic view helps her select targeted products. I have never met a more attentive and knowledgeable professional." },
];

export const faqs = [
  { question: "What services do you offer in online counseling?", answer: "I offer personalized skincare analysis, treatment planning, product recommendations, and guidance on non-invasive techniques. You receive a tailored routine that suits your skin type, concerns, and lifestyle, with safe, scientifically grounded advice." },
  { question: "How does the online consultation process work?", answer: "Start by filling out the consultation form. We will arrange a convenient time and send a pre-consultation questionnaire. During our video call, we discuss your goals, analyze your skin, and review your routine. A written plan follows within 24 hours." },
  { question: "What are the advantages of online consultations?", answer: "Expert care from anywhere, without travel or long waiting times. You can show the products you actually use, ask questions in a comfortable setting, and receive recommendations tailored to your location and available resources." },
  { question: "How do I choose the right cosmetic procedure for my skin?", answer: "It starts with understanding your skin’s current state and your long-term goals. During a consultation, I assess your skin, lifestyle, and sensitivities, then suggest suitable non-invasive treatments that support its natural regeneration." },
  { question: "How often should skincare recommendations be updated?", answer: "Your skin changes with the seasons, stress, hormones, and age. Reassess your plan every 2–3 months, or sooner if you notice changes, to keep your routine effective, gentle, and aligned with your needs." },
  { question: "Can you help me choose a clinic in another country?", answer: "I help you evaluate professional credentials, hygiene standards, and treatment options. Together, we identify procedures that match your goals and support continuity of care, wherever you are." },
  { question: "Do you offer skincare consultations for men?", answer: "Yes. Common concerns include shaving irritation, breakouts, skin aging, and building a simple but effective routine. Every recommendation is personalized—healthy, comfortable skin does not need an overly complicated routine." },
];
