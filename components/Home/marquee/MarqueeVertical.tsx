import { cn } from '@/lib/utils'
import { Marquee } from './Marquee'
import { Separator } from '@/components/ui/separator'
import { StarRating } from '../StarRating'

const reviews = [
  {
    name: 'احمد رسولی',
    username: '2 روز پیش',
    body: '  دکتر خوبی هستند.',
    rating: 5,
  },
  {
    name: 'مریم امیری',
    username: '1 هفته پیش',
    body: 'از زحمات دکتر کلانتری تشکر می‌کنم.',
    rating: 5,
  },
  {
    name: 'علی محمدی',
    username: '2 ساعت پیش',
    body: 'دکتر بسیار خوش برخوردی هستند.',
    rating: 4,
  },
  {
    name: 'نگار محمدی',
    username: '2 دقیقه پیش',
    body: 'دکتر خیلی خوبی هستند.',
    rating: 5,
  },
]

const firstRow = reviews.slice(0, reviews.length / 2)
const secondRow = reviews.slice(reviews.length / 2)

const ReviewCard = ({
  rating,
  name,
  username,
  body,
}: {
  rating?: number
  name: string
  username: string
  body: string
}) => {
  return (
    <figure
      className={cn(
        'relative flex flex-col justify-evenly !py-4 gap-2 text-[rebeccapurple] h-auto w-[45vw] cursor-pointer overflow-hidden rounded-xl border p-2',
        'border-black-950/[.1]  bg-black/30 backdrop-blur-md glass hover:bg-black-950/[.05]'
        // // light styles
        // 'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
        // // dark styles
        // 'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]'
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-col items-center gap-2 justify-center w-full">
          <StarRating
            value={rating}
            disabled
            iconProps={{
              className: 'size-4 fill-yellow-300 stroke-yellow-500',
            }}
          />
          <blockquote className=" text-sm pb-4">{body}</blockquote>
          <Separator />
          <div className="w-full h-full mt-auto flex items-center justify-around flex-wrap">
            <span className="pt-1 text-xs font-medium text-black/60">
              {name}
            </span>
            <p className="text-left text-xs font-medium text-black/40">
              {username}
            </p>
          </div>
        </div>
      </div>
    </figure>
  )
}

export function MarqueeDemoVertical() {
  return (
    <div className="relative flex h-[500px] w-full flex-row items-center justify-center overflow-hidden text-center  bg-white md:shadow-xl">
      <Marquee
        pauseOnHover
        vertical
        className="[--duration:20s] text-center   backdrop-blur-sm"
      >
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee
        reverse
        pauseOnHover
        vertical
        className="[--duration:20s] text-center   backdrop-blur-sm"
      >
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/5 bg-transparent  backdrop-blur-[1px]"></div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-transparent  backdrop-blur-[1px]"></div>
    </div>
  )
}
