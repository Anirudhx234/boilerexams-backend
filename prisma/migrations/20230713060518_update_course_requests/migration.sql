/*
  Warnings:

  - You are about to drop the column `course` on the `CourseRequest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `CourseRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `abbreviation` to the `CourseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CourseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `CourseRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseRequest" DROP COLUMN "course",
ADD COLUMN     "abbreviation" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "number" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CourseRequest_name_key" ON "CourseRequest"("name");
