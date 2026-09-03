'use client'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { translateGlobalSearchFiltersType } from '@/lib/utils'

import GlobalFilters from './GlobalFilters'
import { v1GlobalSearch } from '@/lib/v1/search'
import { GlobalSearchFilters } from '@/lib/v1/constants'

interface V1GlobalResultItem {
  title: string
  type: string
  id: string
}

const GlobalResult = () => {
  const searchParams = useSearchParams()

  const [result, setResult] = useState<V1GlobalResultItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const global = searchParams.get('global')
  const type = searchParams.get('type')

  useEffect(() => {
    const fetchResult = async () => {
      setResult([])
      setIsLoading(true)
      try {
        const res = await v1GlobalSearch({ query: global, type })
        setResult(JSON.parse(res))
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }

    if (global) fetchResult()
  }, [global, type])
  const renderLink = (type: string, id: string) => {
    switch (type) {
      case 'doctor':
        return `/v1/doctors/${id}`
      case 'specialization':
        return `/v1/specializations/${id}`
      case 'illness':
        return `/v1/illnesses/${id}`

      default:
        return '/v1'
    }
  }

  return (
    <div
      dir="rtl"
      className="absolute left-0 z-10 mt-3 w-full rounded-xl bg-muted/20  backdrop-blur-3xl py-5 shadow-sm"
    >
      <p className="px-5">
        <GlobalFilters filters={GlobalSearchFilters} />
      </p>
      <div className="my-5 h-[1px] bg-muted " />
      <div className="space-y-5">
        <p className="px-5  text-black/50">بهترین نتایج</p>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center px-5">
            <Loader2 size={40} className="animate-spin" />
            <p className="animate-pulse">جست‌وجوی همه</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 ">
            {result.length > 0 ? (
              result.map((item, index) => (
                <Link
                  href={renderLink(item.type, item.id)}
                  key={item.type + item.id + index}
                  className="flex w-full cursor-pointer items-start gap-3 px-5 py-1.5"
                >
                  <Image
                    src="/v1/icons/tag.svg"
                    alt="tags"
                    width={18}
                    height={18}
                    className="mt-1 object-contain"
                  />
                  <div className="flex flex-col">
                    <p className="line-clamp-1">{item.title}</p>
                    <p className="mt-1 text-black/80 font-bold">
                      در {translateGlobalSearchFiltersType(item.type)} ها
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center px-5 ">
                <p className="px-5 py-2.5">نتیجه‌ای یافت نشد!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GlobalResult
