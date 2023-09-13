-- DropForeignKey
ALTER TABLE "ReferralRequest" DROP CONSTRAINT "ReferralRequest_notLoggedInReferrerId_fkey";

-- AlterTable
ALTER TABLE "ReferralRequest" ALTER COLUMN "notLoggedInReferrerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ReferralRequest" ADD CONSTRAINT "ReferralRequest_notLoggedInReferrerId_fkey" FOREIGN KEY ("notLoggedInReferrerId") REFERENCES "NonLoggedInUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
