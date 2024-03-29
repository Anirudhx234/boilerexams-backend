/*
  Warnings:

  - A unique constraint covering the columns `[answerChoiceId]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "answerChoiceId" TEXT;

-- CreateTable
CREATE TABLE "AnswerChoice" (
    "id" TEXT NOT NULL,
    "choiceIndex" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "AnswerChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnswerChoice_questionId_choiceIndex_key" ON "AnswerChoice"("questionId", "choiceIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_answerChoiceId_key" ON "Resource"("answerChoiceId");

-- AddForeignKey
ALTER TABLE "AnswerChoice" ADD CONSTRAINT "AnswerChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_answerChoiceId_fkey" FOREIGN KEY ("answerChoiceId") REFERENCES "AnswerChoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
