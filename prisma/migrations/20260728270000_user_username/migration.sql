-- AlterTable
ALTER TABLE "users" ADD COLUMN "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- Fundador: primer organizador del Consejo
UPDATE "users" AS u
SET "username" = 'Bohemianmage'
FROM "council_members" AS m
WHERE m."userId" = u."id"
  AND m."role" = 'ORGANIZADOR'
  AND u."username" IS NULL
  AND m."id" = (
    SELECT m2."id"
    FROM "council_members" AS m2
    WHERE m2."role" = 'ORGANIZADOR'
    ORDER BY m2."joinedAt" ASC
    LIMIT 1
  );
