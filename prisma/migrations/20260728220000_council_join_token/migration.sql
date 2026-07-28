-- AlterTable
ALTER TABLE "councils" ADD COLUMN "joinToken" TEXT;

-- Backfill existing councils
UPDATE "councils" SET "joinToken" = replace(gen_random_uuid()::text, '-', '') WHERE "joinToken" IS NULL;

-- Enforce uniqueness
CREATE UNIQUE INDEX "councils_joinToken_key" ON "councils"("joinToken");

ALTER TABLE "councils" ALTER COLUMN "joinToken" SET NOT NULL;
