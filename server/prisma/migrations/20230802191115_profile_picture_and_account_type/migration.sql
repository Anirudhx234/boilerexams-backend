/*
  Warnings:

  - You are about to drop the column `discordId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountType` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('DISCORD', 'GOOGLE');

-- DropIndex
DROP INDEX "User_discordId_key";

-- DropIndex
DROP INDEX "User_googleId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "discordId",
DROP COLUMN "emailVerified",
DROP COLUMN "googleId",
DROP COLUMN "image",
ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "accountType" "AccountType" NOT NULL,
ADD COLUMN     "profilePicture" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_key" ON "User"("accountId");
