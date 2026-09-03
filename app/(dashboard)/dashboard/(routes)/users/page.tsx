import prisma from '@/lib/prisma'
import { UserColumn } from './components/columns'
import { UsersClient } from './components/UsersClient'

const Users = async () => {
  const users = await prisma.user.findMany({
    where: { role: 'user' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      isActive: true,
    },
  })

  const formattedUsers: UserColumn[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phoneNumber,
    isActive: user.isActive,
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UsersClient data={formattedUsers} />
      </div>
    </div>
  )
}

export default Users