-- CreateTable
CREATE TABLE "Statistics" (
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissions" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Statistics_time_key" ON "Statistics"("time");
