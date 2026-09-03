import Image from 'next/image'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Sparkles,
  Star,
  Wallet,
  Banknote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelineEntry } from '@/components/timeline/timeline'

export type VisitNode =
  | {
      kind: 'appointment'
      id: string
      sortKey: string
      weekdayLabel: string
      dateLabel: string
      timeLabel: string
      doctorName: string
      reason?: string
      status: string
      statusLabel: string
      paid: boolean
      upcoming: boolean
    }
  | {
      kind: 'treatment'
      id: string
      sortKey: string
      dateLabel: string
      description: string
      isEspecial: boolean
      images: { url: string }[]
    }

/** Merge appointment visits + treatment records into Timeline entries. */
export function buildVisitEntries(nodes: VisitNode[]): TimelineEntry[] {
  return nodes.map((node) =>
    node.kind === 'appointment'
      ? {
          id: `visit-${node.id}`,
          title: node.dateLabel,
          content: <AppointmentCard node={node} />,
        }
      : {
          id: `treatment-${node.id}`,
          title: node.dateLabel,
          content: <TreatmentCard node={node} />,
        },
  )
}

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'border-sage/50 bg-sage/15 text-sage-bright',
  BOOKING_CONFIRMED: 'border-gold/50 bg-gold/15 text-gold-soft',
  PAYMENT_PENDING: 'border-amber-400/50 bg-amber-400/10 text-amber-300',
  CANCELLED: 'border-rose-400/50 bg-rose-500/10 text-rose-300',
  NO_SHOW: 'border-zinc-400/40 bg-zinc-500/10 text-zinc-300',
  CASH: 'border-sky-400/50 bg-sky-500/10 text-sky-300',
}

function AppointmentCard({
  node,
}: {
  node: Extract<VisitNode, { kind: 'appointment' }>
}) {
  return (
    <div className="glass-panel p-5 transition-colors duration-300 hover:border-gold/40 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              node.upcoming
                ? 'bg-gradient-to-br from-sage to-sage-bright text-ink'
                : 'bg-gradient-to-br from-ink-elevated to-ink-soft text-ivory-dim',
            )}
          >
            <CalendarDays size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-base text-ivory">
              {node.doctorName}
            </p>
            <p className="truncate text-xs text-ivory-dim">
              {node.reason || 'ویزیت زیبایی'}
            </p>
          </div>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold',
            STATUS_STYLES[node.status] ??
              'border-glass-border bg-glass-bg text-ivory-dim',
          )}
        >
          {node.upcoming ? (
            <Sparkles size={11} />
          ) : (
            <CheckCircle2 size={11} />
          )}
          {node.statusLabel}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-glass-border pt-4 text-xs text-ivory-dim">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={13} className="text-gold-soft" />
          {node.weekdayLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} className="text-gold-soft" />
          ساعت {node.timeLabel}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5',
            node.paid ? 'text-sage-bright' : 'text-amber-300',
          )}
        >
          {node.paid ? <Banknote size={13} /> : <Wallet size={13} />}
          {node.paid ? 'پرداخت شده' : 'پرداخت نشده'}
        </span>
      </div>
    </div>
  )
}

function TreatmentCard({
  node,
}: {
  node: Extract<VisitNode, { kind: 'treatment' }>
}) {
  return (
    <div className="glass-panel p-5 transition-colors duration-300 hover:border-gold/40 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              node.isEspecial
                ? 'bg-gradient-to-br from-gold to-gold-soft text-ink'
                : 'bg-gradient-to-br from-ink-elevated to-ink-soft text-ivory-dim',
            )}
          >
            <Star size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-base text-ivory">ثبت درمان / ویزیت</p>
            <p className="text-xs text-ivory-dim">{node.dateLabel}</p>
          </div>
        </div>

        {node.isEspecial && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold text-gold-soft">
            <Star size={11} className="fill-gold text-gold" />
            درمان ویژه
          </span>
        )}
      </div>

      <p className="mt-4 border-t border-glass-border pt-4 text-sm leading-relaxed text-ivory/90">
        {node.description}
      </p>

      {node.images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {node.images.map((img, i) => (
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
    </div>
  )
}
