-- CreateEnum
CREATE TYPE "StudyMode" AS ENUM ('EXAM', 'TIMED_EXAM', 'TOPIC');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "studyModes" "StudyMode"[];
