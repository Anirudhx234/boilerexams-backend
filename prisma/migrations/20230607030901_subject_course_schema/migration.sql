/*
  Warnings:

  - A unique constraint covering the columns `[abbreviation,number]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "abbreviation" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Course_abbreviation_number_key" ON "Course"("abbreviation", "number");
