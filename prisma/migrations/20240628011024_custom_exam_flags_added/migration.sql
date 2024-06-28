/*
  Warnings:

  - Added the required column `flags` to the `CustomExam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomExam" ADD COLUMN     "flags" INTEGER NOT NULL;
