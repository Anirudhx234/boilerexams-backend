/*
  Warnings:

  - You are about to drop the column `correctAnswer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `solution` on the `Question` table. All the data in the column will be lost.
  - Added the required column `correctChoiceIndex` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "correctAnswer",
DROP COLUMN "solution",
ADD COLUMN     "correctChoiceIndex" INTEGER NOT NULL,
ADD COLUMN     "solutionVideoLink" TEXT NOT NULL DEFAULT '';
