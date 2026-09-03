import { Phone } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
  telLinkNumber: string
  phone: string
  className?: string
}

function PhoneLink({ telLinkNumber, phone, className }: Props) {
  return (
    <Link className={className} href={telLinkNumber}>
      <p className="font-semibold underline underline-offset-2 py-2 flex items-center justify-center ga-0.5">
        <span>{phone}</span>
        <Phone className="w-4" />
      </p>
    </Link>
  )
}

export default PhoneLink
