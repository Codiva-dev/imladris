import { describe, expect, it } from "vitest";
import { quorumReached, rankSlots } from "./matching-engine";

describe("rankSlots", () => {
  const slots = [
    {
      id: "a",
      startsAt: new Date("2030-01-01T19:00:00Z"),
      endsAt: new Date("2030-01-01T21:00:00Z"),
      availableCount: 8,
      maybeCount: 0,
    },
    {
      id: "b",
      startsAt: new Date("2030-01-02T19:00:00Z"),
      endsAt: new Date("2030-01-02T21:00:00Z"),
      availableCount: 5,
      maybeCount: 2,
    },
    {
      id: "c",
      startsAt: new Date("2030-01-03T19:00:00Z"),
      endsAt: new Date("2030-01-03T21:00:00Z"),
      availableCount: 3,
      maybeCount: 0,
    },
  ];

  it("solo incluye franjas que cumplen quórum", () => {
    const ranked = rankSlots(10, 80, slots);
    expect(ranked.map((s) => s.id)).toEqual(["a"]);
  });

  it("ordena por score descendente", () => {
    const ranked = rankSlots(10, 50, slots);
    expect(ranked[0]?.id).toBe("a");
    expect(ranked[0]?.rank).toBe(1);
    expect(ranked.every((s) => s.stars >= 1 && s.stars <= 5)).toBe(true);
  });

  it("devuelve vacío si no hay miembros", () => {
    expect(rankSlots(0, 80, slots)).toEqual([]);
  });
});

describe("quorumReached", () => {
  it("exige el techo del porcentaje", () => {
    expect(quorumReached(10, 80, 8)).toBe(true);
    expect(quorumReached(10, 80, 7)).toBe(false);
  });
});
