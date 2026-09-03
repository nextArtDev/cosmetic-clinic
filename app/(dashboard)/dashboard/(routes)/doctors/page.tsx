import prisma from '@/lib/prisma'
import { DoctorColumn } from './components/columns'
import { DoctorsClient } from './components/DoctorClient'

const DoctorPage = async () => {
  const doctors = await prisma.doctorProfile.findMany({
    where: {},
    //we include them to access them like individual objects and for example we can show them in table
    include: {
      doctor: {
        include: {
          reviewsReceived: true,
          images: true,
        },
      },
      // bookings: true,
      // images: true,
    },
    // orderBy: {
    //   createdAt: 'desc',
    // },
  })

  const formattedDoctors: DoctorColumn[] = doctors.map((item) => ({
    id: item.doctor.id,
    name: item.doctor.name,
    // phone: item?.phone,
    // website: item?.website,
    // main_image: item?.main_image,
    // open_time: item?.open_time,
    // close_time: item?.close_time,
    description: item?.doctor.name,
    // specialization: item.specialization.id,
    // images: item.images.url.map((ur) => ur),
    //Because its Decimal in prisma model, we have to convert it to number by "toNumber"
    // price: +formatter.format(item.price),
    // booking: item.bookings.booking_time,
    // reviews: {item.reviews.name ,item.reviews.text , item.reviews.rating },
    // createdAt: format(item.created_at, 'dd MMMM yyyy'),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DoctorsClient data={formattedDoctors} />
      </div>
    </div>
  )
}

export default DoctorPage
