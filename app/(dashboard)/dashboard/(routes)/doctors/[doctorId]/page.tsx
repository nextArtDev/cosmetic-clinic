import prisma from '@/lib/prisma'
import DoctorForm, { DoctorFormInitialData } from './components/DoctorForm'

const DoctorPage = async ({
  params,
}: {
  params: Promise<{ doctorId: string }>
}) => {
  const doctorId = (await params).doctorId
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId: doctorId,
    },
    //Because array of images is separate model we have to include it, because we want row of url's not array of id's
    include: {
      specializations: true,
      illnesses: true,
      doctor: {
        include: {
          images: true,

          // specialization: true,

          // open_time: true,
        },
      },
      // bookings: true,
    },
  })

  const specializations = await prisma.specialization.findMany({
    // where: {
    //   doctors: { some: { id: params.doctorId } },
    // },
  })
  const initialData: DoctorFormInitialData = {
    userId: doctorProfile?.userId || '',
    name: doctorProfile?.doctor?.name || '',
    email: doctorProfile?.doctor?.email || '',
    phoneNumber: doctorProfile?.doctor?.phoneNumber || null,
    brief: doctorProfile?.brief || '',
    credentials: doctorProfile?.credentials || '',
    departmentId: doctorProfile?.departmentId || null,
    slotDurationMinutes: doctorProfile?.slotDurationMinutes || 30,
    isActive: doctorProfile?.isActive || false,
    specializationIds:
      doctorProfile?.specializations?.map((s) => s.specializationId) || [],
    primarySpecializationId:
      doctorProfile?.specializations?.find((s) => s.isPrimary)
        ?.specializationId || null,
    illnessIds: doctorProfile?.illnesses?.map((i) => i.id) || [],
    images:
      doctorProfile?.doctor?.images?.map((img) => ({
        id: img.id,
        url: img.url,
      })) || [],
  }
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DoctorForm
          initialData={initialData}
          specializations={specializations}
          illnesses={[]}
          departments={specializations}
        />
        {/* <DoctorForm initialData={doctor} specializations={specializations} /> */}
      </div>
    </div>
  )
}

export default DoctorPage
