import prisma from '@/lib/prisma'
import { ViewTransition } from 'react'
import {
  AnimatedAccordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './components/AnimatedAccordion'

// Same wrapper contract as the other (chrome) pages: a named "page" group
// lets the loading.tsx cover pair with this page's content so the page-wipe
// enter animation plays. A page without it pops in unnamed mid-transition.
export default async function FAQPage() {
  const faqs = await prisma.fAQ.findMany({
    orderBy: { order: 'asc' },
  })

  return (
    <ViewTransition
      name="page"
      share="page-wipe"
      enter="page-wipe"
      exit="page-wipe"
      default="none"
    >
      <section className="min-h-screen mx-auto h-full flex items-center justify-center max-xl w-[90svw] pt-20">
        {faqs.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            سوال متداولی برای نمایش وجود ندارد.
          </p>
        ) : (
          <AnimatedAccordion
            type="single"
            defaultValue={`faq-${faqs[0].id}`}
            accentColor="#8b5cf6"
          >
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </AnimatedAccordion>
        )}
      </section>
    </ViewTransition>
  )
}
