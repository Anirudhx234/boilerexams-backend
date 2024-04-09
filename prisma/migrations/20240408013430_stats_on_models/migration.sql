-- AlterTable
ALTER TABLE "AnswerChoice" ADD COLUMN     "stats" JSONB;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "stats" JSONB;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "stats" JSONB;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "stats" JSONB;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "stats" JSONB;
