export type InquiryInput = { name: string; phone: string; residence: string; preferredTime: string };

// Demo persistence for the /v17 Privy experience. The upstream port used a
// Drizzle/Postgres table; here it is a zero-DB in-memory adapter with the
// exact same contract the API route expects (UUID id + 60-second duplicate
// window), so the cosmetic-clinic database, Prisma schema and migrations are
// not touched at all. Replace this file with a real Prisma-backed adapter
// when the concept route goes beyond demo.
const recent = new Map<string, { id: string; createdAt: number }>();

export async function saveInquiry(input: InquiryInput) {
  const hit = recent.get(input.phone);
  if (hit && Date.now() - hit.createdAt < 60_000) return { duplicate: true as const, id: hit.id };
  const id = crypto.randomUUID();
  recent.set(input.phone, { id, createdAt: Date.now() });
  return { duplicate: false as const, id };
}
