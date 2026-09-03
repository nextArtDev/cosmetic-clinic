import Image from 'next/image'
import { CheckCircle2, Star } from 'lucide-react'

type TimelineEntry = {
  id: string
  date: string
  description: string
  isEspecial: boolean
  images: { url: string }[]
}

export function PatientTimeline({
  entries,
}: {
  entries: TimelineEntry[]
}) {
  return (
    <section className="glass-panel p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ivory">تایم‌لاین درمانی</h2>
          <p className="mt-1 text-sm text-ivory-dim">
            مراحل درمان و ویزیت‌هایی که دکتر برای شما ثبت کرده است.
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-glass-border p-8 text-center text-sm text-ivory-dim">
          هنوز رکوردی در پروندهٔ درمانی شما ثبت نشده است.
        </p>
      ) : (
        <ol className="mt-8 space-y-0 border-r border-glass-border pr-6">
          {entries.map((entry) => (
            <li key={entry.id} className="relative pb-8 last:pb-0">
              <span className="absolute -right-[30px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-sage/50 bg-ink text-sage-mist">
                <CheckCircle2 size={9} />
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-gold-soft">
                  {entry.date}
                </span>
                {entry.isEspecial && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] text-gold-soft">
                    <Star size={10} className="fill-gold" /> ویژه
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ivory">
                {entry.description}
              </p>
              {entry.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {entry.images.map((img, i) => (
                    <Image
                      key={i}
                      src={img.url}
                      alt="مستند درمانی"
                      width={96}
                      height={72}
                      className="h-18 w-24 rounded-xl border border-glass-border object-cover"
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
