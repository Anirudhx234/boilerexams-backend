/*
  Warnings:

  - You are about to drop the column `resourceId` on the `AnswerChoice` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `imageData` on the `Resource` table. All the data in the column will be lost.
  - Added the required column `type` to the `Resource` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('IMAGE', 'CODE');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('C', 'JAVA');

-- DropForeignKey
ALTER TABLE "AnswerChoice" DROP CONSTRAINT "AnswerChoice_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_resourceId_fkey";

-- DropIndex
DROP INDEX "AnswerChoice_resourceId_key";

-- DropIndex
DROP INDEX "Question_resourceId_key";

-- AlterTable
ALTER TABLE "AnswerChoice" DROP COLUMN "resourceId";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "resourceId";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "code",
DROP COLUMN "imageData",
ADD COLUMN     "answerChoiceId" TEXT,
ADD COLUMN     "questionId" TEXT,
ADD COLUMN     "type" "ResourceType" NOT NULL;

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Code" (
    "id" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "code" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_resourceId_key" ON "Image"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Code_resourceId_key" ON "Code"("resourceId");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_answerChoiceId_fkey" FOREIGN KEY ("answerChoiceId") REFERENCES "AnswerChoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
