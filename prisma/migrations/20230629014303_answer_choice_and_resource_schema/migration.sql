/*
  Warnings:

  - You are about to drop the column `answerChoices` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[resourceId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "answerChoices",
ADD COLUMN     "resourceId" TEXT;

-- CreateTable
CREATE TABLE "AnswerChoice" (
    "id" TEXT NOT NULL,
    "choiceIndex" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "resourceId" TEXT,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "AnswerChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "imageURLs" TEXT[],
    "code" TEXT[],

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnswerChoice_resourceId_key" ON "AnswerChoice"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_resourceId_key" ON "Question"("resourceId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerChoice" ADD CONSTRAINT "AnswerChoice_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerChoice" ADD CONSTRAINT "AnswerChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
