import { NextResponse } from "next/server";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";
import { prisma } from "@/lib/prisma";
import { formatHandle, publicLabel } from "@/lib/username";

/** Miembros del Consejo - visibles para quien pertenece al círculo. */
export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  const rows = await prisma.councilMember.findMany({
    where: { councilId: membership.councilId },
    orderBy: { joinedAt: "asc" },
    select: {
      role: true,
      joinedAt: true,
      hasOrganizedThisRound: true,
      user: {
        select: { id: true, name: true, username: true },
      },
    },
  });

  const members = rows.map((row) => ({
    userId: row.user.id,
    name: row.user.name,
    username: row.user.username,
    handle: formatHandle(row.user.username),
    label: publicLabel(row.user),
    role: row.role,
    joinedAt: row.joinedAt.toISOString(),
    hasOrganizedThisRound: row.hasOrganizedThisRound,
  }));

  return NextResponse.json({
    members,
    viewerRole: membership.role,
  });
}
