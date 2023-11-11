-- AlterEnum
ALTER TYPE "EmailJobType" ADD VALUE 'EMAIL_FROM_ADMIN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "admin" BOOLEAN;
