/*
  Warnings:

  - You are about to drop the column `attachmentUrls` on the `EmailJob` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmailJob" DROP COLUMN "attachmentUrls";

-- CreateTable
CREATE TABLE "EmailAttachment" (
    "id" TEXT NOT NULL,
    "emailJobId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "EmailAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmailAttachment" ADD CONSTRAINT "EmailAttachment_emailJobId_fkey" FOREIGN KEY ("emailJobId") REFERENCES "EmailJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
