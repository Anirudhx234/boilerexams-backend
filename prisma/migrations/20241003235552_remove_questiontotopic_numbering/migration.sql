/*
  Warnings:

  - You are about to drop the column `number` on the `QuestionToTopic` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "QuestionToTopic_number_idx";

--
ALTER TABLE "QuestionToTopic" DROP CONSTRAINT "QuestionToTopic_number_topicId_key";

-- AlterTable
ALTER TABLE "QuestionToTopic" DROP COLUMN "number";
