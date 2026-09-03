import { Link2 } from 'lucide-react'
import Link from 'next/link'

interface UserBookingCardProps {
  doctorName?: string
  day: string
  time?: string
  status?: {
    label: string
    className: string
  }
  paymentHref?: string
}

function UserBookingCard({
  doctorName,
  day,
  time,
  status,
  paymentHref,
}: UserBookingCardProps) {
  return (
    <div className="gradient-base h-40 w-40 rounded-xl p-3 text-center text-secondary">
      <div className="flex h-full w-full flex-col items-center justify-evenly gap-1 rounded-lg text-black/70">
        {status && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.className}`}
          >
            {status.label}
          </span>
        )}
        <p className="text-xs font-semibold md:text-sm">
          {doctorName ? `دکتر ${doctorName}` : ''}
        </p>
        <p className="text-red-500">{day}</p>
        <p>{time && time}</p>
        {paymentHref && (
          <Link
            href={paymentHref}
            className="flex items-center gap-1 rounded-lg bg-teal-800 px-3 py-1 text-[10px] font-bold text-white shadow transition-transform hover:scale-[1.03]"
          >
            <Link2 size={11} />
            ادامهٔ پرداخت
          </Link>
        )}
      </div>
    </div>
  )
}

export default UserBookingCard
