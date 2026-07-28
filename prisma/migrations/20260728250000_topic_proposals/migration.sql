-- AlterTable
ALTER TABLE "council_rules" ADD COLUMN "topicProposalsPerMember" INTEGER NOT NULL DEFAULT 2;

-- CreateTable
CREATE TABLE "topic_proposals" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "topic_proposals_meetingId_userId_idx" ON "topic_proposals"("meetingId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "topic_proposals_meetingId_topicId_key" ON "topic_proposals"("meetingId", "topicId");

-- AddForeignKey
ALTER TABLE "topic_proposals" ADD CONSTRAINT "topic_proposals_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_proposals" ADD CONSTRAINT "topic_proposals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_proposals" ADD CONSTRAINT "topic_proposals_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
