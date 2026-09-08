/**
 * /v11 mock store — single in-memory store per server process, shared by
 * the demo and subscribe API routes (same pattern as /v10's mock store,
 * minus persistence; the showcasemd original used drizzle/postgres).
 * When v11 goes live, delete this module and give the routes a real
 * Prisma client.
 */

type MockDemoRequest = {
  name: string
  clinic: string
  phone: string
  screens: number
  createdAt: string
}

const globalForV11 = globalThis as typeof globalThis & {
  __v11DemoRequests?: MockDemoRequest[]
  __v11Subscribers?: { email: string; createdAt: string }[]
}

export const mockDemoRequests = (globalForV11.__v11DemoRequests ??= [])
export const mockSubscribers = (globalForV11.__v11Subscribers ??= [])

export function countDemoRequests(): number {
  return mockDemoRequests.length
}

/** Phone number sanity for Iranian mobile/landline inputs (mock-grade). */
export function phoneIsValid(phone: string): boolean {
  return /^0\d{9,10}$/.test(phone.replace(/[\s-]/g, ''))
}
