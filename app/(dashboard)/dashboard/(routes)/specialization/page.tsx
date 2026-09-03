import { format } from 'date-fns-jalali'

import prisma from '@/lib/prisma'
import { SpecializationColumn } from './components/columns'
import { SpecializationClient } from './components/SpecializationClient'

const ProductsPage = async () => {
  const specialization = await prisma.specialization.findMany({
    where: {},
    //we include them to access them like individual objects and for example we can show them in table
    include: {
      doctors: true,
      illnesses: true,
      images: true,
    },
    // orderBy: {
    //   createdAt: 'desc',
    // },
  })
  const formattedSpecialization: SpecializationColumn[] = specialization.map(
    (item) => ({
      id: item.id,
      name: item.name,
      // description: item?.description,
      // specialization: item.specialization.id,

      //Because its Decimal in prisma model, we have to convert it to number by "toNumber"
      // booking: item.bookings.booking_time,
      // reviews: {item.reviews.name ,item.reviews.text , item.reviews.rating },
      createdAt: format(item.createdAt, 'dd MMMM yyyy'),
    }),
  )

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SpecializationClient data={formattedSpecialization} />
      </div>
    </div>
  )
}

export default ProductsPage
