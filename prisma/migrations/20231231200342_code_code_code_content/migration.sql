/*
  Warnings:

  - You are about to drop the column `code` on the `Code` table. All the data in the column will be lost.
  - Added the required column `content` to the `Code` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Code" RENAME COLUMN "code" TO "content";
