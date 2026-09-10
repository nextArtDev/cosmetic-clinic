/**
 * /v14 mock store — single in-memory store per server process, shared by
 * the newsletter API route (same pattern as /v10 and /v11 mock stores; the
 * thegrind.nl original used a Webflow form / drizzle+postgres in the clone).
 * When v14 goes live, delete this module and give the route a real Prisma
 * client — the route keeps the same JSON contract ({ ok, error? }).
 */

type MockSubscriber = {
  email: string
  source: string
  createdAt: string
}

const globalForV14 = globalThis as typeof globalThis & {
  __v14Subscribers?: MockSubscriber[]
}

export const mockSubscribers = (globalForV14.__v14Subscribers ??= [])

export function countSubscribers(): number {
  return mockSubscribers.length
}
