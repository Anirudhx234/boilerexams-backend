/*
  Warnings:

  - A unique constraint covering the columns `[abbreviation,number,published]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[number,courseId,semesterId,published]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Course_abbreviation_number_published_key" ON "Course"("abbreviation", "number", "published");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_number_courseId_semesterId_published_key" ON "Exam"("number", "courseId", "semesterId", "published");
