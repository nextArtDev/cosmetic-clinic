import { format } from 'date-fns-jalali'
import prisma from '@/lib/prisma'
import { IllnessColumn } from './components/columns'
import { IllnessesClient } from './components/IllnessClient'

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) => {
  const pageSize = 20

  const searchPageParams = (await searchParams).page

  const page = searchPageParams ? +searchPageParams : 1
  const skipAmount = (page - 1) * pageSize

  const illnesses = await prisma.illness.findMany({
    // where: {},
    //we include them to access them like individual objects and for example we can show them in table
    include: {
      // doctors: true,
      specializations: true,
      images: true,
    },
    skip: skipAmount,
    take: pageSize,
  })
  const totalIllnesses = await prisma.illness.count()
  const isNext = totalIllnesses > skipAmount + illnesses.length

  const formattedIllnesses: IllnessColumn[] = illnesses.map((item) => ({
    id: item.id,
    name: item.name,
    description: item?.description,
    // specialization: item.specialization.id,
    // images: item.images.url.map((ur) => ur),
    //Because its Decimal in prisma model, we have to convert it to number by "toNumber"
    // booking: item.bookings.booking_time,
    // reviews: {item.reviews.name ,item.reviews.text , item.reviews.rating },
    createdAt: format(item.createdAt, 'dd MMMM yyyy'),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <IllnessesClient
          data={formattedIllnesses}
          pageNumber={searchPageParams ? +searchPageParams : 1}
          isNext={isNext}
        />
      </div>
    </div>
  )
}

export default ProductsPage
