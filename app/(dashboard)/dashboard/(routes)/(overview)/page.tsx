import { Heading } from '@/components/dashboard/Heading'
// import { Overview } from '@/components/dashboard/Overview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'

// import { getGraphRevenue } from '@/lib/queries/home'
// import { getGraphRevenue } from '@/lib/queries/dashboard/get-graph-revenue'
// import { getSalesCount } from '@/lib/queries/dashboard/get-sales-count'
// import { getStockCount } from '@/lib/queries/dashboard/get-stock-count'
// import { getTotalRevenue } from '@/lib/queries/dashboard/get-total-revenue'
// import { formatter } from '@/lib/utils/index'
import {
  BookHeart,
  GraduationCap,
  HeartHandshake,
  PenLine,
  Pill,
  Users,
} from 'lucide-react'
// import { LuCreditCard, LuDollarSign, LuPackage } from 'react-icons/lu'

const DashboardPage = async () => {
  const totalDoctorsPromise = prisma.doctorProfile.count()
  const totalSpecializationPromise = prisma.specialization.count()
  const getTotalIllnesses = prisma.illness.count({})
  const totalPersonnelPromise = prisma.personnel.count()
  const totalReviewsPromise = prisma.review.count()
  // const totalGraphRevenue = getGraphRevenue()
  const getTotalUsers = prisma.user.count({})

  const [
    totalDoctors,
    totalSpecialization,
    totalIllnesses,
    totalPersonnel,
    totalReviews,
    // graphRevenue,
    totalUsers,
  ] = await Promise.all([
    totalDoctorsPromise,
    totalSpecializationPromise,
    getTotalIllnesses,
    totalPersonnelPromise,
    totalReviewsPromise,
    // totalGraphRevenue,
    getTotalUsers,
  ])

  return (
    <div className=" flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="دشبورد" description="وضعیت کلی" />
        <Separator />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-col text-center gap-y-2 sm:gap-x-2 sm:text-right sm:flex-row items-center justify-evenly space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تعداد کاربر</CardTitle>
              <Users className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mt-8 text-lg md:text-2xl font-bold text-center text-red-500 ">
                {totalUsers} نفر
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-col text-center gap-y-2 sm:gap-x-2 sm:text-right sm:flex-row items-center justify-evenly space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تعداد پرسنل</CardTitle>

              <HeartHandshake className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mt-8 text-lg md:text-2xl font-bold text-center text-red-500 ">
                {totalPersonnel} نفر
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-col text-center gap-y-2 sm:gap-x-2 sm:text-right sm:flex-row items-center justify-evenly space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کادر درمان</CardTitle>

              <GraduationCap className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mt-8 text-lg md:text-2xl font-bold text-center text-red-500 ">
                {totalDoctors} نفر
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-col text-center gap-y-2 sm:gap-x-2 sm:text-right sm:flex-row items-center justify-evenly space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تعداد تخصص</CardTitle>
              <BookHeart className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mt-8 text-lg md:text-2xl font-bold text-center text-red-500 ">
                {totalSpecialization} تخصص
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-col text-center gap-y-2 sm:gap-x-2 sm:text-right sm:flex-row items-center justify-evenly space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                تعداد بیماری
              </CardTitle>

              <Pill className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mt-8 text-lg md:text-2xl font-bold text-center text-red-500 ">
                {totalIllnesses} بیماری
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-col text-center gap-y-2 sm:gap-x-2 sm:text-right sm:flex-row items-center justify-evenly space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تعداد نظرات</CardTitle>
              <PenLine className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mt-8 text-lg md:text-2xl font-bold text-center text-red-500 ">
                {totalReviews} نظر
              </div>
            </CardContent>
          </Card>
        </div>
        {/* <Card className="col-span-4">
          <CardHeader>
            <CardTitle>رزرو نوبت</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={graphRevenue} />
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}

export default DashboardPage
