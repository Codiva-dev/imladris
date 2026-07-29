/**
 * Reglas del Consejo - sin IA. Solo filtros deterministas sobre el banco de temas.
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
  topicProposalsPerMember: number;
};

export const DEFAULT_RULES: SelectionRules = {
  noRepeatTopicMonths: 6,
  noConsecutiveCategory: true,
  candidateCount: 3,
  approachCount: 3,
  allowFreeCombination: true,
  excludeArchivedTopics: true,
  topicProposalsPerMember: 2,
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

export type ApproachOption = { id: string; name: string };

/** Enfoques del Consejo: mezcla determinista por `seed` (p. ej. meetingId). */
export function pickApproaches(
  approaches: ApproachOption[],
  count: number,
  seed: string,
): ApproachOption[] {
  if (approaches.length <= count) return [...approaches];

  const scored = approaches.map((a) => ({
    ...a,
    score: hashSeed(`${seed}:${a.id}`),
  }));
  scored.sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  return scored.slice(0, count).map(({ id, name }) => ({ id, name }));
}

function hashSeed(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}
