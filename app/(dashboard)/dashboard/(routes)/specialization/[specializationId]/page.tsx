import React from 'react'

import prisma from '@/lib/prisma'
import SpecializationForm from './components/SpecializationForm'

const SpecializationPage = async ({
  params,
}: {
  params: Promise<{ specializationId: string }>
}) => {
  const specializationId = (await params).specializationId

  // "new" is the create route, not an existing record — skip the DB lookup
  const specialization =
    specializationId === 'new'
      ? null
      : await prisma.specialization.findUnique({
          where: {
            id: specializationId,
          },
          //Because array of images is separate model we have to include it, because we want row of url's not array of id's
          include: {
            // doctors: true,
            illnesses: true,
            images: true,
          },
        })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SpecializationForm
          initialData={specialization}
          // illnesses={illnesses}
          // doctor={doctor}
        />
      </div>
    </div>
  )
}

export default SpecializationPage
