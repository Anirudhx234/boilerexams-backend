/*
  Warnings:

  - You are about to drop the column `imageURLs` on the `Resource` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AnswerChoice" DROP CONSTRAINT "AnswerChoice_questionId_fkey";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "imageURLs",
ADD COLUMN     "imageData" JSONB[],
ALTER COLUMN "code" SET NOT NULL,
ALTER COLUMN "code" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "AnswerChoice" ADD CONSTRAINT "AnswerChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
