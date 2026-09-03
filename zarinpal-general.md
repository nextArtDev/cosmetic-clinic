# Zarinpal Payment — General Manual

A **reusable, project-agnostic** guide to integrating Iran's Zarinpal payment gateway into any
Next.js app (Pages/App Router) backed by a relational DB. It is distilled from two real projects
(`leather-shop-vps` — complete; `shafagh-04` — schema-only) and is intended to be copied into any
project and adapted. It is **not** tied to one codebase.

---

## 1. How Zarinpal works (the mental model)

Zarinpal is a **redirect gateway**. It never gives you the card details or the money directly —
instead:

1. Your **server** calls Zarinpal to **create a payment** → Zarinpal returns an **`authority`** id.
2. Your **server** redirects the user's **browser** to Zarinpal's hosted page
   (`zarinpal.com/pg/StartPay/{authority}`).
3. The user pays (or cancels) inside Zarinpal.
4. Zarinpal redirects the browser **back to your callback URL**, appending `Authority`, `Status`,
   and any query params you put in the callback URL.
5. Your **server** (inside that callback) **verifies** the transaction with Zarinpal **again**
   (server-to-server). Only a verify response of `100` (or `101`) means money actually moved.

> **Golden rule:** the browser-facing callback `Authority`/`Status` are **not proof of payment**.
> You must re-verify server-to-server and act only on the verify result.

### The two gateway calls (official v4 API)

| Call | Endpoint | Purpose |
|---|---|---|
| `request.json` | `POST {base}/request.json` | create a payment → `{ code, authority }` |
| `verify.json` | `POST {base}/verify.json` | confirm → `{ code, ref_id, card_hash, card_pan }` |
| `unVerified.json` | `POST {base}/unVerified.json` | list pending/abandoned payments |

Base URLs:

| | Live | Sandbox |
|---|---|---|
| Payment API | `https://payment.zarinpal.com/pg/v4/payment/` | `https://sandbox.zarinpal.com/pg/v4/payment/` |
| StartPay (redirect page) | `https://www.zarinpal.com/pg/StartPay/` | `https://sandbox.zarinpal.com/pg/StartPay/` |

### Response `code` semantics

| `code` | Meaning |
|---|---|
| **100** | Success. In verify: money settled → mark paid, store `ref_id`. |
| **101** | Already verified previously → treat as already-paid (idempotent). |
| others | Failed / cancelled / invalid (see `message`). |

---

## 2. Package & setup

Use the `zarinpal-checkout` wrapper (it wraps the v4 REST API above).

```bash
npm i zarinpal-checkout @types/zarinpal-checkout
```

### Environment variables

```env
# Merchant UUID from the Zarinpal dashboard (36 chars)
ZARINPAL_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Public origin of the app — used to build the callback URL
NEXT_PUBLIC_APP_URL="https://your-app.example.com"
```

There is **no** separate sandbox env flag — derive it from the environment:

```ts
const ZARINPAL_SANDBOX = process.env.NODE_ENV !== 'production';
```

---

## 3. Database schema (Prisma)

These models are what make the flow safe. All four are needed:

```prisma
// The thing being paid for (order / transaction). Holds Zarinpal's authority.
model Order {
  id            String        @id @default(uuid())
  amount        Float
  currency      String?                 // 'IRR' | 'IRT' | custom label
  paymentStatus PaymentStatus @default(Pending)
  authority     String?                 // Zarinpal authority while pending
  paidAt        DateTime?
  paymentDetails PaymentDetails?
  // …your own FKs (appointmentId, userId, …)
}

// Rich transaction record; stores Zarinpal ref_id after success.
model PaymentDetails {
  id            String @id @default(uuid())
  orderId       String @unique
  status        String?          // gateway code / semantic status
  Authority     String? @db.Text
  amount        Float?
  transactionId String?          // ← Zarinpal ref_id once paid
  userId        String
}

// ~5-min lock so two concurrent callbacks can't process the same order twice.
model PaymentLock {
  id        String   @id @default(uuid())
  orderId   String   @unique
  authority String
  expiresAt DateTime
}

// Replay protection: one row per (orderId, authority); a SUCCESS/USED one blocks re-pay.
model PaymentAttempt {
  id        String @id @default(uuid())
  orderId   String
  authority String
  status    String // 'PENDING' | 'SUCCESS' | 'FAILED' | 'USED'
  amount    Float
  @@unique([orderId, authority])
}

// Abuse guard: cap how often one user can initiate payments.
model PaymentRateLimit {
  id        String   @id @default(cuid())
  userId    String
  createdAt DateTime @default(now())
  @@index([userId, createdAt])
}

enum PaymentStatus {
  Pending
  Paid
  Failed
  Declined
  Cancelled
  Refunded
  PartiallyRefunded
  Chargeback
}
```

---

## 4. The flow — copy-paste building blocks

> The code below is representative. Adapt the imports (`@/lib/prisma`, `@/lib/auth-helpers`) and the
> fields to your own models. `'use server'` is App-Router server actions.

### 4.0 Gateway helper

```ts
import ZarinPalCheckout from 'zarinpal-checkout';

const createZarinpal = () => {
  const key = process.env.ZARINPAL_KEY;
  if (!key) throw new Error('ZARINPAL_KEY is not set');
  return ZarinPalCheckout.create(key, process.env.NODE_ENV !== 'production');
};
```

### 4.1 Request a payment (server action)

```ts
'use server';

export async function startPayment(orderId: string, userId: string) {
  const user = await getCurrentUser();              // auth guard
  if (!user?.id) return { errors: { _form: ['unauthorized'] } };

  await checkRateLimit(user.id);                     // abuse guard (4.7)

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.paymentStatus === 'Paid') return { errors: { _form: ['not found'] } };

  const zarinpal = createZarinpal();
  const callbackURL =
    (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000') +
    `/api/payment/callback?orderId=${order.id}`;

  const payment = await zarinpal.PaymentRequest({
    Amount:      Math.round(order.amount),
    CallbackURL: callbackURL,
    Description: `Payment for ${order.id}`,
    Mobile:      user.phoneNumber ?? undefined,
  });

  if (payment.status !== 100) return { errors: { _form: ['gateway rejected'] } };

  // Persist the authority BEFORE redirecting so reconciliation can find it later.
  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { authority: payment.authority } }),
    prisma.paymentDetails.upsert({
      where: { orderId: order.id },
      update: { status: String(payment.status), Authority: payment.authority },
      create: { orderId: order.id, userId: user.id, status: String(payment.status), Authority: payment.authority },
    }),
  ]);

  return { payment };                                // { status, authority, url } → client redirects
}
```

### 4.2 Client redirect

```tsx
'use client';
import { useEffect } from 'react';
import { useActionState } from 'react';
import { startPayment } from './actions';

export function PayButton({ orderId }) {
  const [state, action, pending] = useActionState(startPayment.bind(null, orderId), {});
  useEffect(() => { if (state?.payment?.url) window.location.href = state.payment.url; }, [state?.payment?.url]);
  return (
    <form action={action}>
      <button disabled={pending}>{pending ? 'Connecting…' : 'Pay'}</button>
    </form>
  );
}
```

### 4.3 Callback route

```ts
// app/api/payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from './actions'; // 4.4

export async function GET(request: NextRequest) {
  const sp = new URL(request.url).searchParams;
  const Authority = sp.get('Authority');
  const Status    = sp.get('Status');
  const orderId   = sp.get('orderId');

  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.redirect('/login');

  const result = await verifyPayment({ orderId, Authority, Status });
  const dest = new URL(`/orders/${orderId}`, request.url);

  if (result?.errors?._form?.[0]) { dest.searchParams.set('error', result.errors._form[0]); }
  else if (result?.success) { dest.searchParams.set('status', result.alreadyPaid ? 'already_paid' : 'success'); }
  else { dest.searchParams.set('error', 'payment_failed'); }

  return NextResponse.redirect(dest.toString());
}
```

### 4.4 Verify + secure "mark paid"

```ts
'use server';

export async function verifyPayment({ orderId, Authority, Status }) {
  await cleanupExpiredLocks();
  if (!(await acquirePaymentLock(orderId, Authority))) return { errors: { _form: ['busy'] } };

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { errors: { _form: ['not found'] } };
    if (order.paymentStatus === 'Paid') return { success: true, alreadyPaid: true };

    if (!(await validatePaymentAttempt(orderId, Authority, order.amount)))
      return { errors: { _form: ['invalid request'] } };

    if (Status !== 'OK') return { errors: { _form: ['cancelled'] } };

    const zarinpal = createZarinpal();
    const v = await zarinpal.PaymentVerification({ Amount: Math.round(order.amount), Authority });

    if (v.status !== 100) {
      await markAttempt(orderId, Authority, 'FAILED');
      return { errors: { _form: ['verification failed'] } };
    }

    await markOrderPaid({ orderId, refId: String(v.refId), authority: Authority, amount: order.amount });
    return { success: true };
  } finally {
    releasePaymentLock(orderId);
  }
}
```

**`markOrderPaid` — the single, idempotent, transactional write path** (used by gateway callback
and admin COD alike):

```ts
async function markOrderPaid({ orderId, refId, authority, amount }) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.paymentStatus === 'Paid') return;   // idempotent

    // 1) Stock / capacity guards — decrement only what exists.
    // 2) Update the order to Paid + paidAt.
    await tx.order.update({ where: { id: orderId }, data: { paymentStatus: 'Paid', paidAt: new Date() } });
    // 3) Record the ref_id (the customer's tracking code).
    await tx.paymentDetails.upsert({
      where: { orderId },
      update: { status: 'OK', Authority: authority, amount, transactionId: refId },
      create: { orderId, userId: order.userId, status: 'OK', Authority: authority, amount, transactionId: refId },
    });
    await markAttempt(orderId, authority, 'SUCCESS');
  });
}
```

### 4.5 No-webhook reconciliation (abandoned payments)

Zarinpal has **no push webhook**. If a user pays but never returns to your callback (lost the tab),
reconcile lazily — on page view and/or a cron sweeping pending orders:

```ts
export async function reconcilePending(orderId) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { paymentDetails: true } });
  if (!order || order.paymentStatus === 'Paid') return false;
  const authority = order.paymentDetails?.Authority;
  if (!authority) return false;

  const v = await createZarinpal().PaymentVerification({ Amount: Math.round(order.amount), authority });
  if (v.status !== 100 && v.status !== 101) return false;   // not paid yet / failed

  await markOrderPaid({ orderId, refId: String(v.refId), authority, amount: order.amount });
  return true;
}
```

### 4.6 Lock + replay + rate-limit helpers

```ts
async function acquirePaymentLock(orderId, authority) {
  try {
    await prisma.paymentLock.create({ data: { orderId, authority, expiresAt: new Date(Date.now() + 5 * 60_000) } });
    return true;
  } catch { return false; }
}
async function releasePaymentLock(orderId) { try { await prisma.paymentLock.delete({ where: { orderId } }); } catch {} }
async function cleanupExpiredLocks() { await prisma.paymentLock.deleteMany({ where: { expiresAt: { lt: new Date() } } }); }

async function validatePaymentAttempt(orderId, authority, amount) {
  const existing = await prisma.paymentAttempt.findUnique({ where: { orderId_authority: { orderId, authority } } });
  if (existing) {
    if (existing.status === 'SUCCESS' || existing.status === 'USED') return false;
    await prisma.paymentAttempt.update({ where: { id: existing.id }, data: { status: 'PENDING', amount } });
  } else {
    await prisma.paymentAttempt.create({ data: { orderId, authority, amount, status: 'PENDING' } });
  }
  return true;
}
async function markAttempt(orderId, authority, status) { /* update/create PaymentAttempt status */ }

async function checkRateLimit(userId, max = 100) {
  const count = await prisma.paymentRateLimit.count({
    where: { userId, createdAt: { gte: new Date(Date.now() - 60 * 60_000) } },
  });
  if (count >= max) throw new Error('Too many payment attempts. Try again later.');
  await prisma.paymentRateLimit.create({ data: { userId } });
}
```

---

## 5. Amount & currency — read carefully

- **`amount` must be the same in `request.json` and `verify.json`.** Re-read it from your DB; never
  trust a browser-supplied number. A mismatch fails verification.
- **Currency:** Zarinpal supports `IRT` (Toman) and `IRR` (Rial). The library default is `IRT`.
  Toman = Rial ÷ 10. Pick one, store it in `Order.currency`, and be consistent. Convert before
  sending if your app stores Rial.

---

## 6. Security checklist (non-negotiable)

- [ ] **Always verify server-to-server** on the callback; never trust browser `Status`.
- [ ] **Same amount** in request and verify, sourced from the DB.
- [ ] **Idempotent mark-paid** inside a `$transaction`; refuse if already `Paid`.
- [ ] **Replay protection** via `PaymentAttempt` (block re-used `SUCCESS`/`USED` authorities).
- [ ] **Distributed lock** (`PaymentLock`) around verify+mark-paid to stop double-processing races.
- [ ] **Rate limit** payment initiation per user.
- [ ] **Auth + ownership** check in request and callback (order must belong to the logged-in user).
- [ ] **No refund/chargeback without a gateway call** — a DB `Refunded` flag is not a real refund.
- [ ] **CSP**: allow `frame-src`, `connect-src`, `img-src` for `payment.zarinpal.com` /
      `sandbox.zarinpal.com` so the StartPay iframe loads.

---

## 7. Deployment checklist

| Item | Required |
|---|---|
| `ZARINPAL_KEY` (merchant UUID) | in the live env |
| `NEXT_PUBLIC_APP_URL` | the real public origin (builds the callback URL) |
| `NODE_ENV=production` | on the prod host → switches sandbox off |
| Callback URL publicly reachable | Zarinpal must reach `https://your-app/api/payment/callback` |
| Test in sandbox first | use a sandbox merchant until the flow is proven |

---

## 8. How to reuse this in a new project

1. **Copy the schema** (§3) into your `schema.prisma`, adjust FKs/relations to your domain.
2. **Add the env vars** (§2).
3. **Implement `startPayment`** (§4.1) — wire your "Pay" action/button to it.
4. **Add the callback route** (§4.3) and **`verifyPayment` + `markOrderPaid`** (§4.4).
5. **Add reconciliation** (§4.5) on the order page and/or a cron.
6. **Run through the security checklist** (§6) before going live.
