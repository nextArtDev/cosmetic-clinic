'use client'

import { cn, formUrlQuery, removeKeysFromUrlQuery } from '@/lib/utils'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

interface LocalSearchbarProps {
  route: string
  iconPosition: string
  imgSrc: { src: string }
  otherClasses?: string
  placeholder?: string
}

const LocalSearchbar: FC<LocalSearchbarProps> = ({
  route,
  iconPosition,
  imgSrc,
  otherClasses,
  placeholder,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('q')

  const [search, setSearch] = useState(query || '')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: 'q',
          value: search,
        })
        router.push(newUrl, { scroll: false })
      } else if (pathname === route) {
        const newUrl = removeKeysFromUrlQuery({
          params: searchParams.toString(),
          keysToRemove: ['q'],
        })
        router.push(newUrl, { scroll: false })
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [search, route, pathname, router, searchParams, query])

  return (
    <article
      className={cn(
        'flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4  gradient-base-r',
        otherClasses,
      )}
    >
      {iconPosition === 'left' && (
        <Image
          src={imgSrc.src}
          alt="search icon"
          width={24}
          height={24}
          className="cursor-pointer"
        />
      )}
      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
        }}
        className="border-none outline-none text-primary-foreground "
      />
      {iconPosition === 'right' && (
        <Image
          src={imgSrc.src}
          alt="search icon"
          width={24}
          height={24}
          className="cursor-pointer"
        />
      )}
    </article>
  )
}

export default LocalSearchbar
