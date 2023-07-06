/*
  Warnings:

  - You are about to drop the column `correctChoiceIndex` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "altText" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "correctChoiceIndex",
ADD COLUMN     "correctChoiceIndices" INTEGER[];
