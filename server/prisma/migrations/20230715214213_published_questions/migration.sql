/*
  Warnings:

  - You are about to drop the column `indeces` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "indeces",
ADD COLUMN     "selectedIndices" INTEGER[];
