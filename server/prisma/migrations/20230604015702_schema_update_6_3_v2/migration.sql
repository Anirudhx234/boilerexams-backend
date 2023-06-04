/*
  Warnings:

  - You are about to drop the column `code` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `attempted` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `correctAnswer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `notAttempted` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `solution` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subject,number]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `correctChoiceIndex` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Course_code_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "code",
ADD COLUMN     "backgroundColor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "graphicLink" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "number" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subject" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "attempted",
DROP COLUMN "notAttempted",
ADD COLUMN     "submissions" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CreateIndex
CREATE UNIQUE INDEX "Course_subject_number_key" ON "Course"("subject", "number");
