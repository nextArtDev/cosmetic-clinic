import prisma from '@/lib/prisma'
import { FaqClient } from './components/FaqClient'
import { FaqColumn } from './components/columns'

const Faq = async () => {
  const faq = await prisma.fAQ.findMany({
    where: {},
  })

  const formattedFaq: FaqColumn[] = faq.map((item) => ({
    id: item.id,
    question: item.question,

    answer: item?.answer,

    // createdAt: format(item.created_at, 'dd MMMM yyyy'),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <FaqClient data={formattedFaq} />
      </div>
    </div>
  )
}

export default Faq
