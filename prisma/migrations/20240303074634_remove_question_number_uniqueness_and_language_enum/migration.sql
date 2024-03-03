/*
  Warnings:

  - You are about to drop the column `longVideoId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `shortVideoId` on the `Question` table. All the data in the column will be lost.
  - Made the column `examId` on table `Question` required. This step will fail if there are existing NULL values in that column.
  - Made the column `courseId` on table `Question` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('C', 'PYTHON');

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_longVideoId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_shortVideoId_fkey";

-- DropIndex
DROP INDEX "Question_longVideoId_key";

-- DropIndex
DROP INDEX "Question_number_examId_key";

-- DropIndex
DROP INDEX "Question_shortVideoId_key";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "longVideoId",
DROP COLUMN "shortVideoId",
ADD COLUMN     "disclaimer" TEXT,
ALTER COLUMN "examId" SET NOT NULL,
ALTER COLUMN "courseId" SET NOT NULL;
