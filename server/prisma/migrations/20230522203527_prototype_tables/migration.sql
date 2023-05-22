/*
  Warnings:

  - You are about to drop the `test_table` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[number,courseId,semesterId]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.

*/
-- DropTable
DROP TABLE "test_table";

-- CreateIndex
CREATE UNIQUE INDEX "Exam_number_courseId_semesterId_key" ON "Exam"("number", "courseId", "semesterId");
