import prisma from '@/lib/prisma'
import FaqForm from './components/FaqForm'

const FaqPage = async ({ params }: { params: Promise<{ faqId: string }> }) => {
  const faqId = (await params).faqId

  const faq = await prisma.fAQ.findUnique({
    where: {
      id: faqId,
    },
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <FaqForm initialData={faq} />
      </div>
    </div>
  )
}

export default FaqPage
