import { NextResponse } from "next/server";
import {
  appOrigin,
  getActiveMeeting,
  getMembershipForUser,
  quorumPercent,
  requireSessionUser,
} from "@/lib/council-access";
import { joinUrl } from "@/lib/invitations";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  let joinToken = membership.council.joinToken;
  if (!joinToken) {
    const updated = await prisma.council.update({
      where: { id: membership.councilId },
      data: { joinToken: crypto.randomUUID().replace(/-/g, "") },
      select: { joinToken: true },
    });
    joinToken = updated.joinToken;
  }

  const meeting = await getActiveMeeting(membership.councilId);
  const memberCount = await prisma.councilMember.count({
    where: { councilId: membership.councilId },
  });
  const myAvailabilities =
    meeting?.availabilities
      .filter((a) => a.userId === user.id)
      .map((a) => ({ slotId: a.slotId, status: a.status })) ?? [];

  const respondents = new Set(
    meeting?.availabilities.map((a) => a.userId) ?? [],
  );

  const isOrganizer = membership.role === "ORGANIZADOR";

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
    role: membership.role,
    council: {
      id: membership.council.id,
      name: membership.council.name,
      phase: membership.council.phase,
      quorum: quorumPercent(membership.council.quorumThreshold),
      memberCount,
      joinUrl: isOrganizer ? joinUrl(appOrigin(), joinToken) : null,
    },
    meeting: meeting
      ? {
          id: meeting.id,
          phase: meeting.phase,
          location: meeting.location,
          startsAt: meeting.startsAt,
          endsAt: meeting.endsAt,
          confirmedAt: meeting.confirmedAt,
          slots: meeting.slots.map((s) => ({
            id: s.id,
            startsAt: s.startsAt,
            endsAt: s.endsAt,
          })),
          proposals: meeting.proposals.map((p) => ({
            id: p.id,
            slotId: p.slotId,
            rank: p.rank,
            score: p.score,
            attendeeCount: p.attendeeCount,
            confirmed: p.confirmed,
            startsAt: p.slot.startsAt,
            endsAt: p.slot.endsAt,
          })),
          myAvailabilities,
          responseCount: respondents.size,
        }
      : null,
  });
}
