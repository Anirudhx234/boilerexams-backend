/*
  Warnings:

  - The values [WINTER,SUMMER] on the enum `Season` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Season_new" AS ENUM ('SPRING', 'FALL');
ALTER TABLE "Semester" ALTER COLUMN "season" TYPE "Season_new" USING ("season"::text::"Season_new");
ALTER TYPE "Season" RENAME TO "Season_old";
ALTER TYPE "Season_new" RENAME TO "Season";
DROP TYPE "Season_old";
COMMIT;
