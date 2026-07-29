import { describe, expect, it } from "vitest";
import {
  DEFAULT_RULES,
  filterTopicCandidates,
  pickApproaches,
  pickCandidates,
  type TopicCandidate,
} from "./rules-engine";

const topics: TopicCandidate[] = [
  {
    id: "1",
    title: "Libre albedrío",
    category: "Filosofía",
    status: "ACTIVO",
    lastSelectedAt: null,
    timesUsed: 0,
  },
  {
    id: "2",
    title: "Imperio romano",
    category: "Historia",
    status: "ACTIVO",
    lastSelectedAt: new Date(2026, 0, 1),
    timesUsed: 2,
  },
  {
    id: "3",
    title: "Ética de la IA",
    category: "Filosofía",
    status: "ACTIVO",
    lastSelectedAt: null,
    timesUsed: 1,
  },
  {
    id: "4",
    title: "Archivado",
    category: "Arte",
    status: "ARCHIVADO",
    lastSelectedAt: null,
    timesUsed: 0,
  },
];

describe("filterTopicCandidates", () => {
  it("excluye archivados y categoría consecutiva", () => {
    const eligible = filterTopicCandidates(
      topics,
      DEFAULT_RULES,
      "Filosofía",
      new Date(2026, 6, 1),
    );
    expect(eligible.map((t) => t.id)).toEqual(["2"]);
  });

  it("excluye temas recientes según noRepeatTopicMonths", () => {
    const eligible = filterTopicCandidates(
      topics,
      { ...DEFAULT_RULES, noConsecutiveCategory: false },
      null,
      new Date(2026, 2, 1),
    );
    expect(eligible.map((t) => t.id).sort()).toEqual(["1", "3"]);
  });
});

describe("pickCandidates", () => {
  it("prioriza menos usados", () => {
    const picked = pickCandidates(topics.filter((t) => t.status === "ACTIVO"), 2);
    expect(picked[0]?.id).toBe("1");
  });
});

describe("pickApproaches", () => {
  it("es determinista por seed", () => {
    const pool = [
      { id: "a", name: "Arte" },
      { id: "b", name: "Ciencia" },
      { id: "c", name: "Historia" },
      { id: "d", name: "Ética" },
    ];
    const a = pickApproaches(pool, 2, "meeting-1");
    const b = pickApproaches(pool, 2, "meeting-1");
    expect(a).toEqual(b);
    expect(a).toHaveLength(2);
  });
});
