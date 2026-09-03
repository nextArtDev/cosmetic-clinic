import prisma from '@/lib/prisma'
import { PersonnelColumn } from './components/columns'
import { PersonnelClient } from './components/PersonnelClient'

const Personnel = async () => {
  const personnel = await prisma.personnel.findMany({
    where: {},
  })

  const formattedPersonnel: PersonnelColumn[] = personnel.map((item) => ({
    id: item.id,
    name: item.fullName,

    position: item.position,
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PersonnelClient data={formattedPersonnel} />
      </div>
    </div>
  )
}

export default Personnel
