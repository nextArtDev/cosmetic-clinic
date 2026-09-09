/**
 * /v12 mock store — single in-memory store per server process, backing
 * the leads API route (the grind original used drizzle/postgres; here
 * it is a mock, no Prisma). When v12 goes live, delete this module and
 * give the route a real Prisma client.
 */

export type MockLead = {
  situation: string
  goal: string
  commitment: string
  name: string
  email: string
  createdAt: string
}

const globalForV12 = globalThis as typeof globalThis & {
  __v12Leads?: MockLead[]
}

export const mockLeads = (globalForV12.__v12Leads ??= [])

export function countLeads(): number {
  return mockLeads.length
}

/** Same sanity check as the original route, kept mock-grade. */
export function leadIsValid(lead: Partial<MockLead>): boolean {
  return (
    typeof lead.situation === 'string' &&
    typeof lead.goal === 'string' &&
    typeof lead.commitment === 'string' &&
    typeof lead.name === 'string' &&
    typeof lead.email === 'string' &&
    lead.situation.trim().length > 0 &&
    lead.goal.trim().length > 0 &&
    lead.commitment.trim().length > 0 &&
    lead.name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim())
  )
}
