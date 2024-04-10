-- AlterTable
ALTER TABLE "AnswerChoice" ALTER COLUMN "body" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "examNumbers" INTEGER[];
