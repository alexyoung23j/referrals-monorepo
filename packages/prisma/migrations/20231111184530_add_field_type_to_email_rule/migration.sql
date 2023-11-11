-- AlterTable
ALTER TABLE "EmailRule" ADD COLUMN     "fieldType" TEXT,
ALTER COLUMN "fieldValue" SET DATA TYPE TEXT;
