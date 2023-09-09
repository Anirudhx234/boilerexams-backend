/*
  Warnings:

  - A unique constraint covering the columns `[questionId,choiceIndex]` on the table `AnswerChoice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AnswerChoice_questionId_choiceIndex_key" ON "AnswerChoice"("questionId", "choiceIndex");
