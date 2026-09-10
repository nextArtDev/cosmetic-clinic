export type DemoRequest = {
  intent: 'signup' | 'contact' | 'generate';
  name?: string;
  email?: string;
  plan?: string;
  prompt?: string;
};

// Demo persistence for the /v18 Melius experience. The upstream port saved
// into a Drizzle/Postgres table (melius_demo_requests); here it is a
// zero-DB in-memory adapter with the exact same contract the API route
// expects ({ id }), so the cosmetic-clinic database, Prisma schema and
// migrations are not touched at all — the same pattern as /v17. Replace this
// file with a real Prisma-backed adapter when the concept route goes beyond
// demo. Entries age out after 10 minutes; this is non-persistent by design.
const MAX_ENTRIES = 200;
const stored = new Map<string, DemoRequest & { createdAt: number }>();

export async function saveDemoRequest(input: DemoRequest) {
  const id = crypto.randomUUID();
  stored.set(id, { ...input, createdAt: Date.now() });
  if (stored.size > MAX_ENTRIES) {
    const oldest = [...stored.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
    if (oldest) stored.delete(oldest[0]);
  }
  return { id };
}
