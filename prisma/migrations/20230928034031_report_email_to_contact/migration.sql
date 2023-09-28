/*
  Warnings:

  - You are about to drop the column `email` on the `Report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "email",
ADD COLUMN     "contact" TEXT;
