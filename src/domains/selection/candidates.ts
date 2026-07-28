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
    },
    orderBy: { title: "asc" },
  });

  const approaches = await prisma.approach.findMany({
    where: { councilId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const topicCandidates: TopicCandidate[] = topics.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    status: t.status,
    lastSelectedAt: t.lastSelectedAt,
    timesUsed: t.timesUsed,
  }));

  const eligible = filterTopicCandidates(topicCandidates, rules, lastCategory);
  const candidates = pickCandidates(eligible, rules.candidateCount);

  const approachPool: ApproachOption[] = approaches;
  const approachOptions = rules.allowFreeCombination
    ? approachPool
    : pickApproaches(approachPool, rules.approachCount, meetingId);

  return {
    rules: {
      candidateCount: rules.candidateCount,
      approachCount: rules.approachCount,
      allowFreeCombination: rules.allowFreeCombination,
    },
    topicCount: topics.length,
    eligibleCount: eligible.length,
    candidates: candidates.map((c) => {
      const full = topics.find((t) => t.id === c.id)!;
      return {
        id: full.id,
        title: full.title,
        description: full.description,
        category: full.category,
        timesUsed: full.timesUsed,
      };
    }),
    approaches: approachOptions,
  };
}
