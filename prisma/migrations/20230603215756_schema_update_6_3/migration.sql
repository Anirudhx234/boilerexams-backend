/*
  Warnings:

  - A unique constraint covering the columns `[examId,number]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "courseId" TEXT NOT NULL,
ALTER COLUMN "attempted" SET DEFAULT 0,
ALTER COLUMN "notAttempted" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Question_examId_number_key" ON "Question"("examId", "number");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
