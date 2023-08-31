-- CreateEnum
CREATE TYPE "EmailJobType" AS ENUM ('REFERRAL_REMINDER', 'REFERRAL_REMINDER_NOTIFICATION', 'REFERRAL_CONFIRMATION', 'REFERRAL_CONFIRMATION_NOTIFICATION', 'MESSAGE_FROM_REFERRER');

-- CreateEnum
CREATE TYPE "EmailJobStatus" AS ENUM ('QUEUED', 'CANCELLED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "EmailJob" (
    "id" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachmentUrls" TEXT[],
    "toCC" TEXT[],
    "referralRequestId" TEXT,
    "emailType" "EmailJobType" NOT NULL,
    "status" "EmailJobStatus" NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmailJob" ADD CONSTRAINT "EmailJob_referralRequestId_fkey" FOREIGN KEY ("referralRequestId") REFERENCES "ReferralRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
