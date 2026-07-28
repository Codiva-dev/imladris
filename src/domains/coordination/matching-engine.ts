/**
 * Motor de coincidencias — busca el mejor escenario, no la unanimidad.
 * Nunca agenda: solo puntúa y ordena. El organizador confirma.
 */

export type SlotInput = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  availableCount: number;
  maybeCount?: number;
};

export type RankedSlot = SlotInput & {
  score: number;
  stars: 1 | 2 | 3 | 4 | 5;
  rank: number;
};

function clampStars(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score >= 0.95) return 5;
  if (score >= 0.85) return 4;
  if (score >= 0.7) return 3;
  if (score >= 0.55) return 2;
  return 1;
}

/**
 * @param memberCount — miembros del Consejo
 * @param quorumPercent — umbral (p.ej. 80)
 * @param slots — franjas con conteos de disponibilidad
 */
export function rankSlots(
  memberCount: number,
  quorumPercent: number,
  slots: SlotInput[],
): RankedSlot[] {
  if (memberCount <= 0) return [];

  const quorumNeeded = Math.ceil((quorumPercent / 100) * memberCount);

  const scored = slots.map((slot) => {
    const soft = (slot.maybeCount ?? 0) * 0.35;
    const effective = slot.availableCount + soft;
    const score = Math.min(1, effective / memberCount);
    return {
      ...slot,
      score,
      stars: clampStars(score),
      meetsQuorum: slot.availableCount >= quorumNeeded,
    };
  });

  return scored
    .filter((s) => s.meetsQuorum)
    .sort((a, b) => b.score - a.score || b.availableCount - a.availableCount)
    .map((slot, index) => ({
      id: slot.id,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      availableCount: slot.availableCount,
      maybeCount: slot.maybeCount,
      score: slot.score,
      stars: slot.stars,
      rank: index + 1,
    }));
}

export function quorumReached(
  memberCount: number,
  quorumPercent: number,
  confirmedCount: number,
): boolean {
  if (memberCount <= 0) return false;
  const needed = Math.ceil((quorumPercent / 100) * memberCount);
  return confirmedCount >= needed;
}
