import prisma from '@/lib/prisma'

interface getAllReviewsProps {
  page?: number
  pageSize?: number
}
export const getAllReviews = async (params: getAllReviewsProps) => {
  const { page = 1, pageSize = 30 } = params
  const skipAmount = (page - 1) * pageSize

  try {
    const allCompleteReviews = await prisma.review.findMany({
      where: {},
      include: {
        // user: true,
        author: true,
      },
      skip: skipAmount,
      take: pageSize,

      orderBy: {
        createdAt: 'desc',
      },
    })

    const totalReviews = await prisma.review.count()
    // console.log('totalReviews', totalReviews)

    // Calculate if there are more questions to be fetched
    // console.log('totalReviews', totalReviews)
    // console.log('skipAmount', skipAmount)

    const isNext = totalReviews > skipAmount + allCompleteReviews.length
    return { review: allCompleteReviews.flat() || [], isNext }
  } catch (error) {
    console.error(error)
  }
}
