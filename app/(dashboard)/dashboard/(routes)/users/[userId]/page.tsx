import prisma from '@/lib/prisma'
import UserForm, {
  UserFormInitialData,
} from './components/UserForm'

const UserPage = async ({
  params,
}: {
  params: Promise<{ userId: string }>
}) => {
  const userId = (await params).userId
  if (userId === 'new') {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <UserForm initialData={null} />
        </div>
      </div>
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  const initialData: UserFormInitialData | null = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        bio: user.bio || '',
        gender: user.gender || '',
        address: user.address || '',
        isActive: user.isActive,
      }
    : null

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UserForm initialData={initialData} />
      </div>
    </div>
  )
}

export default UserPage