import { headers } from "next/headers";
import type { CouncilPhase, QuorumThreshold } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { QuorumPercent } from "@/lib/constants";

const QUORUM_MAP: Record<QuorumThreshold, QuorumPercent> = {
  P60: 60,
  P70: 70,
  P75: 75,
  P80: 80,
  P85: 85,
  P90: 90,
  P100: 100,
};

export function quorumPercent(threshold: QuorumThreshold): QuorumPercent {
  return QUORUM_MAP[threshold];
}

export async function requireSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return session.user;
}

export async function getMembershipForUser(userId: string) {
  return prisma.councilMember.findFirst({
    where: { userId },
    include: {
      council: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { joinedAt: "asc" },
  });
}

/** Reunión activa = no cerrada / no bitácora finalizada. */
export async function getActiveMeeting(councilId: string) {
  return prisma.meeting.findFirst({
    where: {
      councilId,
      phase: {
        notIn: ["CERRADO", "BITACORA_ABIERTA"],
      },
    },
    include: {
      slots: { orderBy: { startsAt: "asc" } },
      proposals: {
        orderBy: { rank: "asc" },
        include: { slot: true },
      },
      availabilities: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function setCouncilAndMeetingPhase(
  councilId: string,
  meetingId: string,
  phase: CouncilPhase,
) {
  await prisma.$transaction([
    prisma.council.update({
      where: { id: councilId },
      data: { phase },
    }),
    prisma.meeting.update({
      where: { id: meetingId },
      data: { phase },
    }),
  ]);
}

export function appOrigin() {
  return (process.env.BETTER_AUTH_URL ?? "https://imladris.online").replace(
    /\/$/,
    "",
  );
}
