/*
  Warnings:

  - The values [IOS] on the enum `Team` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Team_new" AS ENUM ('FRONTEND', 'BACKEND', 'CONTENT', 'DATA_ANALYSIS', 'RELATIONS', 'GRAPHIC_DESIGN', 'MOBILE', 'NONE');
ALTER TABLE "Application" ALTER COLUMN "team" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "team" TYPE "Team_new" USING ("team"::text::"Team_new");
ALTER TYPE "Team" RENAME TO "Team_old";
ALTER TYPE "Team_new" RENAME TO "Team";
DROP TYPE "Team_old";
ALTER TABLE "Application" ALTER COLUMN "team" SET DEFAULT 'NONE';
COMMIT;
