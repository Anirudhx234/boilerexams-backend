/*
  Warnings:

  - A unique constraint covering the columns `[location,start]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "answersStartHidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Event_location_start_key" ON "Event"("location", "start");
