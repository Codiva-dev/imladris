import { NextResponse } from "next/server";
import { advanceCouncilLifecycle } from "@/domains/reunion";
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

  await advanceCouncilLifecycle(membership.councilId);

  let joinToken = membership.council.joinToken;
  if (!joinToken) {
    const updated = await prisma.council.update({
      where: { id: membership.councilId },
      data: { joinToken: crypto.randomUUID().replace(/-/g, "") },
      select: { joinToken: true },
    });
    joinToken = updated.joinToken;
  }

  const council = await prisma.council.findUniqueOrThrow({
    where: { id: membership.councilId },
  });

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
      id: council.id,
      name: council.name,
      phase: council.phase,
      quorum: quorumPercent(council.quorumThreshold),
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
          bitacoraOpensAt: meeting.bitacoraOpensAt,
          bitacoraClosesAt: meeting.bitacoraClosesAt,
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
          attendance: {
            mine:
              meeting.attendances.find((a) => a.userId === user.id)?.status ??
              null,
            counts: {
              VOY: meeting.attendances.filter((a) => a.status === "VOY").length,
              TAL_VEZ: meeting.attendances.filter((a) => a.status === "TAL_VEZ")
                .length,
              NO_VOY: meeting.attendances.filter((a) => a.status === "NO_VOY")
                .length,
            },
            responses: meeting.attendances.map((a) => ({
              userId: a.userId,
              name: a.user.name,
              status: a.status,
            })),
          },
          selection: meeting.selection
            ? {
                topic: meeting.selection.topic,
                approach: meeting.selection.approach,
                optionalMaterial: meeting.selection.optionalMaterial,
                selectedAt: meeting.selection.selectedAt,
              }
            : null,
        }
      : null,
  });
}
