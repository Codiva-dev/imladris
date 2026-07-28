import { rankSlots } from "@/domains/coordination/matching-engine";
import { prisma } from "@/lib/prisma";
import { quorumPercent, setCouncilAndMeetingPhase } from "@/lib/council-access";

/**
 * Recalcula propuestas a partir de disponibilidades.
 * Si hay quórum en algún slot → QUORUM_ALCANZADO.
 */
export async function refreshMeetingProposals(meetingId: string) {
  const meeting = await prisma.meeting.findUniqueOrThrow({
    where: { id: meetingId },
    include: {
      slots: true,
      availabilities: true,
      council: {
        include: { members: true },
      },
    },
  });

  const memberCount = meeting.council.members.length;
  const q = quorumPercent(meeting.council.quorumThreshold);

  const slotInputs = meeting.slots.map((slot) => {
    const rows = meeting.availabilities.filter((a) => a.slotId === slot.id);
    return {
      id: slot.id,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      availableCount: rows.filter((r) => r.status === "DISPONIBLE").length,
      maybeCount: rows.filter((r) => r.status === "TAL_VEZ").length,
    };
  });

  const ranked = rankSlots(memberCount, q, slotInputs);

  await prisma.dateProposal.deleteMany({ where: { meetingId } });

  if (ranked.length > 0) {
    await prisma.dateProposal.createMany({
      data: ranked.map((r) => ({
        meetingId,
        slotId: r.id,
        attendeeCount: r.availableCount,
        score: r.score,
        rank: r.rank,
        confirmed: false,
      })),
    });

    if (
      meeting.phase === "DISPONIBILIDAD" ||
      meeting.phase === "QUORUM_ALCANZADO"
    ) {
      await setCouncilAndMeetingPhase(
        meeting.councilId,
        meetingId,
        "QUORUM_ALCANZADO",
      );
    }
  }

  return ranked;
}
