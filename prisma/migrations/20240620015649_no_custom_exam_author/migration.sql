/*
  Warnings:

  - You are about to drop the column `author` on the `CustomExam` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TESTER';

-- AlterTable
ALTER TABLE "CustomExam" DROP COLUMN "author";
