# Demo Mode — how to enable for demos and revert for production

`DEMO_MODE` is a single environment flag that makes the whole booking flow
work for a customer demo without real SMS or a real payment gateway.

> **Production checklist:** set `DEMO_MODE="false"` (or remove the line) in the
> VPS `.env`, restart the app (`pm2 restart ...` / redeploy). Everything below
> then runs the real code paths again — no code changes are required.

---

## 1. What demo mode changes

| # | Behavior in demo | Real behavior when off |
|---|------------------|------------------------|
| 1 | OTP login accepts the fixed code **123456** for any phone number | Random 6-digit OTP per login |
| 2 | No SMS is sent at all (Meli Payamak is skipped) | OTP + notification SMS via Meli Payamak |
| 3 | ZarinPal is skipped: "پرداخت" auto-approves through the real callback flow (lock → attempt → order Paid → booking confirmed → SMS), so it works on a bare public IP like `http://94.183.176.101` | Real ZarinPal request/verify (sandbox in dev, live when `NODE_ENV=production`) |

The flag also shows a small "Demo mode — OTP is always 123456" hint on both
sign-in pages.

## 2. Enable for a demo

In the demo environment's `.env` (on the VPS — it is **not** in the repo):

```env
DEMO_MODE="true"
# make sure the app URL matches how the customer reaches the demo:
NEXT_PUBLIC_APP_URL="http://94.183.176.101"
NEXT_PUBLIC_BETTER_AUTH_URL="http://94.183.176.101"
BETTER_AUTH_URL="http://94.183.176.101"
```

Then redeploy/restart. If the demo DB needs data, run the seed once against
that DB:

```bash
npm run db:seed   # ⚠️ wipes and re-creates the demo appointments/reviews/FAQs — never run on real data
```

## 3. Files involved (for reference)

| File | Change |
|------|--------|
| `lib/demo.ts` | NEW — reads `DEMO_MODE` / defines `DEMO_OTP_CODE = '123456'` |
| `lib/auth.ts` | In `sendOTP`: when `DEMO_MODE`, overwrites better-auth's stored `Verification.value` with `123456:0` |
| `lib/sms.ts` | `sendOtpSms`: when `DEMO_MODE`, logs and returns ok without calling Meli Payamak |
| `lib/actions/payment.ts` | `zarinpalPayment`: fake `DEMO…` authority + redirect to the real callback with `Status=OK`; `zarinpalPaymentApproval` / `reconcilePendingZarinpalPayment`: skip remote verification in demo |
| `app/(home)/(chrome)/signin/page.tsx`, `app/v1/signin/page.tsx`, both `sign-in-form.tsx` | Optional `demoHint` prop renders the 123456 hint |
| `.env` | `DEMO_MODE="true"` |

Reverting the code is optional — leaving `lib/demo.ts` in the codebase is
harmless while the env flag is off. If you want a fully clean diff later,
remove `DEMO_MODE`/`DEMO_OTP_CODE` imports from the files above and delete
`lib/demo.ts`.

## 4. Going live on production (VPS `.env`)

1. **Kill demo mode**
   ```env
   DEMO_MODE="false"
   ```
2. **Real SMS** — when you receive the Meli Payamak credentials, fill:
   ```env
   MELI_PAYAMAK_USERNAME="..."
   MELI_PAYAMAK_PASSWORD="..."
   MELI_PAYAMAK_FROM="..."
   ```
   `lib/sms.ts` already sends the OTP to
   `https://rest.payamak-panel.com/api/SendSMS/SendOtp` — nothing else to do.
   (Booking *notification* SMS in `lib/actions/sms.ts` is still a no-op stub;
   wire the same provider there when needed.)
3. **Real payments**
   - Put the real merchant UUID in `ZARINPAL_KEY=` (the demo placeholder
     `lkakakadjshduosjdfskjgidlsjahdjsitjd` must be replaced).
   - Sandbox vs live is derived from `NODE_ENV`: dev → sandbox.zarinpal.com,
     `NODE_ENV=production` → payment.zarinpal.com (live). With demo mode off,
     the app verifies payments server-side via `PaymentVerification`.
   - Whitelist the production callback domain in the ZarinPal panel and set
     `NEXT_PUBLIC_APP_URL` to the public **https** domain — ZarinPal requires
     a reachable callback; that is exactly why raw-IP demos need demo mode.
4. Restart the app and do one end-to-end test (login → booking → payment →
   confirmation SMS) with a real card, then check the `Order`/`PaymentDetails`
   rows.

## 5. Security warning

`DEMO_MODE="true"` lets **anyone log in as any phone number** with `123456`
(including the seeded admin `usr_dr_fazeli` if they know the number) and gives
free confirmed bookings. Never leave it enabled on a production deployment.
