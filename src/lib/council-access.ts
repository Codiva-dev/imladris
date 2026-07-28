import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { CouncilPhase, QuorumThreshold } from "@prisma/client";
import { auth } from "@/lib/auth";
import {
  isRitualSealed,
  RITUAL_SEAL_MESSAGE,
  type QuorumPercent,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

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

/** Reunión activa = cualquier fase distinta de CERRADO (incluye bitácora abierta). */
export async function getActiveMeeting(councilId: string) {
  return prisma.meeting.findFirst({
    where: {
      councilId,
      phase: { not: "CERRADO" },
    },
    include: {
      slots: { orderBy: { startsAt: "asc" } },
      proposals: {
        orderBy: { rank: "asc" },
        include: { slot: true },
      },
      availabilities: true,
      attendances: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      selection: {
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
            },
          },
          approach: { select: { id: true, name: true } },
        },
      },
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

/** Lanza si el Consejo está en cuenta regresiva o en curso. */
export async function assertCouncilNotSealed(councilId: string) {
  const council = await prisma.council.findUnique({
    where: { id: councilId },
    select: { phase: true },
  });
  if (isRitualSealed(council?.phase)) {
    throw new SealError(RITUAL_SEAL_MESSAGE);
  }
}

export class SealError extends Error {
  constructor(message = RITUAL_SEAL_MESSAGE) {
    super(message);
    this.name = "SealError";
  }
}

/** Respuesta 423 si el Consejo está sellado; si no, null. */
export async function rejectIfSealed(councilId: string) {
  try {
    await assertCouncilNotSealed(councilId);
    return null;
  } catch (e) {
    if (e instanceof SealError) {
      return NextResponse.json(
        { error: e.message, sealed: true },
        { status: 423 },
      );
    }
    throw e;
  }
}

export function appOrigin() {
  return (process.env.BETTER_AUTH_URL ?? "https://imladris.online").replace(
    /\/$/,
    "",
  );
}
