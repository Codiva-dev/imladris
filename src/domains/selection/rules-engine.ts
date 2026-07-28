/**
 * Reglas del Consejo — sin IA. Solo filtros deterministas sobre el banco de temas.
 */

export type TopicCandidate = {
  id: string;
  title: string;
  category: string;
  status: "ACTIVO" | "ARCHIVADO";
  lastSelectedAt: Date | null;
  timesUsed: number;
};

export type SelectionRules = {
  noRepeatTopicMonths: number;
  noConsecutiveCategory: boolean;
  candidateCount: number;
  approachCount: number;
  allowFreeCombination: boolean;
  excludeArchivedTopics: boolean;
};

export const DEFAULT_RULES: SelectionRules = {
  noRepeatTopicMonths: 6,
  noConsecutiveCategory: true,
  candidateCount: 3,
  approachCount: 3,
  allowFreeCombination: true,
  excludeArchivedTopics: true,
};

function monthsAgo(months: number, from = new Date()): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() - months);
  return d;
}

export function filterTopicCandidates(
  topics: TopicCandidate[],
  rules: SelectionRules,
  lastCategory: string | null,
  now = new Date(),
): TopicCandidate[] {
  const cutoff = monthsAgo(rules.noRepeatTopicMonths, now);

  return topics.filter((topic) => {
    if (rules.excludeArchivedTopics && topic.status === "ARCHIVADO") {
      return false;
    }
    if (
      topic.lastSelectedAt &&
      topic.lastSelectedAt > cutoff
    ) {
      return false;
    }
    if (
      rules.noConsecutiveCategory &&
      lastCategory &&
      topic.category === lastCategory
    ) {
      return false;
    }
    return true;
  });
}

/** Selecciona hasta `candidateCount` temas, priorizando menos usados y más antiguos. */
export function pickCandidates(
  eligible: TopicCandidate[],
  candidateCount: number,
): TopicCandidate[] {
  return [...eligible]
    .sort((a, b) => {
      if (a.timesUsed !== b.timesUsed) return a.timesUsed - b.timesUsed;
      const aTime = a.lastSelectedAt?.getTime() ?? 0;
      const bTime = b.lastSelectedAt?.getTime() ?? 0;
      return aTime - bTime;
    })
    .slice(0, candidateCount);
}
