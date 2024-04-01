/*
  Warnings:

  - You are about to drop the column `solution` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "solution",
ADD COLUMN     "userSolution" JSONB;
