import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { MemberRole } from "@prisma/client";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function createInviteToken() {
  return randomBytes(32).toString("base64url");
}

export async function createInvitation(input: {
  councilId: string;
  email: string;
  role?: MemberRole;
  invitedById: string;
}) {
  const email = input.email.trim().toLowerCase();

  const existingMember = await prisma.councilMember.findFirst({
    where: {
      councilId: input.councilId,
      user: { email },
    },
  });

  if (existingMember) {
    throw new Error("Esa persona ya pertenece al Consejo.");
  }

  await prisma.invitation.updateMany({
    where: {
      councilId: input.councilId,
      email,
      status: "PENDING",
    },
    data: { status: "REVOKED" },
  });

  const token = createInviteToken();

  return prisma.invitation.create({
    data: {
      councilId: input.councilId,
      email,
      role: input.role ?? "MIEMBRO",
      token,
      invitedById: input.invitedById,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
  });
}

export async function getInvitationByToken(token: string) {
  return prisma.invitation.findUnique({
    where: { token },
    include: {
      council: { select: { id: true, name: true } },
      invitedBy: { select: { name: true } },
    },
  });
}

export function invitationIsAcceptable(
  invitation: {
    status: string;
    expiresAt: Date;
  } | null,
) {
  if (!invitation) return false;
  if (invitation.status !== "PENDING") return false;
  if (invitation.expiresAt.getTime() <= Date.now()) return false;
  return true;
}

export function inviteUrl(origin: string, token: string) {
  return `${origin}/invitar/${token}`;
}

export function joinUrl(origin: string, joinToken: string) {
  return `${origin}/unirse/${joinToken}`;
}

export async function getCouncilByJoinToken(joinToken: string) {
  return prisma.council.findUnique({
    where: { joinToken },
    select: {
      id: true,
      name: true,
      joinToken: true,
      members: {
        where: { role: "ORGANIZADOR" },
        take: 1,
        select: { userId: true },
      },
    },
  });
}

