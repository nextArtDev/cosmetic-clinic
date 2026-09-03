# Zarinpal Payment — Complete Implementation Guide

This document explains **how Zarinpal payment is implemented** by comparing two real projects:
**`shafagh-04`** and **`leather-shop-vps`**. It then documents the **complete end-to-end way**
of integrating Zarinpal (the correct flow, the code, the schema, the security rails) using the
working implementation in `leather-shop-vps` as the reference.

---

## 1. What is Zarinpal?

Zarinpal is Iran's most common payment gateway. It is a **redirect-based** gateway:

- Your server asks Zarinpal to "create a payment" → Zarinpal returns an **`authority`** id.
- The browser is redirected to Zarinpal's hosted payment page (`StartPay/<authority>`).
- After the user pays (or cancels), the browser is redirected **back** to your **callback URL**,
  with `Authority`, `Status`, and — if you added them — your own query params.
- Your server then **verifies** the transaction server-side (never trust the browser turn alone),
  and only if verification returns code **100** (or **101** = already paid) do you mark the order Paid.

**Authorization flow summary**

| Step | Direction | Actor |
|---|---|---|
| Request | App → Zarinpal | create a payment, get `authority` |
| Initiate | App → User browser | redirect to `zarinpal.com/pg/StartPay/{authority}` |
| Pay | User → Zarinpal | user authorizes inside Zarinpal |
| Callback | Zarinpal → App browser | back to your callback URL with `Authority` + `Status` |
| Verify | App → Zarinpal | confirm the result server-side, get `ref_id` |
| Fulfil | App DB | mark order `Paid`, decrement stock, store `ref_id` |

---

## 2. Project Comparison at a Glance

| Capability | `shafagh-04` | `leather-shop-vps` |
|---|---|---|
| Zarinpal package installed | ❌ none | ✅ `zarinpal-checkout@^0.3.0` (+ types) |
| Merchant ID in env | ❌ | ✅ `ZARINPAL_KEY` (UUID, 36 chars) |
| Payment request function | ❌ | ✅ `createPaymentRequest()` in `payment1.ts` |
| Payment initiation route, server action | ❌ | ✅ server action + client form with `useActionState` |
| Callback route | ❌ | ✅ `app/api/payment/callback/route.ts` (`GET`) |
| Server-side verify | ❌ | ✅ `PaymentVerification` → code `100` |
| Webhook | ❌ | ❌ (uses lazy reconciliation instead) |
| Reconciliation (no-webhook) | ❌ | ✅ `reconcile-payment.ts` + order page trigger |
| Payment DB schema/models | ✅ schema only | ✅ `Order`/`PaymentDetails`/`PaymentLock`/… |
| `PaymentAttempt`/rate-limit/lock models | ✅ schema only | ✅ fully used |
| Order marked Paid securely | ❌ | ✅ `updateOrderToPaidSecure` ($transaction) |

**Takeaway:** `shafagh-04` has the **DB layer already designed** (interesting tables: `PaymentDetails`,
`PaymentLock`, `PaymentAttempt`, `PaymentRateLimit`) but **zero working payment code**. Its booking
action only sets `redirectTo = '/payment/<appointmentId'` pointing to a route that doesn't exist.
`leather-shop-vps` is the **complete, production-ready implementation**. Use it as the canonical guide below.

> The two projects share the same **table/prisma model design** (`PaymentDetails`, `PaymentLock`,
> `PaymentAttempt`, `PaymentRateLimit`, `authority` column on the order). This is a signal that they
> were designed against the same mental model — one finished, the other scaffolded.

---

## 3. Environment Setup

### Secrets (`.env`)

```env
# Merchant ID (Zarinpal dashboard → Merchant ID). A 36-char UUID.
ZARINPAL_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

There is **no** explicit sandbox flag in env. The app derives test/live mode from `NODE_ENV`:

```ts
const ZARINPAL_SANDBOX = process.env.NODE_ENV !== 'production';   // dev/test → sandbox, prod → live
```

### Install the package

```bash
npm i zarinpal-checkout @types/zarinpal-checkout
```

### Callback URL builder

```ts
const callbackURL =
  process.env.NODE_ENV === 'production'
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback?orderId=${order.id}`
    : `http://localhost:3000/api/payment/callback?orderId=${order.id}`;
```

> ⚠️ In `leather-shop-vps` the production branch depends on `NEXT_PUBLIC_APP_URL`, which was **not
> defined** in its `.env` at review time. Define it, or the callback URL will be malformed in prod.

---

## 4. Zarinpal API reference (what the library calls)

The `zarinpal-checkout` wrapper hits the official v4 REST API. Full endpoints:

| Standing | Live | Sandbox |
|---|---|---|
| Payment base URL | `https://payment.zarinpal.com/pg/v4/payment/` | `https://sandbox.zarinpal.com/pg/v4/payment/` |
| `request.json (create payment | `…/request.json` | `…/request.json` |
| `verify.json` | `…/verify.json` | `…/verify.json` |
| `unVerified.json` | `…/unVerified.json` | `…/unVerified.json` |
| StartPay | `https://www.zarinpal.com/pg/StartPay/` | `https://sandbox.zarinpal.com/pg/StartPay/` |

### `request.json` — request a payment

```
POST {base}/request.json
```
```json
{
  "merchant_id":  "xxxx-…-xxxx",
  "currency":     "IRT",             // IRT = Toman | IRR = Rial
  "amount":       50000,
  "callback_url": "https://site/api/payment/callback?orderId=…",
  "description":  "Payment for order …",
  "metadata":     { "email": "…", "mobile": "…", "card_pan": "…" }
}
```
Response (`data`): a **`code`** and **`authority`** (and a `url` built wrapper as `StartPay/{authority}`).
- `code === 100` → success → redirect user to that URL.
- any other code → the request failed (see message).

### `verify.json` — `POST` (server-side, on the callback)

Request:
```json
{ "merchant_id": "…", "amount": 50000, "authority": "…" }
```
Response codes:
- `100` → payment **verified & settled** → mark paid, capture `ref_id`.
- `101` → was **already verified** previously (treat as already-paid).
- anything else → payment not valid (cancelled / amount mismatch etc.).

---

## 5. The Complete Working Flow (`leather-shop-vps` reference)

### 5.1 DB schema (Prisma)

```prisma
model PaymentDetails {
  id            String   @id @default(uuid())
  paymentMethod   String?
  status        String?
  amount        Float?
  Authority     String? @db.Text      // Zarinpal authority
  currency      String?
  transactionId String?              // Zarinpal ref_id after success
  orderId       String   @unique
  userId        String
  createdAt / updatedAt
}

model PaymentLock  {          // 5-min mutation lock, prevents double-verify races
  id         String   @id @default(uuid())
  orderId    String   @unique
  authority String
  lockedAt     DateTime @default(now())
  expiresAt DateTime
}

model PaymentAttempt {       // rich replay protection: one row per (orderId, authority)
  id         String @id @default(uuid())
  orderId  String
  authority String
  status    String // PENDING / SUCCESS / FAILED / USED
  amount    Float
  createdAt DateTime @default(now())
  @@unique([orderId, authority]) @@index([orderId]) @@index([authority])
}

model PaymentRateLimit {     Index(userId, createdAt) }
```

### 5.2 Create the payment (server action)

```ts
// lib/home/actions/payment/payment.ts
'use server';

const createZarinpalInstance = () => {
  const apiKey = process.env.ZARINPAL_KEY;
  if (!apiKey) throw new Error('ZARINPAL_KEY environment variable is not set');
  return zarinPalCheckout.create(apiKey, process.env.NODE_ENV !== 'production');
};

async function createPaymentRequest(order, userId) {
  const zarinpal = createZarinpalInstance();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.phoneNumber) return null;

  const callbackURL =
    process.env.NODE_ENV === 'production'
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback?orderId=${order.id}`
      : `http://localhost:3000/api/payment/callback?orderId=${order.id}`;

  const payment = await zarinpal.PaymentRequest({
    Amount:       Number(order.total),
    CallbackURL:  callbackURL,
    Description:  `Payment for order ${order.id}`,
    Mobile:       user.phoneNumber,
  });
  return payment; // { status(code), authority, url }
}
```

### 5.3 Store the authority right away (upsert before redirect)

```ts
await prisma.paymentDetails.upsert({
  where:  { orderId },
  update: { status: String(payment.status), Authority: payment.authority },
  create: { orderId, userId, status: String(payment.status), Authority: payment.authority },
});
```

### 5.4 Client trigger (redirect the user to Zarinpal)

```tsx
const [actionState, zarinpalPaymentAction, isPending] = useActionState(
  zarinpalPayment.bind(null, `/order/${id}`, id),
  { errors: {}, payment: {} },
);
useEffect(() => { if (actionState.payment?.url) window.location.href = actionState.payment.url },
  [actionState.payment?.url]);

<form action={zarinpalPaymentAction}>…Pay button…</form>;
```

### 5.5 Callback route (browser comes back from Zarinpal)

```ts
// app/api/payment/callback/route.ts — GET
export async function GET(request: NextRequest) {
  const sp = new URL(request.url).searchParams;
  const Authority = sp.get('Authority');
  const Status    = sp.get('Status');
  const orderId   = sp.get('orderId');

  if (!Authority || !Status || !orderId) return NextResponse.redirect(`…?error=invalid_params`);
  const user = await getCurrentUser();
  if (!user?.id)  return NextResponse.redirect('/login?error=unauthorized');

  const result = await zarinpalConclude(...);
  if (result?.errors?._form) return NextResponse.redirect(`?error=…`);
  return NextResponse.redirect(result.success
    ? (result.alreadyPaid ? `…?status=already_paid` : `…?status=success`)
    : `…?error=payment_failed`);
}
```

### 5.6 Verify server-side (the core, `zarinpalConclude`)

```ts
// 1. Lock the order so two callbacks can't race.
const ok = await acquirePaymentLock(orderId, authority);
if (!ok) return { errors: { _form: ['…'] } };
try {
  // 2. must be authenticated + order must belong to user + not already paid.
  // 3. replay protection: if this authority was already success → abort.
  await prisma.paymentAttempt.upsert({ …status: 'PENDING' });

  // 4. server-side verification with Zarinpal.
  const verification = await zarinpal.PaymentVerification({
    amount: Number(order.total), // MUST match what you requested
    authority,
  });

  // 5. decide.
  if (verification.status === 100) {
    await prisma.paymentAttempt.update({ status: 'SUCCESS', … });
    await updateOrderToPaidSecure({ orderId, paymentResult: {
      id: String(verification.refId), status: 'OK', authority,
      fee: String(order.total),
    }});
    return { success: true };
  }
  // 101 → already verified → { success, alreadyPaid:true }
  // else → mark attempt FAILED, return cancellation error.
} finally {
  releasePaymentLock(orderId);
  revalidatePath(path);
}
```

### 5.7 Mark paid (single secure function, used by all flows)

```ts
// lib/server-only/**/update-order-to-paid.ts
async function updateOrderToPaidSecure({ orderId, paymentResult }) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: { include: { productVariant: true } } } });
    if (!order) throw new Error('Order not found');
    if (order.paymentStatus === 'Paid') return;            // idempotent

    for (const item of order.items) {
      const v = item.productVariant;
      if (!v || v.quantity < item.quantity) throw new InsufficientInventory(); // stock guard
      await tx.productVariant.update({ where: { id: v.id },
        data: { quantity: { decrement: item.quantity } } });
      await tx.product.update({ where: { id: v.productId }, data: { sales: { increment: item.quantity } } });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'Paid', paidAt: new Date() },
    });
    await tx.paymentDetails.upsert({
      where: { orderId }, create/update: {
        status: paymentResult.status, Authority: paymentResult.authority,
        amount: paymentResult.fee, transactionId: paymentResult.id, // ← ref_id
      },
    });
  });
}
```

### 5.8 No-webhook reconciliation (abandoned callbacks)

Zarinpal has no push webhook, so a pending order that never hit the callback is healed lazily:

```ts
// lib/payment/reconcile.ts
export async function reconcilePendingZarinpalPayment(orderId) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { paymentDetails: true } });
  if (!order || order.paymentStatus === 'Paid' || order.currency !== 'تومان') return { reconciled: false };

  const auth = order.paymentDetails?.Authority;        if (!auth) return { reconciled: false };

  const zp = zarinPalCheckout.create(process.env.ZARINPAL_KEY, process.env.NODE_ENV !== 'production');
  const v = await zp.PaymentVerification({ amount: order.total, authority: auth });
  if (v.status !== 100 && v.status !== 101) return { reconciled: false };

  await prisma.paymentAttempt.upsert({ where: { orderId_authority: … }, update: { status:'SUCCESS' }, create: { … } });
  await updateOrderToPaidSecure({ orderId, paymentResult: { id: String(v.refId), status:'OK', authority: auth, fee: String(order.total) } });
  return { reconciled: true };
}
```

Triggered from the order page when a `Pending` تومان order has authority:
```tsx
if (order?.paymentStatus === 'Pending' && order.currency === 'تومان' && order.paymentDetails?.Authority) {
  const { reconciled } = await reconcilePendingZarinpalPayment(order.id);
  if (reconciled) order = await getOrderById(order.id);   // re-fetch to reflect live status
}
```
→ The same function can also be driven by a cron that sweeps all pending orders periodically to auto-heal any that were paid but never returned to the callback.

---

## 6. Security rails (non-negotiable)

These are the invariants that make the flow safe. `leather-shop-vps` enforces all of them.

### 6.1 Never trust the callback — always verify server-side
The `Status`/`Authority` on the callback query string come from the **browser**, not directly from
Zarinpal. Treat them as untrusted hints. **Always** re-verify server-side. If `Status !== 'OK'`
return `'پرداخت لغو شد'`, otherwise call `PaymentVerification` and rely only on its return code.

### 6.2 Amount must match exactly
Pass the **same `amount`** to `PaymentVerification` that you sent in `request.json`. Never use the
browser-provided amount; re-read it from your DB and compare. A mismatch should fail verification.

### 6.3 Accept both `100` and `101`
- `100` → verified now → mark paid, store `refId`.
- `101` → already verified earlier → treat as **already-paid** (idempotent), don't double-charge.

### 6.4 Replay protection (`PaymentAttempt`)
One row per `(orderId, authority)`. If an authority was already recorded as `SUCCESS`/`USED`,
**reject** the duplicate callback instead of paying twice.

### 6.5 Distributed lock (`PaymentLock`)
Wrap verify + mark-paid in a short-lived (≈5 min) per-order lock so two concurrent callbacks (or a
callback racing the reconciliation job) cannot both process the same order. Release in `finally`.

### 6.6 Rate limiting (`PaymentRateLimit`)
Cap how often one user can initiate payments (e.g. >10/hr → block) to blunt abuse/brute-force.

### 6.7 Single, idempotent "mark paid" path
Route every success (gateway callback, admin COD) through one `$transaction` function that:
re-checks the order isn't already Paid, verifies stock before decrementing, decrements inventory,
increments sales, and stores `refId` in `PaymentDetails.transactionId`.

### 6.8 Trust the browser `Status`, but never the money
A `Status=OK` in the URL is not proof. Only a `verify.json` response of `100`/`101` counts as payment
confirmation.

---

## 7. How to port this to `shafagh-04`

`shafagh-04` has the **DB schema ready** (same models) but its `/payment/:id` route is a dangling
reference — none of the payment code exists yet. To complete it, follow the `leather-shop-vps` template:

The DB schema is already in place. What's missing is all the code. Map the `shafagh-04` booking action
(which today only sets `redirectTo = '/payment/<appointmentId>'`) onto the full `leather-shop-vps` flow:

1. Install `zarinpal-checkout` + types, add `ZARINPAL_KEY` to `.env`.
2. Implement `createPaymentRequest` (§ 5.2) and store the `authority` on the order (create the `Order`
   / `PaymentDetails` row that the booking currently never writes).
3. Add the callback route (§ 5.5), passing `appointmentId`/`orderId` in the callback URL so the
   callback knows which reservation it belongs to.
4. Add the server-side verify + lock (§ 5.6) and the secure "mark paid" transaction (§ 5.7).
5. Add the no-webhook reconciliation (§ 5.8) so abandoned payments self-heal.

---

## 8. Env / Deployment checklist

| Item | Required |
|---|---|
| `ZARINPAL_KEY` | the merchant UUID |
| `NEXT_PUBLIC_APP_URL` | the live public origin (used in callback URL) |
| CSP `frame-src`/`connect-src` | allow `https://payment.zarinpal.com` + `https://sandbox.zarinpal.com` for the iframe/StartPay |
| `NODE_ENV=production` | on the prod host to switch off sandbox |
| Callback URL registered | must be reachable from the public internet |