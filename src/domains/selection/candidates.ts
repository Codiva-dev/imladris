import {
  DEFAULT_RULES,
  filterTopicCandidates,
  pickApproaches,
  pickCandidates,
  type ApproachOption,
  type SelectionRules,
  type TopicCandidate,
} from "./rules-engine";
import { prisma } from "@/lib/prisma";

export async function loadSelectionRules(
  councilId: string,
): Promise<SelectionRules> {
  const row = await prisma.councilRules.findUnique({
    where: { councilId },
  });
  if (!row) return DEFAULT_RULES;
  return {
    noRepeatTopicMonths: row.noRepeatTopicMonths,
    noConsecutiveCategory: row.noConsecutiveCategory,
    candidateCount: row.candidateCount,
    approachCount: row.approachCount,
    allowFreeCombination: row.allowFreeCombination,
    excludeArchivedTopics: row.excludeArchivedTopics,
    topicProposalsPerMember: row.topicProposalsPerMember,
  };
}

export async function lastSelectedCategory(
  councilId: string,
): Promise<string | null> {
  const last = await prisma.meetingSelection.findFirst({
    where: { meeting: { councilId } },
    orderBy: { selectedAt: "desc" },
    include: { topic: { select: { category: true } } },
  });
  return last?.topic.category ?? null;
}

export async function buildMeetingCandidates(meetingId: string, councilId: string) {
  const rules = await loadSelectionRules(councilId);
  const lastCategory = await lastSelectedCategory(councilId);

  const topics = await prisma.topic.findMany({
    where: { councilId },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      lastSelectedAt: true,
      timesUsed: true,
      proposedBy: { select: { id: true, name: true, username: true } },
    },
    orderBy: { title: "asc" },
  });

  const approaches = await prisma.approach.findMany({
    where: { councilId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const meetingProposals = await prisma.topicProposal.findMany({
    where: { meetingId },
    select: { topicId: true },
  });
  const proposedIds = new Set(meetingProposals.map((p) => p.topicId));

  const topicCandidates: TopicCandidate[] = topics.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    status: t.status,
    lastSelectedAt: t.lastSelectedAt,
    timesUsed: t.timesUsed,
  }));

  const eligible = filterTopicCandidates(topicCandidates, rules, lastCategory);

  // Priorizar temas propuestos en esta convocatoria, luego el resto del banco.
  const fromMeeting = eligible.filter((t) => proposedIds.has(t.id));
  const fromBank = eligible.filter((t) => !proposedIds.has(t.id));
  const meetingPicks = pickCandidates(fromMeeting, rules.candidateCount);
  const bankPicks = pickCandidates(
    fromBank,
    Math.max(0, rules.candidateCount - meetingPicks.length),
  );
  const prioritized = [...meetingPicks, ...bankPicks];

  const approachPool: ApproachOption[] = approaches;
  const approachOptions = rules.allowFreeCombination
    ? approachPool
    : pickApproaches(approachPool, rules.approachCount, meetingId);

  return {
    rules: {
      candidateCount: rules.candidateCount,
      approachCount: rules.approachCount,
      allowFreeCombination: rules.allowFreeCombination,
      topicProposalsPerMember: rules.topicProposalsPerMember,
    },
    topicCount: topics.length,
    eligibleCount: eligible.length,
    proposedInMeeting: fromMeeting.length,
    candidates: prioritized.map((c) => {
      const full = topics.find((t) => t.id === c.id)!;
      return {
        id: full.id,
        title: full.title,
        description: full.description,
        category: full.category,
        timesUsed: full.timesUsed,
        fromProposal: proposedIds.has(full.id),
        proposedBy: full.proposedBy,
      };
    }),
    approaches: approachOptions,
  };
}
