import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import {
  appOrigin,
  getMembershipForUser,
  rejectIfSealed,
  requireSessionUser,
} from "@/lib/council-access";
import { joinUrl } from "@/lib/invitations";
import { prisma } from "@/lib/prisma";

function newJoinToken() {
  return randomBytes(24).toString("base64url");
}

/** Rota el enlace permanente de unión (invalida el anterior). */
export async function POST() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  const sealed = await rejectIfSealed(membership.councilId);
  if (sealed) return sealed;

  const updated = await prisma.council.update({
    where: { id: membership.councilId },
    data: { joinToken: newJoinToken() },
    select: { joinToken: true },
  });

  return NextResponse.json({
    joinUrl: joinUrl(appOrigin(), updated.joinToken),
  });
}
