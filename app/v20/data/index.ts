import { IRANFIT_MOCK } from "./mock";
import type { IranfitContent } from "./types";

/**
 * Single data seam for the IRANFIT landing.
 *
 * Upstream read these from Postgres via Drizzle (falling back to the bundled
 * mock). This app's database must stay untouched, so — the same pattern as
 * /v17 and /v18 — the loader serves the bundled mock directly and the page
 * never breaks.
 *
 * TODO(prisma-swap): when you move to your own backend, keep the returned
 * `IranfitContent` shape and just reimplement this function with your
 * Prisma client. No component needs to change.
 */
export async function getIranfitContent(): Promise<IranfitContent> {
  return IRANFIT_MOCK;
}
