-- At most ONE open (Pending) order per appointment.
-- This is the double-charge referee: two pay-button clicks racing in `getOrCreateOrder`
-- both pass the `findFirst`, then the second `order.create` hits P2002 and fails
-- instead of opening a second gateway charge. (Prisma cannot express partial
-- unique indexes, so it lives here in raw SQL.)
CREATE UNIQUE INDEX transactions_appointment_open_key
  ON "transactions" ("appointmentId")
  WHERE "paymentStatus" = 'Pending';

-- One account per phone. The phone is the login identity (better-auth phone
-- plugin). Canonical values are "09xxxxxxxxx" (lib/phone.ts).
CREATE UNIQUE INDEX user_phoneNumber_key
  ON "user" ("phoneNumber");
