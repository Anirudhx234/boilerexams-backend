/*
  Warnings:

  - You are about to drop the column `reflectionEndTime` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `reflectionStartTime` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `videoWatched` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `modalTotalTime` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `osFamily` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "reflectionEndTime",
DROP COLUMN "reflectionStartTime",
DROP COLUMN "videoWatched",
ADD COLUMN     "modalEndTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modalStartTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modalTotalTime" INTEGER NOT NULL,
ADD COLUMN     "osFamily" TEXT NOT NULL;
