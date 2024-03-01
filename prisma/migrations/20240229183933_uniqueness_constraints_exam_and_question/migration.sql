/*
  Warnings:

  - A unique constraint covering the columns `[number,year,season,courseId]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[number,examId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Exam_number_year_season_key";

-- DropIndex
DROP INDEX "Question_examId_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "Exam_number_year_season_courseId_key" ON "Exam"("number", "year", "season", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_number_examId_key" ON "Question"("number", "examId");
