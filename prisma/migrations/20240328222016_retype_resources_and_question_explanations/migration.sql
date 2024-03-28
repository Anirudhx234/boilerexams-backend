/*
  Warnings:

  - The values [COURSE_LOGO,QUESTION_IMAGE,SOLUTION_IMAGE,ANSWER_CHOICE_IMAGE,SHORT_SOLUTION_VIDEO,LONG_SOLUTION_VIDEO,QUESTION_CODE,ANSWER_CHOICE_CODE,EXAM_PDF,RESUME_PDF] on the enum `ResourceType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `_CourseToResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ExamToResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_QuestionToResource` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[courseId]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[examId]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[questionId]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[explanationId]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ResourceType_new" AS ENUM ('LOGO', 'IMAGE', 'VIDEO', 'LONG_VIDEO', 'CODE', 'PDF');
ALTER TABLE "Resource" ALTER COLUMN "type" TYPE "ResourceType_new" USING ("type"::text::"ResourceType_new");
ALTER TYPE "ResourceType" RENAME TO "ResourceType_old";
ALTER TYPE "ResourceType_new" RENAME TO "ResourceType";
DROP TYPE "ResourceType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'GRAPHIC';

-- DropForeignKey
ALTER TABLE "_CourseToResource" DROP CONSTRAINT "_CourseToResource_A_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToResource" DROP CONSTRAINT "_CourseToResource_B_fkey";

-- DropForeignKey
ALTER TABLE "_ExamToResource" DROP CONSTRAINT "_ExamToResource_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExamToResource" DROP CONSTRAINT "_ExamToResource_B_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToResource" DROP CONSTRAINT "_QuestionToResource_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToResource" DROP CONSTRAINT "_QuestionToResource_B_fkey";

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "examId" TEXT,
ADD COLUMN     "explanationId" TEXT,
ADD COLUMN     "questionId" TEXT;

-- DropTable
DROP TABLE "_CourseToResource";

-- DropTable
DROP TABLE "_ExamToResource";

-- DropTable
DROP TABLE "_QuestionToResource";

-- CreateTable
CREATE TABLE "Explanation" (
    "id" TEXT NOT NULL,
    "body" TEXT,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Explanation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Explanation_questionId_key" ON "Explanation"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_courseId_key" ON "Resource"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_examId_key" ON "Resource"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_questionId_key" ON "Resource"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_explanationId_key" ON "Resource"("explanationId");

-- AddForeignKey
ALTER TABLE "Explanation" ADD CONSTRAINT "Explanation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_explanationId_fkey" FOREIGN KEY ("explanationId") REFERENCES "Explanation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
