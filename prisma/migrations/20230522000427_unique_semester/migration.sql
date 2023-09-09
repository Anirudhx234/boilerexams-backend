/*
  Warnings:

  - A unique constraint covering the columns `[season,year]` on the table `Semester` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Semester_season_year_key" ON "Semester"("season", "year");
