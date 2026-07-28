-- AlterTable
ALTER TABLE "topics" ADD COLUMN "proposedById" TEXT;

-- CreateIndex
CREATE INDEX "topics_proposedById_idx" ON "topics"("proposedById");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill desde propuestas de convocatoria
UPDATE "topics" AS t
SET "proposedById" = p."userId"
FROM "topic_proposals" AS p
WHERE p."topicId" = t."id"
  AND t."proposedById" IS NULL;
