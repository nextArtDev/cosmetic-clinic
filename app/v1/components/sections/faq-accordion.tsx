'use client'

import * as Accordion from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'
import { Reveal } from '../../components/motion/reveal'
import { cn } from '@/lib/utils'
import type { Faq } from '../../lib/data'

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-28">
      <Reveal>
        <p className="text-center font-mono text-xs uppercase tracking-[0.16em] text-gold-soft">
          سؤالات پرتکرار
        </p>
        <h2 className="mt-3 text-center font-display text-4xl text-ivory md:text-5xl">
          قبل از رزرو نوبت
        </h2>
      </Reveal>

      <Accordion.Root
        type="single"
        collapsible
        className="mt-14 flex flex-col gap-3"
      >
        {faqs.map((f) => (
          <Accordion.Item
            key={f.id}
            value={f.id}
            className="glass-panel overflow-hidden px-6"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left font-display text-lg text-ivory">
                {f.question}
                <Plus
                  size={18}
                  className="shrink-0 text-gold-soft transition-transform duration-300 group-data-[state=open]:rotate-45"
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content
              className={cn(
                'overflow-hidden text-sm leading-relaxed text-ivory-dim',
                'data-[state=open]:animate-[accordion-down_0.3s_ease-out] data-[state=closed]:animate-[accordion-up_0.3s_ease-out]',
              )}
            >
              <p className="pb-5 pr-8">{f.answer}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  )
}
