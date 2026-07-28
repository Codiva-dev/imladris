import { prisma } from "@/lib/prisma";

/**
 * Avanza la organización al siguiente miembro que aún no ha organizado
 * en esta ronda. Cuando todos han pasado, la ronda se reinicia.
 */
export async function advanceOrganizer(councilId: string) {
  const members = await prisma.councilMember.findMany({
    where: { councilId },
    orderBy: { joinedAt: "asc" },
    include: {
      user: { select: { id: true, name: true, username: true } },
    },
  });

  if (members.length === 0) return null;

  const current = members.find((m) => m.role === "ORGANIZADOR");
  if (!current) {
    // Sin organizador: nombrar al más antiguo
    const first = members[0]!;
    await prisma.councilMember.update({
      where: { id: first.id },
      data: { role: "ORGANIZADOR" },
    });
    return first.user;
  }

  if (members.length === 1) {
    return current.user;
  }

  await prisma.$transaction(async (tx) => {
    // Cierra el turno del actual
    await tx.councilMember.update({
      where: { id: current.id },
      data: {
        role: "MIEMBRO",
        hasOrganizedThisRound: true,
      },
    });

    let eligible = await tx.councilMember.findMany({
      where: {
        councilId,
        hasOrganizedThisRound: false,
        id: { not: current.id },
      },
      orderBy: { joinedAt: "asc" },
    });

    // Ronda completa: reiniciar y elegir al más antiguo que no sea el que acaba de salir
    // (si solo queda él tras reinicio, puede repetir)
    if (eligible.length === 0) {
      await tx.councilMember.updateMany({
        where: { councilId },
        data: { hasOrganizedThisRound: false },
      });
      eligible = await tx.councilMember.findMany({
        where: {
          councilId,
          id: { not: current.id },
        },
        orderBy: { joinedAt: "asc" },
      });
      if (eligible.length === 0) {
        // Un solo miembro
        await tx.councilMember.update({
          where: { id: current.id },
          data: { role: "ORGANIZADOR", hasOrganizedThisRound: false },
        });
        return;
      }
    }

    const next = eligible[0]!;
    await tx.councilMember.update({
      where: { id: next.id },
      data: { role: "ORGANIZADOR" },
    });
  });

  const nextOrganizer = await prisma.councilMember.findFirst({
    where: { councilId, role: "ORGANIZADOR" },
    include: {
      user: { select: { id: true, name: true, username: true } },
    },
  });

  return nextOrganizer?.user ?? null;
}

export async function getOrganizerRotation(councilId: string) {
  const members = await prisma.councilMember.findMany({
    where: { councilId },
    orderBy: { joinedAt: "asc" },
    include: {
      user: { select: { id: true, name: true, username: true } },
    },
  });

  const current = members.find((m) => m.role === "ORGANIZADOR") ?? null;
  const pending = members.filter(
    (m) => !m.hasOrganizedThisRound && m.role !== "ORGANIZADOR",
  );

  return {
    current: current
      ? {
          userId: current.userId,
          name: current.user.name,
          username: current.user.username,
        }
      : null,
    pendingCount: pending.length,
    servedCount: members.filter((m) => m.hasOrganizedThisRound).length,
    memberCount: members.length,
  };
}
