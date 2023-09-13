/*
  Warnings:

  - The values [ACCEPTED] on the enum `ReferralRequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReferralRequestStatus_new" AS ENUM ('COMMITTED', 'COMPLETED', 'REJECTED', 'OPEN');
ALTER TABLE "ReferralRequest" ALTER COLUMN "status" TYPE "ReferralRequestStatus_new" USING ("status"::text::"ReferralRequestStatus_new");
ALTER TYPE "ReferralRequestStatus" RENAME TO "ReferralRequestStatus_old";
ALTER TYPE "ReferralRequestStatus_new" RENAME TO "ReferralRequestStatus";
DROP TYPE "ReferralRequestStatus_old";
COMMIT;
