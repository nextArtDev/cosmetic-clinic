import { format } from 'date-fns-jalali'

import { Heading } from '@/components/dashboard/Heading'
import { Separator } from '@/components/ui/separator'

import { Columns, CommentColumn } from './components/columns'
import { DataTable } from '@/components/dashboard/DataTable'
import { getAllReviews } from '../../lib/actions/review'

async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const page = params.page ? +params.page : 1
  const pageSize = params.pageSize ? +params.pageSize : 50

  const comments = await getAllReviews({ page, pageSize })

  const formattedComments: CommentColumn[] = comments!.review.map((item) => ({
    id: item.id,
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    name: item.author?.name!,
    comment: item?.comment,
    shouldBePublished: item.isApproved,
    createdAt: format(item.createdAt, 'dd MMMM yyyy'),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title={`کامنت‌ها (${formattedComments?.length})`}
          description="کامنتها را مدیریت کنید."
        />

        <Separator />
        {comments?.review?.length && !!formattedComments && (
          <DataTable
            searchKey="comment"
            columns={Columns}
            data={formattedComments}
            pageNumber={page ? +page : 1}
            pageSize={pageSize}
            isNext={comments.isNext}
          />
        )}
        <Separator />
      </div>
    </div>
  )
}

export default page
