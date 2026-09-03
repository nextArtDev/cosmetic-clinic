import React from 'react'

import prisma from '@/lib/prisma'
import IllnessForm from './components/IllnessForm'

const IllnessPage = async ({
  params,
}: {
  params: Promise<{ illnessId: string }>
}) => {
  const illnessId = (await params).illnessId
  const illness = await prisma.illness.findUnique({
    where: {
      id: illnessId,
    },
    //Because array of images is separate model we have to include it, because we want row of url's not array of id's
    include: {
      images: true,
      doctors: {
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      specializations: true,
    },
  })

  const specialization = await prisma.specialization.findMany({
    // where: {
    //   doctors: { some: { id: +params.doctorId } },
    // },
  })
  const doctor = await prisma.doctorProfile.findMany({
    // where: {
    //   doctors: { some: { id: +params.doctorId } },
    // },
    include: {
      doctor: {
        select: {
          id: true,

          name: true,
        },
      },
    },
  })
  const doctorInitial = doctor.map((d) => {
    return { id: d.doctor.id, name: d.doctor.name }
  })
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <IllnessForm
          initialData={illness}
          specialization={specialization}
          doctor={doctorInitial}
        />
      </div>
    </div>
  )
}

export default IllnessPage
