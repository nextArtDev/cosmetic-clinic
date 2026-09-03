import { cn } from '@/lib/utils'
import Image from 'next/image'
import React from 'react'

type Props = {
  title: string
  className?: string
}

function NotAddedYet({ title, className }: Props) {
  return (
    <article
      className={cn(
        'w-full h-screen flex flex-col gap-4 items-center justify-center',
        className
      )}
    >
      <figure className="bg-transparent relative w-36 h-36">
        <Image
          fill
          sizes="100%"
          src={'/v1/images/question.png'}
          alt="No Item Found"
          className="object-cover"
        />
      </figure>
      <p className=" text-muted text-base md:text-2xl">
        هنوز هیچ {title} اضافه نشده است!
      </p>
    </article>
  )
}

export default NotAddedYet
