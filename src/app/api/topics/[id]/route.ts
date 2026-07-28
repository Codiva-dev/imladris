import { NextResponse } from "next/server";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";
import { prisma } from "@/lib/prisma";

/** Archivar / reactivar tema. */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { status?: "ACTIVO" | "ARCHIVADO" };

  if (body.status !== "ACTIVO" && body.status !== "ARCHIVADO") {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const topic = await prisma.topic.findFirst({
    where: { id, councilId: membership.councilId },
  });
  if (!topic) {
    return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 });
  }

  const updated = await prisma.topic.update({
    where: { id: topic.id },
    data: { status: body.status },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      timesUsed: true,
    },
  });

  return NextResponse.json({ topic: updated });
}
