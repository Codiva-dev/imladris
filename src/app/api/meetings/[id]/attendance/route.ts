import { NextResponse } from "next/server";
import type { AttendanceStatus } from "@prisma/client";
import {
  getMembershipForUser,
  rejectIfSealed,
  requireSessionUser,
} from "@/lib/council-access";
import { prisma } from "@/lib/prisma";
import { isRitualSealed, RITUAL_SEAL_MESSAGE } from "@/lib/constants";

const STATUSES: AttendanceStatus[] = ["VOY", "TAL_VEZ", "NO_VOY"];

/** Confirmar asistencia al Consejo. */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: meetingId } = await context.params;
  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  const sealed = await rejectIfSealed(membership.councilId);
  if (sealed) return sealed;

  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, councilId: membership.councilId },
    select: { id: true, phase: true, confirmedAt: true },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Reunión no encontrada" }, { status: 404 });
  }

  if (!meeting.confirmedAt) {
    return NextResponse.json(
      { error: "La fecha aún no está confirmada" },
      { status: 409 },
    );
  }

  if (
    meeting.phase === "CERRADO" ||
    meeting.phase === "BITACORA_ABIERTA" ||
    isRitualSealed(meeting.phase)
  ) {
    return NextResponse.json(
      {
        error: isRitualSealed(meeting.phase)
          ? RITUAL_SEAL_MESSAGE
          : "Ya no se puede cambiar la asistencia",
        sealed: isRitualSealed(meeting.phase) || undefined,
      },
      { status: 409 },
    );
  }

  const body = (await request.json()) as { status?: string };
  if (!body.status || !STATUSES.includes(body.status as AttendanceStatus)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const row = await prisma.meetingAttendance.upsert({
    where: {
      meetingId_userId: { meetingId, userId: user.id },
    },
    create: {
      meetingId,
      userId: user.id,
      status: body.status as AttendanceStatus,
    },
    update: { status: body.status as AttendanceStatus },
  });

  return NextResponse.json({ status: row.status });
}
