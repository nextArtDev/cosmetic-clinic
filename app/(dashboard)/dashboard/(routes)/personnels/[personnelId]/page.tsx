import prisma from '@/lib/prisma'
import PersonnelForm, {
  PersonnelFormInitialData,
} from './components/PersonnelForm'

const PersonnelPage = async ({
  params,
}: {
  params: Promise<{ personnelId: string }>
}) => {
  const personnelId = (await params).personnelId
  if (personnelId === 'new') {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <PersonnelForm
            initialData={null}
            // departments={specializations}
          />
        </div>
      </div>
    )
  }
  const personnel = await prisma.personnel.findUnique({
    where: {
      id: personnelId,
    },
    //Because array of images is separate model we have to include it, because we want row of url's not array of id's
    include: {
      images: true,
    },
  })

  // console.log(personnel)
  const initialData: PersonnelFormInitialData = {
    userId: personnel?.userId || '',
    fullName: personnel?.fullName || '',
    email: personnel?.email || '',
    phoneNumber: personnel?.phoneNumber || null,
    bio: personnel?.bio || '',
    position: personnel?.position || '',
    order: personnel?.order || 0,

    // departmentId: personnel?.departmentId || null,
    isActive: personnel?.isActive || false,
    hiredAt:
      personnel?.hiredAt?.toISOString() ||
      personnel?.createdAt?.toISOString() ||
      null,
    images:
      personnel?.images?.map((img) => ({
        id: img.id,
        url: img.url,
      })) || [],
  }
  // const specializations = await prisma.specialization.findMany({})
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PersonnelForm
          initialData={initialData}
          // departments={specializations}
        />
      </div>
    </div>
  )
}

export default PersonnelPage
