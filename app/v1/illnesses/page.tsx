import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PageHeader } from '../components/layout/page-header'
import { StaggerGroup, StaggerItem } from '../components/motion/reveal'
import { getIllnesses } from '../lib/data'

export const metadata: Metadata = {
  title: 'بیماری‌ها | کلینیک ۴۰۴',
  description:
    'بیماری‌های تحت درمان کلینیک ۴۰۴ را مرور کنید و از روی علائم، متخصص مناسب را پیدا کنید.',
}

export default async function IllnessesPage() {
  const illnesses = await getIllnesses()

  return (
    <>
      <PageHeader
        eyebrow="بیماری‌های تحت درمان"
        title="از روی آنچه حس می‌کنید جستجو کنید، نه فقط نام پزشک."
        description="هر بیماریِ زیر به پزشکانی که بیشتر آن را درمان می‌کنند متصل شده است؛ پس می‌توانید از علائم شروع کنید و در نهایت به متخصص درست برسید."
      />

      <section className="mx-auto max-w-5xl px-6 pb-28">
        <StaggerGroup
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          stagger={0.05}
        >
          {illnesses.map((illness) => (
            <StaggerItem key={illness.slug}>
              <Link
                href={`/illnesses/${illness.slug}`}
                className="group glass-panel flex h-full flex-col p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display text-xl text-ivory">
                    {illness.name}
                  </h2>
                  <ArrowUpRight
                    size={16}
                    className="mt-1 shrink-0 text-ivory-dim opacity-0 transition-all group-hover:opacity-100 group-hover:text-gold"
                  />
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ivory-dim">
                  {illness.description}
                </p>
                {illness.symptoms.length > 0 && (
                  <p className="mt-5 border-t border-glass-border pt-4 text-xs text-sage-mist">
                    {illness.symptoms.slice(0, 3).join(' · ')}
                  </p>
                )}
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </>
  )
}
