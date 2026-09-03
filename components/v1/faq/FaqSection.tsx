'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { V1Faq } from '@/lib/v1/data'

interface FaqSectionProps {
  faqs: V1Faq[]
}

export function FaqSection({ faqs }: FaqSectionProps) {
  return (
    <section className="mx-auto max-w-3xl px-4">
      <h2 className="v1-title-gradient mb-8 text-center text-2xl font-bold md:text-4xl">
        سؤالات پرتکرار
      </h2>

      <div className="v1-glass v1-shadow rounded-2xl p-4">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f) => (
            <AccordionItem key={f.id} value={f.id} className="border-black/10">
              <AccordionTrigger className="py-4 text-sm font-bold text-teal-900 md:text-base">
                {f.question}
              </AccordionTrigger>
              <AccordionContent className="text-black/70">
                {f.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
