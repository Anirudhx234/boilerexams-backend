-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "disclaimer" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "disclaimer" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "disclaimer" TEXT NOT NULL DEFAULT '';
