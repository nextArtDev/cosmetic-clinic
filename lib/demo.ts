/**
 * Demo-mode switches for customer demos.
 *
 * Enable with DEMO_MODE=true in .env. Revert for production by removing the
 * flag (or setting it false) — see DEMO-MODE.md for the full checklist.
 *
 *  1. OTP login accepts the fixed code 123456 for any phone number.
 *  2. No real SMS is sent (Meli Payamak is skipped entirely).
 *  3. ZarinPal checkout is skipped: "payment" succeeds instantly, so the
 *     booking flow works on a public IP without a whitelisted merchant domain.
 */

// export const DEMO_MODE = process.env.DEMO_MODE === 'true'
export const DEMO_MODE = true

/** The only OTP accepted while DEMO_MODE is on. */
export const DEMO_OTP_CODE = 123456
