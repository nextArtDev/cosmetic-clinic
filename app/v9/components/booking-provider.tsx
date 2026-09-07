'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AppointmentDialog } from './appointment-dialog'

const BookingContext = createContext<{ openBooking: (interest?: string) => void }>({
  openBooking: () => {},
})
export const useBooking = () => useContext(BookingContext)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<{ interest: string } | null>(null)
  const openBooking = useCallback((interest = 'visit') => setBooking({ interest }), [])
  const closeBooking = useCallback(() => setBooking(null), [])
  const context = useMemo(() => ({ openBooking }), [openBooking])
  return (
    <BookingContext.Provider value={context}>
      {children}
      <AnimatePresence>
        {booking && (
          <AppointmentDialog key="appointment" interest={booking.interest} onClose={closeBooking} />
        )}
      </AnimatePresence>
    </BookingContext.Provider>
  )
}
