-- DropIndex
DROP INDEX "Course_abbreviation_number_published_key";

-- DropIndex
DROP INDEX "Exam_number_courseId_semesterId_published_key";

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "practice" BOOLEAN NOT NULL DEFAULT false;
