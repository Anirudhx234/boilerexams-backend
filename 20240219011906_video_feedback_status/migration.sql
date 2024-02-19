-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'FRQ');

-- CreateEnum
CREATE TYPE "VideoFeedbackStatus" AS ENUM ('RESOLVED', 'UNRESOLVED');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "type" "QuestionType" NOT NULL DEFAULT 'MCQ';

-- AlterTable
ALTER TABLE "VideoFeedback" ADD COLUMN     "status" "VideoFeedbackStatus" NOT NULL DEFAULT 'UNRESOLVED';
