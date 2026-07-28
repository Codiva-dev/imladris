import { NextResponse } from "next/server";
import { buildMeetingCandidates } from "@/domains/selection";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";
import { prisma } from "@/lib/prisma";

/** Candidatos de tema y enfoques según reglas del Consejo. */
export async function GET(
  _request: Request,
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

  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, councilId: membership.councilId },
    select: { id: true, phase: true, selection: { select: { id: true } } },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Reunión no encontrada" }, { status: 404 });
  }

  if (meeting.selection) {
    return NextResponse.json(
      { error: "El tema ya está seleccionado" },
      { status: 409 },
    );
  }

  if (meeting.phase !== "FECHA_CONFIRMADA") {
    return NextResponse.json(
      { error: "Aún no toca elegir tema" },
      { status: 409 },
    );
  }

  const payload = await buildMeetingCandidates(
    meeting.id,
    membership.councilId,
  );

  return NextResponse.json(payload);
}
