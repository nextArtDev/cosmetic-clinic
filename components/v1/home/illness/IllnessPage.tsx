import type { V1Illness } from '@/lib/v1/data'
import React from 'react'
import Image from 'next/image'

type Props = {
  illness: V1Illness
}

function IllnessPage({ illness }: Props) {
  return (
    <div>
      <div key={illness.id} className="px-4 py-10 pt-20 sm:px-6 lg:px-8  ">
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-8">
          <div className=" ">
            <Image
              unoptimized
              src={illness.imageUrl || '/v1/images/0000.webp'}
              width={400}
              height={400}
              alt={illness.name}
              className="mx-auto rounded-2xl mix-blend-hard-light object-cover"
            />
          </div>
          <div className="mt-10 flex-col text-justify xl:max-w-xl xl:mx-auto items-center justify-center  px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <div className="font-semibold pb-4 lg:text-lg text-blue-950 ">
              {illness.name}{' '}
            </div>
            <div className="text-black/60 lg:text-lg ">
              {' '}
              {illness.description}{' '}
            </div>
            {illness.symptoms.length > 0 && (
              <ul className="mt-6 list-disc list-inside space-y-2 text-black/60 lg:text-lg">
                {illness.symptoms.map((s, i) => (
                  <li key={`${s}-${i}`}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IllnessPage
