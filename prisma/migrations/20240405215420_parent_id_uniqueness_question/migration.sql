/*
  Warnings:

  - A unique constraint covering the columns `[number,examId,parentId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'PARENT';

-- DropConstraint
ALTER TABLE "Question" DROP CONSTRAINT "Question_number_examId_key";

-- CreateConstraint
ALTER TABLE "Question" ADD CONSTRAINT "Question_number_examId_parentId_key" UNIQUE ("number", "examId", "parentId") DEFERRABLE INITIALLY DEFERRED;
