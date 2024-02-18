-- CreateEnum
CREATE TYPE "AnswerChoiceType" AS ENUM ('BASIC', 'ADVANCED');

-- CreateEnum
CREATE TYPE "AnswerChoiceDataType" AS ENUM ('INT', 'FLOAT', 'STRING');

-- CreateEnum
CREATE TYPE "AnswerChoiceOperator" AS ENUM ('EQ', 'NE', 'GT', 'LT', 'GTE', 'LTE');

-- AlterTable
ALTER TABLE "AnswerChoice" ADD COLUMN     "dataType" "AnswerChoiceDataType",
ADD COLUMN     "operator" "AnswerChoiceOperator",
ADD COLUMN     "type" "AnswerChoiceType" NOT NULL DEFAULT 'BASIC';
