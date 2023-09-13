/*
  Warnings:

  - You are about to drop the column `defaultBlurb` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "defaultBlurb",
ADD COLUMN     "defaultMessage" TEXT,
ADD COLUMN     "experienceBlurb" TEXT;
