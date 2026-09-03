'use client'
import { Button } from '@/components/ui/button'

import { cn, formUrlQuery } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { FC, useState } from 'react'

interface GlobalFiltersProps {
  filters: {
    name: string
    value: string
  }[]
}

const GlobalFilters: FC<GlobalFiltersProps> = ({ filters }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const typeParams = searchParams.get('type')
  const [active, setActive] = useState(typeParams || '')

  const handleTypeClick = (item: string) => {
    if (active === item) {
      setActive('')
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'type',
        value: null,
      })
      router.push(newUrl, { scroll: false })
    } else {
      setActive(item)
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'type',
        value: item.toLowerCase(),
      })
      router.push(newUrl, { scroll: false })
    }
  }
  return (
    <div className=" flex items-center gap-1 px-1">
      <div className="flex flex-col   gap-1">
        <p className="font-semibold text-black/70">فیلتر</p>
        <article className="flex flex-wrap gap-0.5">
          {filters.map((item) => (
            <Button
              key={item.value}
              size={'sm'}
              onClick={() => handleTypeClick(item.value)}
              className={cn('rounded-full ')}
              variant={active === item.value ? 'destructive' : 'secondary'}
            >
              {item.name}
            </Button>
          ))}
        </article>
      </div>
    </div>
  )
}

export default GlobalFilters
