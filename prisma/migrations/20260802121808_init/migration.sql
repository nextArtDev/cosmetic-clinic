-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin', 'doctor');
-- CreateEnum
CREATE TYPE "PatientType" AS ENUM ('MYSELF', 'SOMEONE_ELSE');
-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM (
    'PAYMENT_PENDING',
    'BOOKING_CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
    'CASH'
);
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM (
    'Pending',
    'Paid',
    'Failed',
    'Declined',
    'Cancelled',
    'Refunded',
    'PartiallyRefunded',
    'Chargeback'
);
-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "codeNumber" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "isRootAdmin" BOOLEAN DEFAULT false,
    "dateOfBirth" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phoneNumber" TEXT NOT NULL,
    "phoneNumberVerified" BOOLEAN,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "banned" BOOLEAN DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "profileImageId" TEXT,
    "beforeImageId" TEXT,
    "afterImageId" TEXT,
    "gender" TEXT,
    "bio" TEXT,
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "OtpRateLimit" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "lastSentAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OtpRateLimit_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "doctor_profiles" (
    "profileId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "brief" TEXT NOT NULL,
    "bio" TEXT,
    "credentials" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "languages" TEXT [] DEFAULT ARRAY []::TEXT [],
    "consultFee" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "slotDurationMinutes" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "doctor_profiles_pkey" PRIMARY KEY ("profileId")
);
-- CreateTable
CREATE TABLE "specializations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconName" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "specializations_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "doctor_specializations" (
    "doctorProfileId" UUID NOT NULL,
    "specializationId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "doctor_specializations_pkey" PRIMARY KEY ("doctorProfileId", "specializationId")
);
-- CreateTable
CREATE TABLE "illnesses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "symptoms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "illnesses_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authorId" TEXT NOT NULL,
    "doctorId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "doctor_schedule_blocks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDurationMinutes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "doctor_schedule_blocks_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "doctor_date_overrides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "doctorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDurationMinutes" INTEGER,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "doctor_date_overrides_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "doctor_leaves" (
    "leaveId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "doctorId" TEXT NOT NULL,
    "leaveDate" DATE NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "doctor_leaves_pkey" PRIMARY KEY ("leaveId")
);
-- CreateTable
CREATE TABLE "clinic_closures" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" DATE NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "clinic_closures_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "working_days" (
    "dayId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dayOfWeek" INTEGER NOT NULL,
    "isWorkingDay" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "working_days_pkey" PRIMARY KEY ("dayId")
);
-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Tehran',
    "defaultSlotDuration" INTEGER NOT NULL DEFAULT 30,
    "slotReservationDuration" INTEGER NOT NULL DEFAULT 10,
    "maxAdvanceBookingDays" INTEGER NOT NULL DEFAULT 60,
    "minLeadTimeMinutes" INTEGER NOT NULL DEFAULT 15,
    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "appointments" (
    "appointmentId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "doctorId" TEXT NOT NULL,
    "userId" TEXT,
    "guestIdentifier" TEXT,
    "patientType" "PatientType" NOT NULL,
    "patientRelation" TEXT,
    "patientName" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "paymentResult" JSONB,
    "paidAt" TIMESTAMP(3),
    "appointmentStartUTC" TIMESTAMP(3) NOT NULL,
    "appointmentEndUTC" TIMESTAMP(3) NOT NULL,
    "phoneNumber" TEXT,
    "reasonForVisit" TEXT,
    "additionalNotes" TEXT,
    "patientDateOfBirth" TIMESTAMP(3),
    "reservationExpiresAt" TIMESTAMP(3),
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PAYMENT_PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointmentId")
);
-- CreateTable
CREATE TABLE "time_lines" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isEspecial" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "time_lines_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "bannerImageId" TEXT,
    "specializationId" UUID,
    "illnessId" UUID,
    "timeLineId" TEXT,
    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "doctor_testimonials" (
    "testimonialId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "appointmentId" UUID NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "testimonialText" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPending" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "doctor_testimonials_pkey" PRIMARY KEY ("testimonialId")
);
-- CreateTable
CREATE TABLE "banner_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "banner_images_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "appointmentId" UUID NOT NULL,
    "doctorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT,
    "paidAt" TIMESTAMP(6),
    "notes" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'Pending',
    "authority" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PaymentDetails" (
    "id" TEXT NOT NULL,
    "status" TEXT,
    "amount" DOUBLE PRECISION,
    "Authority" TEXT,
    "transactionId" TEXT,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PaymentDetails_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PaymentLock" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentLock_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PaymentRateLimit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentRateLimit_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "_DoctorIllnesses" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,
    CONSTRAINT "_DoctorIllnesses_AB_pkey" PRIMARY KEY ("A", "B")
);
-- CreateTable
CREATE TABLE "_SpecializationToTimeLine" (
    "A" UUID NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SpecializationToTimeLine_AB_pkey" PRIMARY KEY ("A", "B")
);
-- CreateTable
CREATE TABLE "_IllnessSpecializations" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,
    CONSTRAINT "_IllnessSpecializations_AB_pkey" PRIMARY KEY ("A", "B")
);
-- CreateIndex
CREATE UNIQUE INDEX "user_profileImageId_key" ON "user"("profileImageId");
-- CreateIndex
CREATE UNIQUE INDEX "user_beforeImageId_key" ON "user"("beforeImageId");
-- CreateIndex
CREATE UNIQUE INDEX "user_afterImageId_key" ON "user"("afterImageId");
-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");
-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");
-- CreateIndex
CREATE UNIQUE INDEX "OtpRateLimit_phoneNumber_key" ON "OtpRateLimit"("phoneNumber");
-- CreateIndex
CREATE INDEX "OtpRateLimit_phoneNumber_idx" ON "OtpRateLimit"("phoneNumber");
-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_userId_key" ON "doctor_profiles"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_slug_key" ON "doctor_profiles"("slug");
-- CreateIndex
CREATE UNIQUE INDEX "specializations_name_key" ON "specializations"("name");
-- CreateIndex
CREATE UNIQUE INDEX "specializations_slug_key" ON "specializations"("slug");
-- CreateIndex
CREATE INDEX "doctor_specializations_specializationId_idx" ON "doctor_specializations"("specializationId");
-- CreateIndex
CREATE UNIQUE INDEX "illnesses_name_key" ON "illnesses"("name");
-- CreateIndex
CREATE UNIQUE INDEX "illnesses_slug_key" ON "illnesses"("slug");
-- CreateIndex
CREATE INDEX "reviews_doctorId_isApproved_idx" ON "reviews"("doctorId", "isApproved");
-- CreateIndex
CREATE UNIQUE INDEX "reviews_authorId_doctorId_key" ON "reviews"("authorId", "doctorId");
-- CreateIndex
CREATE INDEX "doctor_schedule_blocks_doctorId_dayOfWeek_isActive_idx" ON "doctor_schedule_blocks"("doctorId", "dayOfWeek", "isActive");
-- CreateIndex
CREATE UNIQUE INDEX "doctor_schedule_blocks_doctorId_dayOfWeek_startTime_key" ON "doctor_schedule_blocks"("doctorId", "dayOfWeek", "startTime");
-- CreateIndex
CREATE INDEX "doctor_date_overrides_doctorId_date_idx" ON "doctor_date_overrides"("doctorId", "date");
-- CreateIndex
CREATE UNIQUE INDEX "doctor_date_overrides_doctorId_date_startTime_key" ON "doctor_date_overrides"("doctorId", "date", "startTime");
-- CreateIndex
CREATE INDEX "doctor_leaves_doctorId_leaveDate_idx" ON "doctor_leaves"("doctorId", "leaveDate");
-- CreateIndex
CREATE UNIQUE INDEX "clinic_closures_date_key" ON "clinic_closures"("date");
-- CreateIndex
CREATE UNIQUE INDEX "working_days_dayOfWeek_key" ON "working_days"("dayOfWeek");
-- CreateIndex
CREATE INDEX "appointments_doctorId_appointmentStartUTC_idx" ON "appointments"("doctorId", "appointmentStartUTC");
-- CreateIndex
CREATE INDEX "appointments_userId_status_idx" ON "appointments"("userId", "status");
-- CreateIndex
CREATE INDEX "appointments_status_reservationExpiresAt_idx" ON "appointments"("status", "reservationExpiresAt");
-- CreateIndex
CREATE INDEX "time_lines_userId_idx" ON "time_lines"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "Image_userId_bannerImageId_key" ON "Image"("userId", "bannerImageId");
-- CreateIndex
CREATE UNIQUE INDEX "doctor_testimonials_appointmentId_key" ON "doctor_testimonials"("appointmentId");
-- CreateIndex
CREATE UNIQUE INDEX "banner_images_imageId_key" ON "banner_images"("imageId");
-- CreateIndex
CREATE UNIQUE INDEX "banner_images_fileKey_key" ON "banner_images"("fileKey");
-- CreateIndex
CREATE UNIQUE INDEX "PaymentDetails_orderId_key" ON "PaymentDetails"("orderId");
-- CreateIndex
CREATE INDEX "PaymentDetails_orderId_idx" ON "PaymentDetails"("orderId");
-- CreateIndex
CREATE INDEX "PaymentDetails_userId_idx" ON "PaymentDetails"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "PaymentLock_orderId_key" ON "PaymentLock"("orderId");
-- CreateIndex
CREATE INDEX "PaymentLock_orderId_idx" ON "PaymentLock"("orderId");
-- CreateIndex
CREATE INDEX "PaymentLock_expiresAt_idx" ON "PaymentLock"("expiresAt");
-- CreateIndex
CREATE INDEX "PaymentAttempt_orderId_idx" ON "PaymentAttempt"("orderId");
-- CreateIndex
CREATE INDEX "PaymentAttempt_authority_idx" ON "PaymentAttempt"("authority");
-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_orderId_authority_key" ON "PaymentAttempt"("orderId", "authority");
-- CreateIndex
CREATE INDEX "PaymentRateLimit_userId_createdAt_idx" ON "PaymentRateLimit"("userId", "createdAt");
-- CreateIndex
CREATE INDEX "_DoctorIllnesses_B_index" ON "_DoctorIllnesses"("B");
-- CreateIndex
CREATE INDEX "_SpecializationToTimeLine_B_index" ON "_SpecializationToTimeLine"("B");
-- CreateIndex
CREATE INDEX "_IllnessSpecializations_B_index" ON "_IllnessSpecializations"("B");
-- AddForeignKey
ALTER TABLE "user"
ADD CONSTRAINT "user_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "Image"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "user"
ADD CONSTRAINT "user_beforeImageId_fkey" FOREIGN KEY ("beforeImageId") REFERENCES "Image"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "user"
ADD CONSTRAINT "user_afterImageId_fkey" FOREIGN KEY ("afterImageId") REFERENCES "Image"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "session"
ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "account"
ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "doctor_profiles"
ADD CONSTRAINT "doctor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "doctor_specializations"
ADD CONSTRAINT "doctor_specializations_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profiles"("profileId") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "doctor_specializations"
ADD CONSTRAINT "doctor_specializations_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "doctor_schedule_blocks"
ADD CONSTRAINT "doctor_schedule_blocks_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "doctor_date_overrides"
ADD CONSTRAINT "doctor_date_overrides_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "doctor_leaves"
ADD CONSTRAINT "doctor_leaves_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "appointments"
ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "appointments"
ADD CONSTRAINT "appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "time_lines"
ADD CONSTRAINT "time_lines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Image"
ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Image"
ADD CONSTRAINT "Image_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "specializations"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Image"
ADD CONSTRAINT "Image_illnessId_fkey" FOREIGN KEY ("illnessId") REFERENCES "illnesses"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Image"
ADD CONSTRAINT "Image_timeLineId_fkey" FOREIGN KEY ("timeLineId") REFERENCES "time_lines"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "doctor_testimonials"
ADD CONSTRAINT "doctor_testimonials_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("appointmentId") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "doctor_testimonials"
ADD CONSTRAINT "doctor_testimonials_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "doctor_testimonials"
ADD CONSTRAINT "doctor_testimonials_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "banner_images"
ADD CONSTRAINT "banner_images_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "transactions"
ADD CONSTRAINT "transactions_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("appointmentId") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "transactions"
ADD CONSTRAINT "transactions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PaymentDetails"
ADD CONSTRAINT "PaymentDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PaymentDetails"
ADD CONSTRAINT "PaymentDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "_DoctorIllnesses"
ADD CONSTRAINT "_DoctorIllnesses_A_fkey" FOREIGN KEY ("A") REFERENCES "doctor_profiles"("profileId") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "_DoctorIllnesses"
ADD CONSTRAINT "_DoctorIllnesses_B_fkey" FOREIGN KEY ("B") REFERENCES "illnesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "_SpecializationToTimeLine"
ADD CONSTRAINT "_SpecializationToTimeLine_A_fkey" FOREIGN KEY ("A") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "_SpecializationToTimeLine"
ADD CONSTRAINT "_SpecializationToTimeLine_B_fkey" FOREIGN KEY ("B") REFERENCES "time_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "_IllnessSpecializations"
ADD CONSTRAINT "_IllnessSpecializations_A_fkey" FOREIGN KEY ("A") REFERENCES "illnesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "_IllnessSpecializations"
ADD CONSTRAINT "_IllnessSpecializations_B_fkey" FOREIGN KEY ("B") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Partial unique index: prevents double-booking for ACTIVE appointments
-- (Prisma cannot express partial indexes, so we add it in raw SQL).
CREATE UNIQUE INDEX appointments_doctor_slot_active_key ON "appointments" ("doctorId", "appointmentStartUTC")
WHERE status NOT IN ('CANCELLED', 'NO_SHOW');